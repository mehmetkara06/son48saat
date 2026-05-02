import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calculator, AlertTriangle, CheckCircle, Zap, DollarSign, TrendingUp, Leaf, AlertCircle, Download, PlusCircle, Sun, Cloud, Wind, Clock, Search, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import L from 'leaflet';
import html2pdf from 'html2pdf.js';
import { supabase } from '../lib/supabase';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export async function calculateSolarROI(lat, lon, peakPower, systemLoss = 14, installationCost, electricityPrice) {
  // Open-Meteo Archive API - Son 1 yılın gerçek iklim verisini çek (CORS-free)
  // Bu sayede her konum kendine özgü güneşlenme, sıcaklık ve bulutluluk değerleri gösterir
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const endDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const startDate = `${now.getFullYear() - 1}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=shortwave_radiation_sum,sunshine_duration,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=auto`;
  const currentUrl  = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,cloud_cover,wind_speed_10m&timezone=auto`;

  const avg = arr => {
    const valid = (arr || []).filter(v => v !== null && v !== undefined);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };
  const stdDev = arr => {
    const m = avg(arr);
    if (m === null) return 0;
    const valid = (arr || []).filter(v => v !== null);
    return Math.sqrt(valid.reduce((s, v) => s + (v - m) ** 2, 0) / valid.length);
  };

  let meteoData = null;
  let yearlyProduction = null;
  let pvgisData = null;
  let isMock = false;

  try {
    const [archiveRes, currentRes] = await Promise.all([fetch(archiveUrl), fetch(currentUrl)]);

    let currentWeather = null;
    if (currentRes.ok) {
      const cur = await currentRes.json();
      currentWeather = cur.current;
    }

    if (!archiveRes.ok) throw new Error('Archive API hatası');
    const histData = await archiveRes.json();

    const dailyRadiation  = histData.daily?.shortwave_radiation_sum ?? [];
    const dailySunshine   = histData.daily?.sunshine_duration       ?? [];
    const dailyTempMax    = histData.daily?.temperature_2m_max      ?? [];
    const dailyTempMin    = histData.daily?.temperature_2m_min      ?? [];
    const dailyWindMax    = histData.daily?.wind_speed_10m_max      ?? [];

    const avgWindSpeed    = Math.round((avg(dailyWindMax) ?? 12) * 10) / 10; // km/h yıllık ort. maks.

    const avgRadiation    = avg(dailyRadiation);   // kWh/m²/gün
    const avgSunshineHrs  = (avg(dailySunshine) ?? 36000) / 3600;  // saat
    const avgTempMax      = avg(dailyTempMax) ?? 28;
    const avgTempMin      = avg(dailyTempMin) ?? 15;
    const avgTemp         = (avgTempMax + avgTempMin) / 2;

    // Güneşlenme süresinden bulutluluk tahmini
    // Maksimum teorik güneşlenme ~12 saat/gün; az güneş = fazla bulut
    const estimatedCloudCover = Math.max(0, Math.min(95, (1 - avgSunshineHrs / 12) * 100));

    // Üretim standart sapması (yıllık risk göstergesi)
    const radStdDev = stdDev(dailyRadiation);

    // Yıllık enerji üretimi (kWh)
    if (!avgRadiation) throw new Error('Radyasyon verisi yok');
    const efficiencyFactor = (1 - systemLoss / 100) * 0.87;
    yearlyProduction = peakPower * avgRadiation * 365 * efficiencyFactor;

    // generateReport ile uyumlu meteoData yapısı
    meteoData = {
      current: {
        temperature_2m: currentWeather?.temperature_2m ?? Math.round(avgTemp * 10) / 10,
        cloud_cover:    currentWeather?.cloud_cover    ?? Math.round(estimatedCloudCover),
        wind_speed_10m: currentWeather?.wind_speed_10m ?? avgWindSpeed
      },
      daily: {
        sunshine_duration: [avgSunshineHrs * 3600]
      },
      yearly: {
        avgTemp:         Math.round(avgTemp * 10) / 10,
        avgSunshineHrs:  Math.round(avgSunshineHrs * 10) / 10,
        avgCloudCover:   Math.round(estimatedCloudCover),
        avgWindSpeed:    avgWindSpeed
      }
    };

    // PVGIS benzeri risk verisi
    const sdY = radStdDev * peakPower * 365 * efficiencyFactor;
    pvgisData = {
      SD_y: sdY,
      l_tg: -(avgTemp > 25 ? 8.5 + (avgTemp - 25) * 0.3 : 7.5)  // sıcak bölgede daha yüksek termal kayıp
    };

  } catch (error) {
    console.warn('API Hatası, konum bazlı tahmin kullanılıyor:', error);
    isMock = true;

    // Enlem bazlı yedek tahmin (Güney Türkiye ~1800, Kuzey ~1300 kWh/kWp)
    const latDiff = Math.abs(lat - 36);
    const baseKwhKwp = Math.max(1300, 1800 - latDiff * 35);
    yearlyProduction = peakPower * baseKwhKwp;

    // Enlem bazlı iklim tahmini — rüzgar kuzey/yüksek enlemlerde genellikle daha güçlü
    const estSunshine   = Math.max(6, 11 - latDiff * 0.3);
    const estCloudCover = Math.min(70, 20 + latDiff * 4);
    const estTemp       = Math.max(12, 25 - latDiff * 0.8);
    const estWindSpeed  = Math.min(40, 10 + latDiff * 0.5); // kuzey = daha rüzgarlı

    meteoData = {
      current: { temperature_2m: estTemp, cloud_cover: estCloudCover, wind_speed_10m: estWindSpeed },
      daily:   { sunshine_duration: [estSunshine * 3600] },
      yearly:  { avgTemp: estTemp, avgSunshineHrs: estSunshine, avgCloudCover: estCloudCover, avgWindSpeed: estWindSpeed }
    };

    pvgisData = {
      SD_y: yearlyProduction * 0.05,
      l_tg: -(7.5 + Math.max(0, estTemp - 25) * 0.3)
    };
  }

  return generateReport(yearlyProduction, installationCost, electricityPrice, isMock, meteoData, pvgisData);
}

function generateReport(yearlyProduction, installationCost, electricityPrice, isMock, meteoData, pvgisData) {
  // Yıllık ortalamalar varsa onları kullan (daha anlamlı ve lokasyona özgü)
  const cloudCover  = meteoData?.yearly?.avgCloudCover   ?? meteoData?.current?.cloud_cover    ?? 20;
  const temperature = meteoData?.yearly?.avgTemp          ?? meteoData?.current?.temperature_2m ?? 25;
  const windSpeed   = meteoData?.yearly?.avgWindSpeed     ?? meteoData?.current?.wind_speed_10m ?? 12;
  const sunshineHrs = meteoData?.yearly?.avgSunshineHrs;
  const sunshineSeconds = meteoData?.daily?.sunshine_duration?.[0] ?? 36000;
  const sunshineHours   = sunshineHrs != null ? String(sunshineHrs) : (sunshineSeconds / 3600).toFixed(1);

  // Sıcaklık ve bulutluluğa göre dinamik verim (Efficiency)
  let tempPenalty  = temperature > 25 ? (temperature - 25) * 0.004 : 0; // 25°C üstü her derece çin %0.4 kayıp
  let cloudPenalty = (cloudCover / 100) * 0.1;                           // max %10 üretim kaybı
  // Rüzgar soğutma bonusu: panel sıcaklığını düşürerek verimliliği hafifçe artırır
  // >20 km/h rüzgar → max %2 verim artışı (%0.1 / km/h)
  let windBonus    = windSpeed > 10 ? Math.min(0.02, (windSpeed - 10) * 0.001) : 0;

  const adjustedYearlyProduction = yearlyProduction * (1 - tempPenalty - cloudPenalty + windBonus);

  const yearlySavings = adjustedYearlyProduction * electricityPrice;
  const roiYears = installationCost / yearlySavings;
  const carbonOffsetTons = (adjustedYearlyProduction * 0.4) / 1000;

  const sdY = pvgisData?.SD_y ?? (yearlyProduction * 0.05);
  const lTg = pvgisData?.l_tg ?? -8.0;

  // 4 Katmanlı Risk Analizi — 0-25 puan aralığı, 5 seviyeli sınıflandırma

  // 1. Üretim İstikrarsızlığı — Yıllık ortalama bulutluluktan türetiliyor
  //    Antalya %22 bulut → ~7     Rize %63 → ~15     Antarktika %90 → ~20
  let productionRisk = 2 + (cloudCover * 0.22);
  productionRisk = Math.min(25, Math.max(2, productionRisk));

  // 2. Termal Kayıp Riski — Yıllık ortalama sıcaklıktan türetiliyor
  //    Şanlıurfa 33°C → ~18     Antalya 19°C → ~9     Antarktika -30°C → ~7
  let thermalRisk = Math.abs(lTg);
  if (temperature > 35) thermalRisk += 8;
  else if (temperature > 30) thermalRisk += 5;
  else if (temperature > 25) thermalRisk += 2;
  else if (temperature < 5)  thermalRisk -= 1;
  // Güçlü rüzgar paneli soğutarak termal riski hafifletir (>15 km/h → max -2 puan)
  const windCoolingReduction = windSpeed > 15 ? Math.min(2, (windSpeed - 15) * 0.08) : 0;
  thermalRisk = Math.min(25, Math.max(5, thermalRisk - windCoolingReduction));

  // 3. Meteorolojik Sapma — Bulutluluk + Güneşlenme eksikliği + Rüzgar yapısal riski
  //    >20 km/h rüzgar: panel ve montaj sistemine mekanik stres → risk artar
  const sunshineFactor = sunshineHours
    ? Math.max(0, (12 - parseFloat(sunshineHours)) / 12)
    : 0.5;
  // Rüzgar yapısal riski: 20 km/h altında etkisiz, üstte her km/h +0.1 risk puanı (max +5)
  const windStructuralRisk = windSpeed > 20 ? Math.min(5, (windSpeed - 20) * 0.1) : 0;
  let meteorologicalRisk = 3 + (cloudCover * 0.14) + (sunshineFactor * 14) + windStructuralRisk;
  meteorologicalRisk = Math.min(25, Math.max(3, meteorologicalRisk));

  // 4. Finansal Dalgalanma — ROI yılına bağlı
  //    3 yıl → ~7     5 yıl → ~9.5     8 yıl → ~12.5     15+ yıl → ~20
  let financialRisk = 4 + Math.min(16, roiYears * 1.1);
  financialRisk = Math.min(25, Math.max(4, financialRisk));

  const avgRisk = (productionRisk + thermalRisk + meteorologicalRisk + financialRisk) / 4;

  // 5 Seviyeli Risk Sınıflandırması
  // Antalya   → ~8.5  → Düşük
  // Rize      → ~14   → Yüksek
  // Antarktika→ ~19   → Çok Yüksek
  // Sahara    → ~8    → Düşük (güneşli ama sıcak, dengeli)
  let totalRiskLevel = "Çok Düşük";
  if (avgRisk > 6  && avgRisk <= 9)  totalRiskLevel = "Düşük";
  if (avgRisk > 9  && avgRisk <= 13) totalRiskLevel = "Orta";
  if (avgRisk > 13 && avgRisk <= 17) totalRiskLevel = "Yüksek";
  if (avgRisk > 17)                  totalRiskLevel = "Çok Yüksek";

  const cashFlowData = [];
  let cumulative = -installationCost;
  
  for(let i = 0; i <= 25; i++) {
    if(i === 0) {
      cashFlowData.push({ year: `Yıl ${i}`, nakitAkisi: cumulative });
    } else {
      const degradation = Math.pow(0.995, i);
      const priceIncrease = Math.pow(1.03, i);
      const currentYearSaving = adjustedYearlyProduction * degradation * (electricityPrice * priceIncrease);
      cumulative += currentYearSaving;
      cashFlowData.push({ year: `Yıl ${i}`, nakitAkisi: Math.round(cumulative) });
    }
  }

  return {
    success: true,
    isMock,
    meteo: {
      cloudCover:    Math.round(cloudCover),
      temperature:   Math.round(temperature * 10) / 10,
      windSpeed:     Math.round(windSpeed * 10) / 10,
      sunshineHours: parseFloat(parseFloat(sunshineHours).toFixed(1))
    },
    data: {
      yearlyProductionKwh: Math.round(adjustedYearlyProduction),
      yearlySavingsUsd:    Math.round(yearlySavings),
      roiYears:            Number(roiYears.toFixed(1)),
      carbonOffsetTons:    Number(carbonOffsetTons.toFixed(1)),
      totalProfit25Y:      cashFlowData[25].nakitAkisi,
      cashFlowData,
      riskScores: {
        production:      Number(productionRisk.toFixed(1)),
        thermal:         Number(thermalRisk.toFixed(1)),
        meteorological:  Number(meteorologicalRisk.toFixed(1)),
        financial:       Number(financialRisk.toFixed(1)),
        totalRiskLevel
      }
    }
  };
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Seçilen Proje Alanı <br/> {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</Popup>
    </Marker>
  );
}

// Haritayı program aracılığıyla belirtilen koordinata odağlayan yardımcı bileşen
function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 14, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

function AnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  // Harita arama kutusu state'leri
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState([]);
  const [searchLoading, setSearchLoading]     = useState(false);
  const [mapFlyTarget, setMapFlyTarget]       = useState(null);
  const searchTimerRef                        = useRef(null);
  const resultsRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const newProject = {
        title: `Yeni ${form.investmentType.toUpperCase()} GES Projesi`,
        location: addressName,
        coords: [position.lat, position.lng],
        capacity: `${form.capacity} kWp`,
        roi: `${result.data.roiYears} Yıl`,
        funding_progress: 0,
        min_investment: '$500',
        total_cost: `$${(form.capacity * 800).toLocaleString('en-US')}`,
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600',
        featured: false,
        type: 'solar',
        risk_scores: result.data.riskScores,
        meteo: result.meteo,
        feasibility: {
          status: 'Yeni Oluşturuldu',
          ced: 'Değerlendirmede',
          gridConnection: 'Başvuru Yapılacak',
          annualProduction: `${(result.data.yearlyProductionKwh / 1000).toFixed(1)} MWh`,
          co2Reduction: `${result.data.carbonOffsetTons} Ton / Yıl`,
          description: 'Bu proje SunShare analiz aracı kullanılarak geliştirici tarafından yeni oluşturulmuştur ve fonlamaya açılmak üzere onay beklemektedir.'
        }
      };

      const { error } = await supabase.from('projects').insert([newProject]);

      if (error) throw error;

      alert('Projeniz başarıyla oluşturuldu ve Pazar Yerine eklendi!');
    } catch (err) {
      console.error('Supabase Error:', err);
      alert('Proje kaydedilirken bir hata oluştu: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    
    const reportHtml = `
      <div style="font-family: Arial, sans-serif; color: #000; padding: 40px; line-height: 1.6; background: white;">
        <h1 style="text-align: center; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">SUNSHARE - NİHAİ FİZİBİLİTE RAPORU</h1>
        <p style="text-align: right; color: #555;"><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
        
        <h3 style="color: #3b82f6; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">1. Proje Özeti</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 40%; background: #f9f9f9;">Proje Lokasyonu</td><td style="padding: 10px; border: 1px solid #eee;">${addressName}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Yatırım Tipi</td><td style="padding: 10px; border: 1px solid #eee;">${form.investmentType.toUpperCase()} GES</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Kullanılacak Alan</td><td style="padding: 10px; border: 1px solid #eee;">${form.area} m²</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Kurulu Güç (Kapasite)</td><td style="padding: 10px; border: 1px solid #eee;">${form.capacity} kWp</td></tr>
        </table>

        <h3 style="color: #3b82f6; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">2. Finansal ve Teknik Analiz</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 40%; background: #f9f9f9;">Yıllık Enerji Üretimi</td><td style="padding: 10px; border: 1px solid #eee;">${result?.data?.yearlyProductionKwh.toLocaleString()} kWh</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Yıllık Finansal Tasarruf</td><td style="padding: 10px; border: 1px solid #eee;">$${result?.data?.yearlySavingsUsd.toLocaleString()}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Amortisman Süresi (ROI)</td><td style="padding: 10px; border: 1px solid #eee;">${result?.data?.roiYears} Yıl</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">25 Yıllık Net Kâr Projeksiyonu</td><td style="padding: 10px; border: 1px solid #eee;">$${result?.data?.totalProfit25Y.toLocaleString()}</td></tr>
        </table>

        <h3 style="color: #3b82f6; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">3. Çevresel Etki ve Risk Durumu</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 40%; background: #f9f9f9;">Yıllık CO2 Tasarrufu</td><td style="padding: 10px; border: 1px solid #eee;">${result?.data?.carbonOffsetTons} Ton</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Genel Risk Seviyesi</td><td style="padding: 10px; border: 1px solid #eee;">${result?.data?.riskScores.totalRiskLevel}</td></tr>
        </table>

        <p style="margin-top: 40px; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; text-align: justify;">
          Bu belge SunShare algoritmaları ve açık kaynak iklim verileri kullanılarak otomatik üretilmiştir. Resmi ve kesin bağlayıcılığı bulunmamakla birlikte, yatırım kararları için bilimsel bir ön değerlendirme niteliği taşır. Gerçek değerler, sistem kayıpları ve piyasa koşullarına göre değişiklik gösterebilir.
        </p>
      </div>
    `;

    const opt = {
      margin:       10,
      filename:     `Yeni_Proje_Nihai_Fizibilite.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    const tempElement = document.createElement('div');
    tempElement.innerHTML = reportHtml;
    
    html2pdf().from(tempElement).set(opt).save().then(() => {
      setIsDownloading(false);
    });
  };
  
  const [position, setPosition] = useState({ lat: 38.4237, lng: 27.1428 });
  const [addressName, setAddressName] = useState('İzmir');

  useEffect(() => {
    const fetchAddress = async () => {
      setAddressName('Adres aranıyor...');
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
        const data = await res.json();
        if (data && data.address) {
          const city = data.address.city || data.address.province || data.address.state || '';
          const district = data.address.town || data.address.county || data.address.district || '';
          setAddressName([district, city].filter(Boolean).join(', ') || 'Türkiye');
        } else {
          setAddressName('Bilinmeyen Konum');
        }
      } catch (err) {
        setAddressName('Konum bulunamadı');
      }
    };
    
    // Hızlı tıklamaları (debounce) yönetmek için timeout ekliyoruz
    const timerId = setTimeout(() => {
      fetchAddress();
    }, 500);

    return () => clearTimeout(timerId);
  }, [position]);

  const [form, setForm] = useState({
    investmentType: 'ticari',
    area: 600,
    capacity: 100,
    price: 0.22
  });

  // Nominatim tabanlı konum arama fonksiyonu
  const handleLocationSearch = (query) => {
    setSearchQuery(query);
    clearTimeout(searchTimerRef.current);
    if (!query.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=tr`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (_) { setSearchResults([]); }
      setSearchLoading(false);
    }, 400);
  };

  // Arama sonucuna tıklandığında: haritayı uç, marker'ı güncelle, adres alanını doldur
  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newPos = { lat, lng };
    setPosition(newPos);
    setMapFlyTarget(newPos);
    setAddressName(result.display_name.split(',').slice(0, 3).join(', '));
    setSearchQuery(result.display_name.split(',')[0]);
    setSearchResults([]);
  };

  const handleCalculate = async () => {

    setLoading(true);
    setError(null);
    try {
      const typeConfig = {
        ticari: { costPerKwp: 850 },
        konut: { costPerKwp: 1000 },
        kamu: { costPerKwp: 800 },
        arsa: { costPerKwp: 700 }
      }[form.investmentType];

      const calculatedCost = form.capacity * typeConfig.costPerKwp;
      const electricityPrice = form.price;

      const res = await calculateSolarROI(position.lat, position.lng, form.capacity, 14, calculatedCost, electricityPrice);
      if (res.success) {
        setResult(res);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Yeni Proje Analizi</h1>
        <p className="text-gray-400 mt-2 text-lg font-light">Uydu üzerinden arsa seçin, kapasite girin ve PVGIS destekli analiz raporunuzu oluşturun.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[550px]">
        {/* Sidebar Form */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex-1 flex flex-col group hover:-translate-y-1 transition-transform duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              <Calculator className="w-32 h-32 text-brand-blue" />
            </div>
            
            <h2 className="text-2xl font-bold text-white flex items-center mb-8 relative z-10">
              <span className="w-2 h-8 bg-brand-blue rounded-full mr-3"></span>
              Parametreler
            </h2>
            
            <div className="space-y-6 relative z-10 flex-1">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">Yatırım Tipi</label>
                <div className="relative">
                  <select 
                    value={form.investmentType}
                    onChange={e => {
                      const typeConfig = {
                        ticari: { price: 0.22 },
                        konut: { price: 0.16 },
                        kamu: { price: 0.19 },
                        arsa: { price: 0.13 }
                      };
                      setForm({
                        ...form, 
                        investmentType: e.target.value,
                        price: typeConfig[e.target.value].price
                      });
                    }}
                    className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-white text-lg font-medium focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all appearance-none cursor-pointer"
                  >
                    <option value="ticari" className="bg-black text-white">Ticari Çatı GES</option>
                    <option value="konut" className="bg-black text-white">Konut Çatı GES</option>
                    <option value="kamu" className="bg-black text-white">Kamu Kurumu GES</option>
                    <option value="arsa" className="bg-black text-white">Arsa / Tarla (Arazi GES)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">Alan (Metrekare - m²)</label>
                <input 
                  type="number" 
                  value={form.area}
                  onChange={e => {
                     const area = Number(e.target.value);
                     const suggestedCapacity = Math.round(area / 6); // ~6m2 per 1 kWp
                     setForm({...form, area, capacity: suggestedCapacity});
                  }}
                  className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-white text-lg font-medium focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2 flex justify-between items-end">
                  <span>Kurulu Güç (kWp)</span>
                  <span className="text-[10px] text-brand-blue font-normal lowercase tracking-normal bg-brand-blue/10 px-2 py-0.5 rounded-full">Otomatik hesaplandı</span>
                </label>
                <input 
                  type="number" 
                  value={form.capacity}
                  onChange={e => setForm({...form, capacity: Number(e.target.value)})}
                  className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-white text-lg font-medium focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2 flex justify-between items-end">
                  <span>Elektrik Birim Fiyatı ($/kWh)</span>
                  <span className="text-[10px] text-brand-blue font-normal lowercase tracking-normal bg-brand-blue/10 px-2 py-0.5 rounded-full">Tipe göre eklendi</span>
                </label>
                <input 
                  type="number" step="0.01"
                  value={form.price}
                  onChange={e => setForm({...form, price: Number(e.target.value)})}
                  className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-white text-lg font-medium focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
              </div>
              
              <div className="pt-4 mt-auto">
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">Seçili Koordinatlar & Adres</label>
                <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-4 text-brand-blue flex flex-col gap-3">
                  <div className="font-mono flex items-center">
                    <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-semibold text-lg">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
                  </div>
                  <div className="text-sm font-medium text-brand-blue/80 bg-brand-blue/10 px-3 py-2 rounded-xl border border-brand-blue/20 flex items-center">
                    {addressName === 'Adres aranıyor...' ? (
                      <div className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    {addressName}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-start relative z-10">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button 
              onClick={handleCalculate}
              disabled={loading}
              className="w-full mt-8 py-4 bg-white text-black font-extrabold text-lg rounded-2xl hover:bg-brand-blue hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] relative z-10 hover:scale-[1.02]"
            >
              {loading ? 'Hesaplanıyor...' : 'Fizibilite Raporu Çıkar'}
            </button>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 glass-panel rounded-3xl overflow-hidden relative border border-white/5 z-0 p-2">
          <div className="w-full h-full rounded-[1.25rem] overflow-hidden relative">
            <MapContainer 
              center={[38.4237, 27.1428]} 
              zoom={14} 
              scrollWheelZoom={true} 
              className="w-full h-full"
              style={{ height: '100%', minHeight: '100%' }}
            >
              <TileLayer
                attribution='&copy; Google Maps'
                url="http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
                maxZoom={20}
              />
              <LocationMarker position={position} setPosition={setPosition} />
              <MapFlyTo target={mapFlyTarget} />
            </MapContainer>
            
            {/* Map Overlay Top */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 to-transparent z-[400] pointer-events-none"></div>
            
            {/* Map Overlay Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent z-[400] pointer-events-none"></div>

            {/* Arama Kutusu */}
            <div className="absolute top-4 left-4 right-4 z-[500]">
              <div className="relative">
                <div className="flex items-center bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-2xl focus-within:border-brand-blue/60 transition-all">
                  <Search className="w-5 h-5 text-brand-blue mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => handleLocationSearch(e.target.value)}
                    placeholder="Şehir, ilçe veya adres arayın... (örn: Karapınar, Konya)"
                    className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm font-medium"
                  />
                  {searchLoading && (
                    <div className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin ml-2 flex-shrink-0"></div>
                  )}
                  {searchQuery && !searchLoading && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="ml-2 text-gray-400 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Arama Sonuçları Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    {searchResults.map((res, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full text-left px-4 py-3 hover:bg-brand-blue/20 transition-colors border-b border-white/5 last:border-0 flex items-start gap-3"
                      >
                        <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white text-sm font-semibold leading-tight">{res.display_name.split(',')[0]}</div>
                          <div className="text-gray-400 text-xs mt-0.5 line-clamp-1">{res.display_name.split(',').slice(1, 4).join(', ')}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Results Dashboard */}
      {result && result.success && (
        <div ref={resultsRef} className="glass-panel p-8 md:p-10 rounded-3xl animate-in fade-in slide-in-from-bottom-10 duration-700 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/10">
            <h3 className="text-3xl font-bold text-white flex items-center">
              <span className="p-3 bg-brand-blue/10 rounded-2xl mr-4 border border-brand-blue/30">
                <CheckCircle className="w-8 h-8 text-brand-blue" />
              </span>
              Nihai Fizibilite Raporu
            </h3>
            {result.isMock ? (
              <span className="bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/30 font-bold text-sm mt-4 md:mt-0 flex items-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                Konum Bazlı Tahmin <AlertTriangle className="w-4 h-4 ml-2" />
              </span>
            ) : (
              <span className="bg-sun-green/10 text-sun-green px-4 py-2 rounded-full border border-sun-green/30 font-bold text-sm mt-4 md:mt-0 flex items-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                Open-Meteo Canlı Veri <CheckCircle className="w-4 h-4 ml-2" />
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Yıllık Üretim', value: `${result.data.yearlyProductionKwh.toLocaleString()} kWh`, icon: Zap, color: 'text-white' },
              { label: 'Yıllık Tasarruf', value: `$${result.data.yearlySavingsUsd.toLocaleString()}`, icon: DollarSign, color: 'text-sun-green' },
              { label: 'Amortisman (ROI)', value: `${result.data.roiYears} Yıl`, icon: TrendingUp, color: 'text-white' },
              { label: 'Karbon Ofset', value: `${result.data.carbonOffsetTons} Ton`, icon: Leaf, color: 'text-brand-blue' },
            ].map((stat, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:bg-white/[0.03] transition-colors">
                <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-3 flex items-center">
                  <stat.icon className="w-4 h-4 mr-2" /> {stat.label}
                </div>
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-sun-green" />
                Yatırımın Kendini Amorti Etme ve Kâra Geçiş Süreci
              </h4>
              <div className="h-80 w-full bg-black/20 rounded-3xl p-4 border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.data.cashFlowData}>
                    <defs>
                      <linearGradient id="colorNakit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis dataKey="year" stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} tickMargin={10} minTickGap={30} />
                    <YAxis stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => val < 0 ? `-$${Math.abs(val/1000).toFixed(0)}k` : `$${(val/1000).toFixed(0)}k`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', padding: '16px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: '900', fontSize: '18px' }}
                      labelStyle={{ color: '#9ca3af', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
                      formatter={(value) => [value < 0 ? `-$${Math.abs(value).toLocaleString()}` : `$${value.toLocaleString()}`, "Net Kazanç Durumu"]}
                    />
                    <ReferenceLine y={0} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" label={{ position: 'insideTopLeft', value: 'AMORTİSMAN NOKTASI (Maliyetin Çıkarıldığı An)', fill: '#10b981', fontSize: 11, fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="nakitAkisi" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorNakit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div id="pdf-action-buttons" className="mt-8 flex flex-col sm:flex-row gap-4 justify-start">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isDownloading || isPublishing}
                  className="px-6 py-3 bg-brand-blue/10 text-brand-blue border border-brand-blue/30 font-extrabold rounded-xl hover:bg-brand-blue hover:text-white transition-all duration-300 disabled:opacity-50 flex items-center shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95"
                >
                  {isDownloading ? (
                    <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Download className="w-5 h-5 mr-2" />
                  )}
                  {isDownloading ? 'PDF Hazırlanıyor...' : 'Raporu PDF Olarak İndir'}
                </button>

                <button 
                  onClick={handlePublish}
                  disabled={isDownloading || isPublishing}
                  className="px-6 py-3 bg-sun-green text-black font-extrabold rounded-xl hover:bg-emerald-400 transition-all duration-300 disabled:opacity-50 flex items-center shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95"
                >
                  {isPublishing ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <PlusCircle className="w-5 h-5 mr-2" />
                  )}
                  {isPublishing ? 'Oluşturuluyor...' : 'Projeyi Oluştur ve Pazara Ekle'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
               {/* Meteo Data API Results */}
               {result.meteo && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/[0.02] border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center group hover:bg-white/[0.04] transition-all">
                     <Sun className="w-6 h-6 text-yellow-400 mb-2" />
                     <div className="text-xl font-bold text-white">{result.meteo.temperature}°C</div>
                     <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Yıllık Ort. Sıcaklık</div>
                   </div>
                   <div className="bg-white/[0.02] border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center group hover:bg-white/[0.04] transition-all">
                     <Cloud className="w-6 h-6 text-gray-400 mb-2" />
                     <div className="text-xl font-bold text-white">%{result.meteo.cloudCover}</div>
                     <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Yıllık Ort. Bulutluluk</div>
                   </div>
                   <div className="bg-white/[0.02] border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center group hover:bg-white/[0.04] transition-all">
                     <Wind className="w-6 h-6 text-blue-400 mb-2" />
                     <div className="text-xl font-bold text-white">{result.meteo.windSpeed} km/s</div>
                     <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Anlık Rüzgar</div>
                   </div>
                   <div className="bg-white/[0.02] border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center group hover:bg-white/[0.04] transition-all">
                     <Clock className="w-6 h-6 text-orange-400 mb-2" />
                     <div className="text-xl font-bold text-white">{result.meteo.sunshineHours}s</div>
                     <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Yıllık Ort. Güneşlenme</div>
                   </div>
                 </div>
               )}

               <div className="bg-brand-blue/10 border border-brand-blue/20 p-8 rounded-3xl flex-1 flex flex-col justify-center relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[50px] group-hover:bg-brand-blue/40 transition-colors duration-700"></div>
                 <h4 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 relative z-10">25 Yıl Sonunda Toplam Net Kâr</h4>
                 <div className="text-5xl font-black text-white mb-4 tracking-tight relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                   ${result.data.totalProfit25Y.toLocaleString()}
                 </div>
                 <p className="text-sm text-brand-blue/80 font-medium leading-relaxed relative z-10">
                   * Yıllık %0.5 panel aşınma payı (degradation) ve %3 enerji fiyatı enflasyonu dahil edilerek hesaplanmıştır.
                 </p>
               </div>
               
               <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                 <div className="flex justify-between items-center mb-6">
                   <h4 className="text-white font-bold text-lg">Risk Seviyesi</h4>
                   <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
                      result.data.riskScores.totalRiskLevel === 'Çok Düşük' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      result.data.riskScores.totalRiskLevel === 'Düşük'     ? 'bg-sun-green/10 text-sun-green border-sun-green/20' :
                      result.data.riskScores.totalRiskLevel === 'Orta'      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      result.data.riskScores.totalRiskLevel === 'Yüksek'    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                     {result.data.riskScores.totalRiskLevel}
                   </span>
                 </div>
                 <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                        <span className="text-gray-500">Üretim İstikrarsızlığı</span>
                        <span className="text-white">%{result.data.riskScores.production}</span>
                      </div>
                      <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-purple-500 relative transition-all duration-1000" style={{ width: `${result.data.riskScores.production}%` }}>
                          <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                        <span className="text-gray-500">Termal Kayıp Riski</span>
                        <span className="text-white">%{result.data.riskScores.thermal}</span>
                      </div>
                      <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-red-500 relative transition-all duration-1000" style={{ width: `${result.data.riskScores.thermal}%` }}>
                          <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>
                   <div>
                     <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                       <span className="text-gray-500">Meteorolojik Sapma</span>
                       <span className="text-white">%{result.data.riskScores.meteorological}</span>
                     </div>
                     <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-brand-blue relative transition-all duration-1000" style={{ width: `${result.data.riskScores.meteorological}%` }}>
                         <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                       </div>
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                       <span className="text-gray-500">Finansal Dalgalanma</span>
                       <span className="text-white">%{result.data.riskScores.financial}</span>
                     </div>
                     <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-sun-green relative transition-all duration-1000" style={{ width: `${result.data.riskScores.financial}%` }}>
                         <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisPage;
