import React, { useState } from 'react';
import { MapPin, Calculator, AlertTriangle, CheckCircle, Zap, DollarSign, TrendingUp, Leaf, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export async function calculateSolarROI(lat, lon, peakPower, systemLoss = 14, installationCost, electricityPrice) {
  try {
    const pvgisUrl = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=${peakPower}&loss=${systemLoss}&outputformat=json`;
    const response = await fetch(pvgisUrl);
    if (!response.ok) throw new Error(`PVGIS Hatası: ${response.statusText}`);
    
    const data = await response.json();
    const yearlyProduction = data.outputs.totals.fixed.E_y;
    return generateReport(yearlyProduction, installationCost, electricityPrice, false);

  } catch (error) {
    console.warn("PVGIS API Hatası, Mock veri kullanılıyor...", error);
    const mockYearlyProduction = peakPower * 1450; 
    return generateReport(mockYearlyProduction, installationCost, electricityPrice, true);
  }
}

function generateReport(yearlyProduction, installationCost, electricityPrice, isMock) {
  const yearlySavings = yearlyProduction * electricityPrice;
  const roiYears = installationCost / yearlySavings;
  const carbonOffsetTons = (yearlyProduction * 0.4) / 1000;

  const cashFlowData = [];
  let cumulative = -installationCost;
  
  for(let i = 0; i <= 25; i++) {
    if(i === 0) {
      cashFlowData.push({ year: `Yıl ${i}`, nakitAkisi: cumulative });
    } else {
      const degradation = Math.pow(0.995, i);
      const priceIncrease = Math.pow(1.03, i);
      const currentYearSaving = yearlyProduction * degradation * (electricityPrice * priceIncrease);
      cumulative += currentYearSaving;
      cashFlowData.push({ year: `Yıl ${i}`, nakitAkisi: Math.round(cumulative) });
    }
  }

  return {
    success: true,
    isMock,
    data: {
      yearlyProductionKwh: Number(yearlyProduction.toFixed(2)),
      yearlySavingsUsd: Number(yearlySavings.toFixed(2)),
      roiYears: Number(roiYears.toFixed(1)),
      carbonOffsetTons: Number(carbonOffsetTons.toFixed(2)),
      totalProfit25Y: cashFlowData[25].nakitAkisi,
      cashFlowData,
      riskScores: {
        meteorological: 12.5,
        financial: 8.0,
        totalRiskLevel: "Düşük"
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

function AnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [position, setPosition] = useState({ lat: 38.4237, lng: 27.1428 });
  const [form, setForm] = useState({
    capacity: 100,
    cost: 85000,
    price: 0.18
  });

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await calculateSolarROI(position.lat, position.lng, form.capacity, 14, form.cost, form.price);
      if (res.success) {
        setResult(res);
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
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">Kurulu Güç (kWp)</label>
                <input 
                  type="number" 
                  value={form.capacity}
                  onChange={e => setForm({...form, capacity: Number(e.target.value)})}
                  className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-white text-lg font-medium focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">Tahmini Maliyet ($)</label>
                <input 
                  type="number" 
                  value={form.cost}
                  onChange={e => setForm({...form, cost: Number(e.target.value)})}
                  className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-white text-lg font-medium focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">Elektrik Birim Fiyatı ($/kWh)</label>
                <input 
                  type="number" step="0.01"
                  value={form.price}
                  onChange={e => setForm({...form, price: Number(e.target.value)})}
                  className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-white text-lg font-medium focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                />
              </div>
              
              <div className="pt-4 mt-auto">
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">Seçili Koordinatlar</label>
                <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-4 text-brand-blue font-mono flex items-center">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span className="font-semibold text-lg">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
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
            </MapContainer>
            
            {/* Map Overlay Top */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-[400] pointer-events-none"></div>
            
            {/* Map Overlay Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent z-[400] pointer-events-none"></div>

            <div className="absolute top-6 left-6 z-[400] glass-pill px-4 py-2.5 flex items-center shadow-2xl">
              <MapPin className="w-4 h-4 text-brand-blue mr-2 animate-bounce" />
              <span className="font-bold text-sm text-white">Uydu Haritası Üzerinden Seçim Yapın</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Results Dashboard */}
      {result && result.success && (
        <div className="glass-panel p-8 md:p-10 rounded-3xl animate-in fade-in slide-in-from-bottom-10 duration-700 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/10">
            <h3 className="text-3xl font-bold text-white flex items-center">
              <span className="p-3 bg-brand-blue/10 rounded-2xl mr-4 border border-brand-blue/30">
                <CheckCircle className="w-8 h-8 text-brand-blue" />
              </span>
              Nihai Fizibilite Raporu
            </h3>
            {result.isMock ? (
              <span className="bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/30 font-bold text-sm mt-4 md:mt-0 flex items-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                Çevrimdışı Simülasyon <AlertTriangle className="w-4 h-4 ml-2" />
              </span>
            ) : (
              <span className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full border border-brand-blue/30 font-bold text-sm mt-4 md:mt-0 flex items-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                PVGIS Doğrulandı <CheckCircle className="w-4 h-4 ml-2" />
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
                <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
                25 Yıllık Nakit Akışı Projeksiyonu
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
                    <YAxis stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', padding: '16px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: '900', fontSize: '18px' }}
                      labelStyle={{ color: '#9ca3af', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, "Kümülatif Getiri"]}
                    />
                    <Area type="monotone" dataKey="nakitAkisi" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorNakit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-6">
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
                   <span className="bg-sun-green/10 text-sun-green px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-sun-green/20">
                     {result.data.riskScores.totalRiskLevel}
                   </span>
                 </div>
                 <div className="space-y-5">
                   <div>
                     <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                       <span className="text-gray-500">Meteorolojik Sapma</span>
                       <span className="text-white">%12.5</span>
                     </div>
                     <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-brand-blue w-[12.5%] relative">
                         <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                       </div>
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                       <span className="text-gray-500">Finansal Dalgalanma</span>
                       <span className="text-white">%8.0</span>
                     </div>
                     <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-sun-green w-[8%] relative">
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
