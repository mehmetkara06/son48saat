import React from 'react';
import { Target, TrendingUp, Users, Activity, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const myProjects = [
  {
    id: 1,
    title: 'Güneş Tarlası Projesi - Karapınar',
    capacity: '2.5 MWp',
    status: 'Fonlanıyor',
    fundingProgress: 75,
    investorsCount: 142,
    raised: '$1,387,500',
    target: '$1,850,000'
  },
  {
    id: 2,
    title: 'Endüstriyel Çatı GES - OSB',
    capacity: '850 kWp',
    status: 'Aktif',
    fundingProgress: 100,
    investorsCount: 54,
    raised: '$650,000',
    target: '$650,000'
  }
];

const StatCard = ({ title, value, icon: Icon, subtitle, colorClass, borderClass }) => (
  <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
    <div className={`absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-700 ${colorClass}`}>
      <Icon className="w-32 h-32" />
    </div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-gray-400 text-sm font-medium tracking-wide">{title}</p>
        <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 bg-white/5 border border-white/10 rounded-2xl shadow-lg ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="mt-6 text-sm text-gray-500 font-medium relative z-10">
      {subtitle}
    </div>
  </div>
);

function OwnerDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Geliştirici Özeti</h1>
          <p className="text-gray-400 mt-2 text-lg font-light">Projelerinizin fonlama durumunu ve güncel performansını yönetin.</p>
        </div>
        <Link 
          to="/analysis"
          className="px-6 py-3 bg-brand-blue/10 text-brand-blue border border-brand-blue/30 rounded-full hover:bg-brand-blue/20 hover:border-brand-blue/50 transition-all duration-300 flex items-center font-semibold shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Yeni Proje Analizi
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Aktif Projeler" value="2" icon={Activity} subtitle="Yayında olan projeler" colorClass="text-brand-blue" />
        <StatCard title="Toplam Kapasite" value="3.35 MWp" icon={Target} subtitle="Kurulu ve planlanan" colorClass="text-sun-green" />
        <StatCard title="Toplanan Fon" value="$2.03M" icon={TrendingUp} subtitle="Toplam yatırım hacmi" colorClass="text-sun-green" />
        <StatCard title="Yatırımcı Sayısı" value="196" icon={Users} subtitle="Ortak olan kişi sayısı" colorClass="text-purple-400" />
      </div>

      <div className="glass-panel p-8 rounded-3xl mt-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white">Projelerim</h2>
          <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center">
            Tümünü Gör <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="space-y-4">
          {myProjects.map(project => (
            <div key={project.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-white text-xl group-hover:text-brand-blue transition-colors">{project.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 font-medium">Kapasite: <span className="text-white">{project.capacity}</span></p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Yatırımcılar</p>
                    <p className="font-semibold text-white text-lg">{project.investorsCount} Kişi</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${project.status === 'Aktif' ? 'bg-sun-green/10 border-sun-green/30 text-sun-green' : 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'}`}>
                    {project.status}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-400 font-medium">Fonlama İlerlemesi: <strong className="text-white">%{project.fundingProgress}</strong></span>
                  <span className="text-gray-400 font-medium">{project.raised} / <span className="text-white">{project.target}</span></span>
                </div>
                <div className="h-3 bg-black/50 border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full relative overflow-hidden ${project.fundingProgress === 100 ? 'bg-sun-green' : 'bg-brand-blue'}`} 
                    style={{ width: `${project.fundingProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboardPage;
