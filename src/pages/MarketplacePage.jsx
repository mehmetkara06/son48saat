import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, MapPin, Battery, PieChart, ArrowRight, Star, Map as MapIcon, Grid, X, FileText, CheckCircle, TrendingUp, Sun, Wind, Droplets, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon for SunShare
const sunshareIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const projects = [
  {
    id: 1,
    title: 'Güneş Tarlası Projesi - Karapınar',
    location: 'Konya, Türkiye',
    coords: [37.7183, 33.5483],
    capacity: '2.5 MWp',
    roi: '4.2 Yıl',
    fundingProgress: 75,
    minInvestment: '$500',
    totalCost: '$1,850,000',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600',
    featured: true,
    type: 'solar',
    feasibility: {
      status: 'Onaylandı',
      ced: 'Gerekli Değildir / Olumlu',
      gridConnection: 'Çağrı Mektubu Alındı',
      annualProduction: '3.750 MWh',
      co2Reduction: '1.500 Ton / Yıl',
      description: 'Karapınar bölgesinde yer alan arazi, Türkiye\'nin en yüksek güneşlenme süresine sahip bölgelerinden biridir. Eğimsiz arazi yapısı sayesinde kurulum maliyetleri minimuma indirilmiş olup, çift yönlü (bifacial) paneller kullanılarak üretim verimliliği %15 artırılmıştır. Projenin şebeke bağlantı noktasına uzaklığı sadece 1.2 km\'dir.'
    },
    riskScores: { production: 3.2, thermal: 10.5, meteorological: 7.0, financial: 8.0, totalRiskLevel: 'Düşük' }
  },
  {
    id: 2,
    title: 'Endüstriyel Çatı GES - OSB',
    location: 'Bursa, Türkiye',
    coords: [40.2285, 28.8931],
    capacity: '850 kWp',
    roi: '3.8 Yıl',
    fundingProgress: 42,
    minInvestment: '$250',
    totalCost: '$650,000',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=600',
    featured: false,
    type: 'solar',
    feasibility: {
      status: 'Kurulum Aşamasında',
      ced: 'Muaf',
      gridConnection: 'Onaylandı (Öz Tüketim)',
      annualProduction: '1.100 MWh',
      co2Reduction: '450 Ton / Yıl',
      description: 'Bursa Organize Sanayi Bölgesinde yer alan tekstil fabrikasının çatısına kurulacak olan sistem, fabrikanın gündüz enerji ihtiyacının %85\'ini karşılayacaktır. Öz tüketim modeli ile şebeke satış maliyetleri sıfırlanmış, endüstriyel tarife üzerinden sağlanan tasarruf ile amortisman süresi 3.8 yıla kadar düşürülmüştür.'
    },
    riskScores: { production: 4.1, thermal: 8.2, meteorological: 9.5, financial: 8.0, totalRiskLevel: 'Düşük' }
  },
  {
    id: 3,
    title: 'Tarımsal GES (Agrivoltaics)',
    location: 'Şanlıurfa, Türkiye',
    coords: [37.1674, 38.7955],
    capacity: '1.2 MWp',
    roi: '4.5 Yıl',
    fundingProgress: 90,
    minInvestment: '$1,000',
    totalCost: '$920,000',
    image: 'https://images.unsplash.com/photo-1545208942-e0c03dc8ea48?auto=format&fit=crop&q=80&w=600',
    featured: true,
    type: 'solar',
    feasibility: {
      status: 'Onaylandı',
      ced: 'Olumlu',
      gridConnection: 'Onay Aşamasında',
      annualProduction: '1.950 MWh',
      co2Reduction: '800 Ton / Yıl',
      description: 'Tarımsal arazilerin hem elektrik üretimi hem de tarım için eş zamanlı kullanıldığı Agrivoltaik sistemdir. Paneller, gölge seven tarım ürünleri (örneğin sera domatesi) için ideal ortamı sağlarken, buharlaşmayı azaltarak sulama suyundan %30 tasarruf sağlamaktadır. Bölgenin yüksek güneş radyasyonu verimliliği garanti etmektedir.'
    },
    riskScores: { production: 2.8, thermal: 14.2, meteorological: 5.5, financial: 8.0, totalRiskLevel: 'Düşük' }
  },
  {
    id: 4,
    title: 'Güneş Takip Sistemli GES',
    location: 'Ankara, Polatlı',
    coords: [39.5833, 31.9833],
    capacity: '3.0 MWp',
    roi: '4.6 Yıl',
    fundingProgress: 25,
    minInvestment: '$2,000',
    totalCost: '$2,200,000',
    image: 'https://images.unsplash.com/photo-1611365892502-8eebf1187c2c?auto=format&fit=crop&q=80&w=600',
    featured: false,
    type: 'solar',
    feasibility: {
      status: 'Kurulum Onaylandı',
      ced: 'Gerekli Değildir',
      gridConnection: 'Trafo Kapasitesi Ayrıldı',
      annualProduction: '5.200 MWh',
      co2Reduction: '2.100 Ton / Yıl',
      description: 'Güneşi doğuşundan batışına kadar takip eden (Single-Axis Tracker) sistemler kullanılarak standart sabit panellere göre %25 daha fazla enerji üretimi hedeflenmektedir. İç Anadolu\'nun düz arazisi ve yüksek ışınım oranları bu projeyi son derece verimli kılmaktadır.'
    },
    riskScores: { production: 3.5, thermal: 9.0, meteorological: 8.2, financial: 8.0, totalRiskLevel: 'Düşük' }
  },
  {
    id: 5,
    title: 'Otel Otopark Üstü GES',
    location: 'Antalya, Manavgat',
    coords: [36.7867, 31.4398],
    capacity: '1.5 MWp',
    roi: '3.5 Yıl',
    fundingProgress: 60,
    minInvestment: '$500',
    totalCost: '$1,100,000',
    image: 'https://images.unsplash.com/photo-1588591795084-1770cb3be374?auto=format&fit=crop&q=80&w=600',
    featured: true,
    type: 'solar',
    feasibility: {
      status: 'Bağlantı Anlaşması İmzalandı',
      ced: 'Muaf',
      gridConnection: 'Öz Tüketim',
      annualProduction: '2.400 MWh',
      co2Reduction: '950 Ton / Yıl',
      description: 'Antalya Manavgat bölgesinde bulunan 5 yıldızlı bir otelin 400 araçlık açık otoparkının üstü güneş panelleriyle (Carport) kapatılacaktır. Hem araçlara gölge sağlanacak hem de otelin yoğun yaz aylarındaki yüksek klima (soğutma) elektrik faturası düşürülecektir. Öz tüketim modeli sayesinde çok hızlı amortisman öngörülmektedir.'
    },
    riskScores: { production: 2.5, thermal: 12.0, meteorological: 5.0, financial: 8.0, totalRiskLevel: 'Düşük' }
  },
  {
    id: 6,
    title: 'Yüzer GES (Floating Solar)',
    location: 'İstanbul, Büyükçekmece',
    coords: [41.0425, 28.5358],
    capacity: '1.0 MWp',
    roi: '4.8 Yıl',
    fundingProgress: 15,
    minInvestment: '$1,000',
    totalCost: '$1,050,000',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=600',
    featured: false,
    type: 'solar',
    feasibility: {
      status: 'Su Yönetimi Onayı Alındı',
      ced: 'Olumlu',
      gridConnection: 'Başvuru Aşamasında',
      annualProduction: '1.600 MWh',
      co2Reduction: '650 Ton / Yıl',
      description: 'Göl yüzeyine kurulacak olan Yüzer Güneş Enerji Santrali projesidir. Suyun soğutucu etkisi sayesinde paneller standart arazi kurulumlarına göre %12 daha fazla enerji üretir. Ayrıca su yüzeyini kaplayarak yaz aylarındaki şiddetli buharlaşmayı önler ve tatlı su rezervinin korunmasına ekolojik katkı sağlar.'
    },
    riskScores: { production: 5.0, thermal: 6.5, meteorological: 11.0, financial: 8.0, totalRiskLevel: 'Orta' }
  }
];

function MarketplacePage() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [allProjects, setAllProjects] = useState(projects);

  const [isInvesting, setIsInvesting] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investStatus, setInvestStatus] = useState('idle');

  const { balance, setBalance, user } = useOutletContext() || { balance: 0, setBalance: () => {}, user: null };

  useEffect(() => {
    if (!selectedProject) {
      setIsInvesting(false);
      setInvestStatus('idle');
      setInvestAmount('');
    }
  }, [selectedProject]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Gelen verideki snake_case alanları camelCase'e dönüştür
          const formattedData = data.map(p => ({
            ...p,
            fundingProgress: p.funding_progress || 0,
            minInvestment: p.min_investment || '$0',
            totalCost: p.total_cost || '$0',
            riskScores: p.risk_scores,
            investorsCount: p.investors_count || 0,
            raised: p.raised || '$0',
            target: p.target || p.total_cost || '$0',
            status: p.status || 'Onay Bekliyor',
          }));
          setAllProjects([...projects, ...formattedData]);
        } else {
          setAllProjects(projects);
        }
      } catch (err) {
        console.error('Projeler Supabase üzerinden yüklenemedi:', err);
        setAllProjects(projects);
      }
    };
    
    fetchProjects();
  }, []);

  const handleInvestSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(investAmount);
    if (balance < amount) {
      alert("Yetersiz bakiye. Lütfen cüzdanınıza para yatırın.");
      return;
    }

    setInvestStatus('processing');
    setTimeout(async () => {
      setInvestStatus('success');
      setBalance(prev => prev - amount);

      if (user) {
        const { error } = await supabase.from('user_investments').insert({
          user_id: user.id,
          project_id: selectedProject.id.toString(),
          amount: amount,
          project_snapshot: {
            name: selectedProject.title,
            location: selectedProject.location,
            capacity: selectedProject.capacity,
            roi: selectedProject.roi,
            fundingProgress: selectedProject.fundingProgress
          }
        });
        if (error) console.error("Yatırım kaydedilemedi:", error);
      } else {
        console.warn("Giriş yapmış kullanıcı bulunamadı, yatırım buluta kaydedilemedi!");
      }

      // Projenin fonlama ilerlemesini güncelle
      const totalCostNum = parseFloat(
        (selectedProject.totalCost || '$1,000,000').replace(/[^0-9.]/g, '')
      );
      const addedProgress = totalCostNum > 0 ? (amount / totalCostNum) * 100 : 0;
      const newProgress = Math.min(100, Math.round(selectedProject.fundingProgress + addedProgress));
      setAllProjects(prev => prev.map(p =>
        p.id === selectedProject.id
          ? { ...p, fundingProgress: newProgress }
          : p
      ));

      setTimeout(() => {
        setSelectedProject(null);
      }, 2000);
    }, 1500);
  };

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return allProjects.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.location.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, allProjects]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Yatırım Fırsatları</h1>
          <p className="text-gray-400 mt-2 text-lg font-light mb-4">Onaylanmış sürdürülebilir enerji projelerine dijital hisselerle ortak olun.</p>
          <div className="inline-flex items-center bg-brand-blue/10 border border-brand-blue/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Info className="w-4 h-4 text-brand-blue mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-300">SunShare platform sağlayıcı olarak yapılan yatırımlardan <strong className="text-white">%2 işlem komisyonu</strong> almaktadır.</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Map/Grid Toggle Button */}
          <div className="flex p-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full w-full sm:w-auto">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${viewMode === 'grid' ? 'bg-sun-green text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid className="w-4 h-4 mr-2" /> Liste Görünümü
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${viewMode === 'map' ? 'bg-sun-green text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-gray-400 hover:text-white'}`}
            >
              <MapIcon className="w-4 h-4 mr-2" /> Haritada Ara
            </button>
          </div>

          <div className="relative w-full sm:w-80 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sun-green to-brand-blue rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative flex items-center bg-sun-green/10 backdrop-blur-xl border border-sun-green/40 rounded-full px-4 py-3 shadow-[0_0_15px_rgba(16,185,129,0.15)] focus-within:border-sun-green focus-within:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
              <Search className="text-sun-green w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Proje veya lokasyon ara..." 
                className="w-full bg-transparent text-white placeholder-emerald-200/50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-3xl border border-white/5">
          <Search className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Proje Bulunamadı</h3>
          <p className="text-gray-400 text-center">Aradığınız kritere ("{searchQuery}") uygun aktif proje bulunmamaktadır.<br/>Lütfen başka bir anahtar kelime deneyin.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {filteredProjects.map(project => (
            <div key={project.id} className="relative group rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col">
              
              {project.featured && (
                <div className="absolute top-0 right-0 z-20 overflow-hidden w-24 h-24">
                  <div className="absolute top-6 -right-6 w-32 bg-sun-green text-black font-bold text-[10px] uppercase tracking-widest text-center py-1.5 rotate-45 shadow-lg flex items-center justify-center">
                    <Star className="w-3 h-3 mr-1 fill-black" /> Fırsat
                  </div>
                </div>
              )}

              <div className="h-56 overflow-hidden relative rounded-t-[2rem]">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
                <img src={project.image} alt={project.title} className="w-full h-full object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=600'; }} />
                <div className="absolute top-5 left-5 z-20 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg flex items-center">
                  {project.type === 'solar' && <Sun className="w-3 h-3 mr-1.5 text-yellow-400" />}
                  {project.type === 'wind' && <Wind className="w-3 h-3 mr-1.5 text-blue-300" />}
                  {project.type === 'biomass' && <Droplets className="w-3 h-3 mr-1.5 text-green-400" />}
                  Doğrulanmış
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col relative z-20 -mt-10">
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-sun-green transition-colors">{project.title}</h3>
                <p className="text-gray-400 flex items-center text-sm mb-6 font-medium">
                  <MapPin className="w-4 h-4 mr-1.5 text-sun-green" /> {project.location}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center"><Battery className="w-3 h-3 mr-1" /> Kapasite</div>
                    <div className="text-white font-bold text-lg">{project.capacity}</div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center"><PieChart className="w-3 h-3 mr-1" /> Amortisman</div>
                    <div className="text-sun-green font-bold text-lg">{project.roi}</div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-sm mb-3 font-medium">
                    <span className="text-gray-400">Fonlama: <strong className="text-white">%{project.fundingProgress}</strong></span>
                    <span className="text-gray-400">{project.totalCost}</span>
                  </div>
                  <div className="h-2.5 bg-black/50 border border-white/5 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-gradient-to-r from-sun-green to-emerald-400 relative transition-all duration-1000" style={{ width: `${project.fundingProgress}%` }}>
                      <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Min. Yatırım</span>
                      <span className="text-white font-bold text-xl">{project.minInvestment}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="px-5 py-2.5 bg-white text-black font-bold rounded-full hover:bg-sun-green hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-300 flex items-center"
                    >
                      İncele <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[700px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <MapContainer 
            center={[39.0, 35.0]} 
            zoom={6} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="colored-dark-map"
            />
            {filteredProjects.map(project => (
              <Marker key={project.id} position={project.coords} icon={sunshareIcon}>
                <Popup className="sunshare-popup">
                  <div className="w-64 p-1">
                    <div className="h-32 -mx-5 -mt-4 mb-3 overflow-hidden rounded-t-lg relative">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=600'; }} />
                      {project.featured && (
                        <div className="absolute top-2 right-2 bg-sun-green text-black text-[10px] font-bold px-2 py-1 rounded">
                          FIRSAT
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 leading-tight">{project.title}</h4>
                    <p className="text-xs text-gray-500 mb-3 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {project.location}</p>
                    
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-3">
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">Kapasite</div>
                        <div className="text-sm font-bold text-gray-900">{project.capacity}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">ROI</div>
                        <div className="text-sm font-bold text-emerald-600">{project.roi}</div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
                    >
                      Projeyi İncele
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          <style>{`
            .colored-dark-map {
              filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
            .sunshare-popup .leaflet-popup-content-wrapper {
              background: white;
              color: #333;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            }
            .sunshare-popup .leaflet-popup-tip {
              background: white;
            }
            .sunshare-popup .leaflet-popup-content {
              margin: 16px;
            }
          `}</style>
        </div>
      )}

      {/* Feasibility Report Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedProject(null)}></div>
          
          <div className="glass-panel w-full max-w-4xl bg-[#0a0a0a] border border-white/20 rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-full">
            {/* Modal Header Image */}
            <div className="h-48 sm:h-64 relative flex-shrink-0">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent"></div>
              
              <button 
                onClick={() => setSelectedProject(null)} 
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/20 p-2 rounded-full text-white hover:bg-white/20 transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-8 right-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-sun-green text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {selectedProject.type === 'solar' ? 'Güneş Enerjisi' : selectedProject.type === 'wind' ? 'Rüzgar Enerjisi' : 'Biyokütle'}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center">
                    <MapPin className="w-3 h-3 mr-1" /> {selectedProject.location}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">{selectedProject.title}</h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="flex items-center mb-6 border-b border-white/10 pb-4">
                <FileText className="w-6 h-6 mr-3 text-sun-green" />
                <h3 className="text-2xl font-bold text-white">Nihai Fizibilite Raporu</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Left Column: Quick Stats */}
                <div className="space-y-4">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Amortisman (ROI)</div>
                    <div className="text-sun-green font-bold text-2xl flex items-baseline">
                      {selectedProject.roi} <span className="text-sm font-medium text-gray-400 ml-2">Tahmini</span>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Kurulu Kapasite</div>
                    <div className="text-white font-bold text-2xl">{selectedProject.capacity}</div>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Yıllık Üretim</div>
                    <div className="text-brand-blue font-bold text-xl">{selectedProject.feasibility.annualProduction}</div>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">CO₂ Tasarrufu</div>
                    <div className="text-emerald-400 font-bold text-xl">{selectedProject.feasibility.co2Reduction}</div>
                  </div>
                </div>

                {/* Right Column: Descriptions and Status */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">Proje Özeti ve Teknik Analiz</h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {selectedProject.feasibility.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white mb-4">Resmi Süreç ve İzin Durumu</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-sun-green mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white font-medium text-sm">Genel Durum</div>
                          <div className="text-gray-400 text-xs">{selectedProject.feasibility.status}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-sun-green mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white font-medium text-sm">ÇED Kararı</div>
                          <div className="text-gray-400 text-xs">{selectedProject.feasibility.ced}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-sun-green mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white font-medium text-sm">Şebeke Bağlantısı</div>
                          <div className="text-gray-400 text-xs">{selectedProject.feasibility.gridConnection}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <TrendingUp className="w-5 h-5 text-sun-green mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white font-medium text-sm">Minimum Yatırım</div>
                          <div className="text-gray-400 text-xs">{selectedProject.minInvestment} ile başlangıç</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}

              {/* 4-Layer Risk Analysis */}
              {selectedProject.riskScores && (
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-sun-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Detaylı Risk Analizi (4 Katman)
                    <span className={`ml-auto text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      selectedProject.riskScores.totalRiskLevel === 'Çok Düşük' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      selectedProject.riskScores.totalRiskLevel === 'Düşük'     ? 'bg-sun-green/10 text-sun-green border-sun-green/20' :
                      selectedProject.riskScores.totalRiskLevel === 'Orta'      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      selectedProject.riskScores.totalRiskLevel === 'Yüksek'    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {selectedProject.riskScores.totalRiskLevel}
                    </span>
                  </h4>
                  <div className="space-y-4 bg-black/30 border border-white/5 p-5 rounded-2xl">
                    {[
                      { label: 'Üretim İstikrarsızlığı', value: selectedProject.riskScores.production, color: 'bg-purple-500', desc: 'PVGIS yıllık üretim sapması' },
                      { label: 'Termal Kayıp Riski', value: selectedProject.riskScores.thermal, color: 'bg-red-500', desc: 'Sıcaklık bazlı panel verim kaybı' },
                      { label: 'Meteorolojik Sapma', value: selectedProject.riskScores.meteorological, color: 'bg-blue-500', desc: 'Bulutluluk oranı etkisi' },
                      { label: 'Finansal Dalgalanma', value: selectedProject.riskScores.financial, color: 'bg-emerald-500', desc: 'Enflasyon & fiyat volatilitesi' },
                    ].map((risk, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5">
                          <span className="text-gray-400 flex items-center">{risk.label} <span className="text-gray-600 font-normal normal-case tracking-normal ml-2 hidden sm:inline">— {risk.desc}</span></span>
                          <span className="text-white">%{risk.value}</span>
                        </div>
                        <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full ${risk.color} relative transition-all duration-1000`} style={{ width: `${risk.value}%` }}>
                            <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-sun-green/10 to-transparent border border-sun-green/20 rounded-2xl mt-4 min-h-[90px]">
                {investStatus === 'success' ? (
                  <div className="w-full flex items-center justify-center text-sun-green font-bold text-lg animate-in fade-in zoom-in duration-300">
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Yatırımınız Başarıyla Gerçekleşti!
                  </div>
                ) : isInvesting ? (
                  <form onSubmit={handleInvestSubmit} className="w-full flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex-1 w-full relative">
                      <span className="absolute left-4 top-[1.1rem] text-gray-400 font-bold">$</span>
                      <input 
                        required 
                        type="number" 
                        min={parseInt(selectedProject.minInvestment.replace(/[^0-9]/g, ''))} 
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        placeholder={`Min. ${selectedProject.minInvestment}`} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-sun-green/50 transition-all font-semibold" 
                      />
                      <div className="absolute -bottom-6 left-1 text-[11px] text-gray-400 flex items-center">
                        <Info className="w-3 h-3 mr-1 text-sun-green" /> Yatırım tutarına <strong className="text-white ml-1">%2 komisyon</strong> dahildir.
                      </div>
                    </div>
                    <div className="flex w-full sm:w-auto gap-2">
                      <button 
                        type="button" 
                        onClick={() => setIsInvesting(false)}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-medium"
                      >
                        İptal
                      </button>
                      <button 
                        disabled={investStatus === 'processing' || !investAmount}
                        type="submit" 
                        className="flex-1 sm:flex-none px-8 py-3 bg-sun-green text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50"
                      >
                        {investStatus === 'processing' ? 'İşleniyor...' : 'Onayla'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="mb-4 sm:mb-0 w-full sm:w-auto">
                      <div className="text-gray-400 text-sm mb-1">Şu ana kadar toplanan fon:</div>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-white mr-3">%{selectedProject.fundingProgress}</span>
                        <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden">
                          <div className="h-full bg-sun-green" style={{ width: `${selectedProject.fundingProgress}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsInvesting(true)}
                      className="w-full sm:w-auto px-8 py-3.5 bg-sun-green text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                      Hemen Yatırım Yap
                    </button>
                  </>
                )}
              </div>
              
            </div>
          </div>
          
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(255, 255, 255, 0.2);
              border-radius: 10px;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default MarketplacePage;
