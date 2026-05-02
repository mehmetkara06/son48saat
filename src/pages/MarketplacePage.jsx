import React from 'react';
import { Search, MapPin, Battery, PieChart, ArrowRight, Star } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'Güneş Tarlası Projesi - Karapınar',
    location: 'Konya, Türkiye',
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
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Yatırım Fırsatları</h1>
          <p className="text-gray-400 mt-2 text-lg font-light">Onaylanmış güneş enerjisi projelerine dijital hisselerle ortak olun.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
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
    </div>
  );
}

export default MarketplacePage;
