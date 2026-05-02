import React, { useState } from 'react';
import { Search, MapPin, Battery, PieChart, ArrowRight, Star, Map as MapIcon, Grid } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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
    featured: true
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
    image: 'https://images.unsplash.com/photo-1592833159057-6afdaf65f973?auto=format&fit=crop&q=80&w=600',
    featured: false
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
    image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=600',
    featured: true
  }
];

function MarketplacePage() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Yatırım Fırsatları</h1>
          <p className="text-gray-400 mt-2 text-lg font-light">Onaylanmış güneş enerjisi projelerine dijital hisselerle ortak olun.</p>
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sun-green to-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-black/50 backdrop-blur-xl border border-white/10 rounded-full px-4 py-3">
              <Search className="text-gray-400 w-5 h-5 mr-3 group-hover:text-sun-green transition-colors" />
              <input 
                type="text" 
                placeholder="Proje veya lokasyon ara..." 
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {projects.map(project => (
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
                <img src={project.image} alt={project.title} className="w-full h-full object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out" />
                <div className="absolute top-5 left-5 z-20 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg">
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
                    <div className="h-full bg-gradient-to-r from-sun-green to-emerald-400 relative" style={{ width: `${project.fundingProgress}%` }}>
                      <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Min. Yatırım</span>
                      <span className="text-white font-bold text-xl">{project.minInvestment}</span>
                    </div>
                    <button className="px-5 py-2.5 bg-white text-black font-bold rounded-full hover:bg-sun-green hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-300 flex items-center">
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {projects.map(project => (
              <Marker key={project.id} position={project.coords} icon={sunshareIcon}>
                <Popup className="sunshare-popup">
                  <div className="w-64 p-1">
                    <div className="h-32 -mx-5 -mt-4 mb-3 overflow-hidden rounded-t-lg relative">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
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
                    
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-sm">
                      Projeyi İncele
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          <style>{`
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
    </div>
  );
}

export default MarketplacePage;
