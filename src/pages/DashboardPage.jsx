import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, Zap, Leaf, TrendingUp, ArrowUpRight, Activity, X, CreditCard, Building2, CheckCircle2 } from 'lucide-react';

const chartDataSets = {
  daily: [
    { name: 'Pzt', getiri: 120 },
    { name: 'Sal', getiri: 150 },
    { name: 'Çar', getiri: 180 },
    { name: 'Per', getiri: 140 },
    { name: 'Cum', getiri: 210 },
    { name: 'Cmt', getiri: 250 },
    { name: 'Paz', getiri: 290 },
  ],
  weekly: [
    { name: '1. Hft', getiri: 850 },
    { name: '2. Hft', getiri: 920 },
    { name: '3. Hft', getiri: 1100 },
    { name: '4. Hft', getiri: 1050 },
  ],
  monthly: [
    { name: 'Oca', getiri: 4000 },
    { name: 'Şub', getiri: 3000 },
    { name: 'Mar', getiri: 2000 },
    { name: 'Nis', getiri: 2780 },
    { name: 'May', getiri: 1890 },
    { name: 'Haz', getiri: 2390 },
    { name: 'Tem', getiri: 3490 },
  ],
  yearly: [
    { name: '2021', getiri: 24000 },
    { name: '2022', getiri: 32000 },
    { name: '2023', getiri: 45000 },
    { name: '2024', getiri: 58000 },
  ]
};

const StatCard = ({ title, value, subtext, icon: Icon, trend }) => (
  <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
    <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-700">
      <Icon className="w-32 h-32 text-sun-green" />
    </div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-gray-400 text-sm font-medium tracking-wide">{title}</p>
        <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
        {subtext && <p className="text-sun-green text-sm mt-1.5 font-semibold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{subtext}</p>}
      </div>
      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-sun-green shadow-lg">
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="mt-6 flex items-center text-sm relative z-10">
      <div className="flex items-center px-2 py-1 rounded-full bg-sun-green/10 border border-sun-green/20">
        <TrendingUp className="w-3 h-3 text-sun-green mr-1" />
        <span className="text-sun-green font-bold text-xs">{trend}</span>
      </div>
      <span className="text-gray-500 ml-3 text-xs font-medium uppercase tracking-wider">Geçen aya göre</span>
    </div>
  </div>
);

const staticProjects = [
  { 
    name: 'Güneş Tarlası - İzmir', 
    share: '15%', 
    value: '$45,000', 
    status: 'Aktif',
    location: 'İzmir, Bergama',
    address: 'Kozak Yaylası Mevkii, Parsel 4',
    energyReturn: 'Yıllık ~180 MWh',
    feasibility: 'Yıllık 3.100 saat güneşlenme. Şebeke entegrasyonu tamamlandı. Sosyal onay yüksek. Amortisman süresi: 4.2 yıl.'
  },
  { 
    name: 'Endüstriyel Çatı - Manisa', 
    share: '8%', 
    value: '$24,000', 
    status: 'Aktif',
    location: 'Manisa, Yunusemre',
    address: 'Organize Sanayi Bölgesi, 3. Kısım',
    energyReturn: 'Yıllık ~95 MWh',
    feasibility: 'Sanayi bölgesi teşvikleri mevcut. Öz tüketim modeli ile şebeke maliyeti sıfır. Amortisman süresi: 3.8 yıl.'
  },
  { 
    name: 'GES Projesi - Antalya', 
    share: '12%', 
    value: '$55,500', 
    status: 'Pasif',
    location: 'Antalya, Korkuteli',
    address: 'Bozova Köyü Arazisi, Parsel 12',
    energyReturn: 'Yıllık ~250 MWh (Tahmini)',
    feasibility: 'Yüksek irtifa ve soğuk hava nedeniyle panel verimi maksimumda. ÇED raporu olumlu. Amortisman süresi: 4.5 yıl.'
  },
];

function buildProjects() {
  const portfolio = JSON.parse(localStorage.getItem('sunshare_portfolio') || '[]');
  const purchased = portfolio.map(p => ({
    name:         p.name,
    share:        'Pazar Yeri',
    value:        `$${p.investedAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    status:       p.status || 'Aktif',
    location:     p.location,
    address:      p.location,
    energyReturn: `${p.capacity} kapasite / ROI: ${p.roi}`,
    feasibility:  `Pazar yeri üzerinden satın alındı. Yatırım tutarı: $${p.investedAmount.toLocaleString()}. Satın alma tarihi: ${new Date(p.purchasedAt).toLocaleDateString('tr-TR')}.`,
    _fromMarket:  true,
  }));
  const merged = [...staticProjects];
  purchased.forEach(p => {
    if (!merged.find(s => s.name === p.name)) merged.push(p);
  });
  return merged;
}

function DashboardPage() {
  const [expandedAsset, setExpandedAsset] = useState(null);
  const [timeframe, setTimeframe] = useState('monthly');
  
  const [withdrawingAsset, setWithdrawingAsset] = useState(null);
  const [withdrawStatus, setWithdrawStatus] = useState('idle');

  const { balance, setBalance } = useOutletContext() || { balance: 0, setBalance: () => {} };

  const [projects, setProjects] = useState(buildProjects);

  // Sayfa odaklandığında (marketplace'den döndüğünde) listeyi güncelle
  useEffect(() => {
    const onFocus = () => setProjects(buildProjects());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleWithdrawAsset = (e, index) => {
    e.stopPropagation();
    setWithdrawingAsset(index);
    setWithdrawStatus('processing');
    setTimeout(() => {
      setWithdrawStatus('success');
      const assetValueStr = projects[index].value;
      const assetValueNum = parseFloat(assetValueStr.replace(/[^0-9.-]+/g,""));
      setBalance(prev => prev + assetValueNum);

      setTimeout(() => {
        setWithdrawStatus('idle');
        setWithdrawingAsset(null);
      }, 2500);
    }, 1500);
  };



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Portföy Özeti</h1>
          <p className="text-gray-400 mt-2 text-lg font-light">Yatırımlarınızın anlık durumunu ve getirilerini takip edin.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Cüzdan Bakiyesi" value={`$${balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon={Wallet} trend="Kullanılabilir" />
        <StatCard title="Yatırım Değeri" value={`$${projects.reduce((acc, p) => acc + parseFloat(p.value.replace(/[^0-9.-]+/g,"") || 0), 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon={Activity} trend="Portföy" />
        <StatCard title="Üretilen Enerji" value="45.2 MWh" icon={Zap} trend="+8.2%" />
        <StatCard title="Karbon Önleme" value="18.5 Ton" subtext="≈ 832 Ağaç" icon={Leaf} trend="+15.3%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Activity className="w-5 h-5 mr-3 text-sun-green" />
              Getiri Analizi
            </h2>
            
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-fit">
              {[
                { id: 'daily', label: 'Günlük' },
                { id: 'weekly', label: 'Haftalık' },
                { id: 'monthly', label: 'Aylık' },
                { id: 'yearly', label: 'Yıllık' }
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${timeframe === tf.id ? 'bg-sun-green text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDataSets[timeframe]}>
                <defs>
                  <linearGradient id="colorGetiri" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="getiri" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGetiri)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-6">Varlık Dağılımı</h2>
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div 
                key={i} 
                onClick={() => setExpandedAsset(expandedAsset === i ? null : i)}
                className={`p-5 rounded-2xl border transition-all group cursor-pointer ${expandedAsset === i ? 'bg-white/[0.05] border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.5)]' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-white group-hover:text-sun-green transition-colors">{project.name}</h4>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${project.status === 'Aktif' ? 'bg-sun-green/10 text-sun-green border border-sun-green/20' : project.status === 'Pasif' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <div className="text-gray-500 font-medium">
                    Hisse: <span className="text-gray-300">{project.share}</span>
                  </div>
                  <div className="font-bold text-white">
                    {project.value}
                  </div>
                </div>

                {/* Expanded Details */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedAsset === i ? 'max-h-[500px] opacity-100 mt-4 pt-4 border-t border-white/10' : 'max-h-0 opacity-0 mt-0 pt-0 border-transparent'}`}>
                  <div className="space-y-4 text-sm pb-1">
                    <div>
                      <span className="text-gray-500 block text-[11px] uppercase tracking-wider mb-1">Konum & Adres</span>
                      <span className="text-gray-200">{project.location} — {project.address}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px] uppercase tracking-wider mb-1">Yıllık Enerji Getirisi</span>
                      <span className="text-sun-green font-medium">{project.energyReturn}</span>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                      <span className="text-brand-blue block text-[11px] uppercase tracking-wider mb-2 font-semibold">Nihai Fizibilite Raporu Özeti</span>
                      <span className="text-gray-400 text-xs leading-relaxed inline-block">{project.feasibility}</span>
                    </div>
                    {project.status === 'Pasif' && (
                      <div className="pt-2 mt-4 border-t border-white/10">
                        {withdrawingAsset === i && withdrawStatus === 'success' ? (
                          <div className="flex items-center justify-center text-sun-green font-bold text-sm bg-sun-green/10 p-3 rounded-xl border border-sun-green/20">
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Varlık nakde çevrildi ve cüzdana aktarıldı.
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => handleWithdrawAsset(e, i)}
                            disabled={withdrawingAsset === i && withdrawStatus === 'processing'}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-sun-green to-emerald-500 text-black font-bold rounded-xl hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            {withdrawingAsset === i && withdrawStatus === 'processing' ? 'İşleniyor...' : 'Varlığı Nakde Çevir (Para Çek)'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
            Tüm Portföyü Gör
          </button>
        </div>
      </div>


    </div>
  );
}

export default DashboardPage;
