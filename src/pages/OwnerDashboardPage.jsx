import React, { useState } from 'react';
import { Target, TrendingUp, Users, Activity, Plus, ArrowRight, Info, MapPin, CheckCircle, FileText, X, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const UnitTooltip = ({ unit, description }) => (
  <span className="relative group/unit inline-flex items-center ml-1 cursor-help border-b border-dashed border-gray-500 z-20">
    {unit}
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl text-xs text-gray-200 shadow-2xl opacity-0 group-hover/unit:opacity-100 pointer-events-none transition-opacity duration-200 font-normal normal-case tracking-normal">
      {description}
    </div>
  </span>
);

const renderCapacity = (capString) => {
  if (capString.includes('MWp')) {
    return <>{capString.replace('MWp', '')} <UnitTooltip unit="MWp" description="Megawatt Peak (MWp): Güneş panellerinin laboratuvar koşullarında üretebileceği maksimum güç kapasitesi. 1 MW = 1.000 kW." /></>;
  } else if (capString.includes('kWp')) {
    return <>{capString.replace('kWp', '')} <UnitTooltip unit="kWp" description="Kilowatt Peak (kWp): Güneş panellerinin ideal şartlardaki maksimum anlık güç üretimidir." /></>;
  }
  return capString;
};

const myProjects = [
  {
    id: 1,
    title: 'Güneş Tarlası Projesi - Karapınar',
    capacity: '2.5 MWp',
    status: 'Fonlanıyor',
    fundingProgress: 75,
    investorsCount: 142,
    raised: '$1,387,500',
    target: '$1,850,000',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600',
    type: 'solar',
    location: 'Konya, Türkiye',
    roi: '4.2 Yıl',
    feasibility: {
      status: 'Onaylandı',
      ced: 'Gerekli Değildir / Olumlu',
      gridConnection: 'Çağrı Mektubu Alındı',
      annualProduction: '3.750 MWh',
      co2Reduction: '1.500 Ton / Yıl',
      description: 'Karapınar bölgesinde yer alan arazi, Türkiye\'nin en yüksek güneşlenme süresine sahip bölgelerinden biridir. Eğimsiz arazi yapısı sayesinde kurulum maliyetleri minimuma indirilmiş olup, çift yönlü (bifacial) paneller kullanılarak üretim verimliliği %15 artırılmıştır. Projenin şebeke bağlantı noktasına uzaklığı sadece 1.2 km\'dir.'
    }
  },
  {
    id: 2,
    title: 'Endüstriyel Çatı GES - OSB',
    capacity: '850 kWp',
    status: 'Aktif',
    fundingProgress: 100,
    investorsCount: 54,
    raised: '$650,000',
    target: '$650,000',
    image: 'https://images.unsplash.com/photo-1592833159057-6afdaf65f973?auto=format&fit=crop&q=80&w=600',
    type: 'solar',
    location: 'Bursa, Türkiye',
    roi: '3.8 Yıl',
    feasibility: {
      status: 'Kurulum Aşamasında',
      ced: 'Muaf',
      gridConnection: 'Onaylandı (Öz Tüketim)',
      annualProduction: '1.100 MWh',
      co2Reduction: '450 Ton / Yıl',
      description: 'Bursa Organize Sanayi Bölgesinde yer alan tekstil fabrikasının çatısına kurulacak olan sistem, fabrikanın gündüz enerji ihtiyacının %85\'ini karşılayacaktır. Öz tüketim modeli ile şebeke satış maliyetleri sıfırlanmış, endüstriyel tarife üzerinden sağlanan tasarruf ile amortisman süresi 3.8 yıla kadar düşürülmüştür.'
    }
  },
  {
    id: 3,
    title: 'Tarımsal GES (Agrivoltaics)',
    capacity: '1.2 MWp',
    status: 'Onay Bekliyor',
    fundingProgress: 0,
    investorsCount: 0,
    raised: '$0',
    target: '$920,000',
    image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=600',
    type: 'solar',
    location: 'Şanlıurfa, Türkiye',
    roi: '4.5 Yıl',
    feasibility: {
      status: 'Bakanlık İncelemesinde',
      ced: 'Olumlu',
      gridConnection: 'Onay Aşamasında',
      annualProduction: '1.950 MWh',
      co2Reduction: '800 Ton / Yıl',
      description: 'Tarımsal arazilerin hem elektrik üretimi hem de tarım için eş zamanlı kullanıldığı Agrivoltaik sistemdir. Paneller, gölge seven tarım ürünleri için ideal ortamı sağlarken, buharlaşmayı azaltarak sulama suyundan %30 tasarruf sağlamaktadır.'
    }
  },
  {
    id: 4,
    title: 'Otel Otopark Üstü GES',
    capacity: '1.5 MWp',
    status: 'Fonlanıyor',
    fundingProgress: 35,
    investorsCount: 42,
    raised: '$385,000',
    target: '$1,100,000',
    image: 'https://images.unsplash.com/photo-1594818345462-1c69140c4046?auto=format&fit=crop&q=80&w=600',
    type: 'solar',
    location: 'Antalya, Manavgat',
    roi: '3.5 Yıl',
    feasibility: {
      status: 'Bağlantı Anlaşması İmzalandı',
      ced: 'Muaf',
      gridConnection: 'Öz Tüketim',
      annualProduction: '2.400 MWh',
      co2Reduction: '950 Ton / Yıl',
      description: 'Antalya Manavgat bölgesinde bulunan 5 yıldızlı bir otelin 400 araçlık açık otoparkının üstü güneş panelleriyle kapatılacaktır. Hem araçlara gölge sağlanacak hem de otelin yüksek elektrik faturası düşürülecektir.'
    }
  }
];

const StatCard = ({ title, value, icon: Icon, subtitle, colorClass, tooltip }) => (
  <div className="glass-panel p-6 rounded-3xl relative overflow-visible group/card hover:-translate-y-1 transition-transform duration-300">
    <div className={`absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-hover/card:scale-125 transition-transform duration-700 ${colorClass}`}>
      <Icon className="w-32 h-32" />
    </div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <div className="text-gray-400 text-sm font-medium tracking-wide flex items-center mb-2">
          {title}
          {tooltip && (
            <div className="relative group/tooltip ml-2 flex items-center z-30">
               <Info className="w-4 h-4 text-gray-500 hover:text-white transition-colors cursor-help" />
               <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 p-3 bg-black/95 backdrop-blur-md border border-white/20 rounded-xl text-xs text-gray-200 shadow-2xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200 leading-relaxed font-normal">
                 {tooltip}
               </div>
            </div>
          )}
        </div>
        <h3 className="text-4xl font-extrabold text-white tracking-tight">{value}</h3>
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
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [allProjects, setAllProjects] = useState(myProjects);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
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
          setAllProjects([...myProjects, ...formattedData]);
        } else {
          setAllProjects(myProjects);
        }
      } catch (err) {
        console.error('Projeler yüklenemedi:', err);
      }
    };
    
    fetchProjects();
  }, []);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    
    const reportHtml = `
      <div style="font-family: Arial, sans-serif; color: #000; padding: 40px; line-height: 1.6; background: white;">
        <h1 style="text-align: center; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">SUNSHARE - NİHAİ FİZİBİLİTE RAPORU</h1>
        <p style="text-align: right; color: #555;"><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
        
        <h3 style="color: #3b82f6; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">1. Proje Özeti</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 40%; background: #f9f9f9;">Proje Adı</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.title}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Lokasyon</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.location}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Kurulu Kapasite</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.capacity}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Finansal Durum</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.status}</td></tr>
        </table>

        <h3 style="color: #3b82f6; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">2. Finansal ve Teknik Analiz</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 40%; background: #f9f9f9;">Yıllık Enerji Üretimi</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.feasibility?.annualProduction}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Hedeflenen Yatırım (Toplam)</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.target}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Tahmini Amortisman (ROI)</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.roi}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">CO2 Emisyon Tasarrufu</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.feasibility?.co2Reduction}</td></tr>
        </table>

        <h3 style="color: #3b82f6; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">3. İzinler ve Teknik Durum</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 40%; background: #f9f9f9;">Genel Süreç Durumu</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.feasibility?.status}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">ÇED Kararı</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.feasibility?.ced}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Şebeke Bağlantısı</td><td style="padding: 10px; border: 1px solid #eee;">${selectedProject?.feasibility?.gridConnection}</td></tr>
        </table>
        
        <div style="padding: 20px; border: 1px solid #eee; background-color: #f9f9f9; border-radius: 8px;">
          <strong style="color: #333;">Proje Teknik Açıklaması:</strong><br/>
          <p style="margin-top: 10px; font-size: 14px; text-align: justify; color: #555;">${selectedProject?.feasibility?.description}</p>
        </div>

        <p style="margin-top: 40px; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; text-align: justify;">
          Bu belge SunShare platformu tarafından üretilmiş resmi bir bilgilendirme raporudur. Proje detayları ve finansal beklentiler tamamen tahmin ve proje dokümanlarına dayanmaktadır.
        </p>
      </div>
    `;

    const opt = {
      margin:       10,
      filename:     `${selectedProject?.title?.replace(/\s+/g, '_')}_Fizibilite.pdf`,
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
        <StatCard title="Aktif Projeler" value="4" icon={Activity} subtitle="Yayında ve onay sürecinde" colorClass="text-brand-blue" />
        <StatCard 
          title="Toplam Kapasite" 
          value={renderCapacity("6.05 MWp")} 
          icon={Target} 
          subtitle="Kurulu ve planlanan" 
          colorClass="text-sun-green" 
          tooltip="Geliştirdiğiniz tüm aktif, fonlanan ve onay bekleyen projelerin toplam maksimum anlık üretim gücüdür."
        />
        <StatCard title="Toplanan Fon" value="$2.42M" icon={TrendingUp} subtitle="Toplam yatırım hacmi" colorClass="text-sun-green" />
        <StatCard title="Yatırımcı Sayısı" value="238" icon={Users} subtitle="Ortak olan kişi sayısı" colorClass="text-purple-400" />
      </div>

      <div className="glass-panel p-8 rounded-3xl mt-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white">Projelerim</h2>
          <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center">
            Tümünü Gör <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="space-y-4">
          {allProjects.map(project => (
            <div 
              key={project.id} 
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 group shadow-sm hover:shadow-xl flex flex-col"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-white text-xl group-hover:text-brand-blue transition-colors flex items-center">
                    {project.title}
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 font-medium">Kapasite: <span className="text-white">{renderCapacity(project.capacity)}</span></p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Yatırımcılar</p>
                    <p className="font-semibold text-white text-lg">{project.investorsCount} Kişi</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${project.status === 'Aktif' ? 'bg-sun-green/10 border-sun-green/30 text-sun-green' : project.status === 'Fonlanıyor' ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
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
                    {project.fundingProgress > 0 && project.fundingProgress < 100 && (
                      <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-5 pt-5 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setSelectedProject(project)}
                  className="px-5 py-2.5 bg-brand-blue/10 text-brand-blue text-sm font-bold rounded-xl hover:bg-brand-blue/20 border border-brand-blue/20 hover:border-brand-blue/40 transition-all flex items-center shadow-lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Fizibilite Raporunu İncele
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feasibility Report Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedProject(null)}></div>
          
          <div ref={modalRef} className="glass-panel w-full max-w-4xl bg-[#0a0a0a] border border-white/20 rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-full">
            {/* Modal Header Image */}
            <div className="h-48 sm:h-64 relative flex-shrink-0">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent"></div>
              
              <button 
                id="modal-close-btn"
                onClick={() => setSelectedProject(null)} 
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/20 p-2 rounded-full text-white hover:bg-white/20 transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-8 right-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-brand-blue text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Kendi Projeniz
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
                <FileText className="w-6 h-6 mr-3 text-brand-blue" />
                <h3 className="text-2xl font-bold text-white">Nihai Fizibilite Raporu</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Left Column: Quick Stats */}
                <div className="space-y-4">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Amortisman (ROI)</div>
                    <div className="text-brand-blue font-bold text-2xl flex items-baseline">
                      {selectedProject.roi} <span className="text-sm font-medium text-gray-400 ml-2">Tahmini</span>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Kurulu Kapasite</div>
                    <div className="text-white font-bold text-2xl">{selectedProject.capacity}</div>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Yıllık Üretim</div>
                    <div className="text-sun-green font-bold text-xl">{selectedProject.feasibility.annualProduction}</div>
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
                        <CheckCircle className="w-5 h-5 text-brand-blue mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white font-medium text-sm">Genel Durum</div>
                          <div className="text-gray-400 text-xs">{selectedProject.feasibility.status}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-brand-blue mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white font-medium text-sm">ÇED Kararı</div>
                          <div className="text-gray-400 text-xs">{selectedProject.feasibility.ced}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-brand-blue mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white font-medium text-sm">Şebeke Bağlantısı</div>
                          <div className="text-gray-400 text-xs">{selectedProject.feasibility.gridConnection}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-gradient-to-r from-brand-blue/10 to-transparent border border-brand-blue/20 rounded-2xl mt-4">
                <div className="mb-4 sm:mb-0">
                  <div className="text-gray-400 text-sm mb-1">Şu ana kadar toplanan fon:</div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-white mr-3">%{selectedProject.fundingProgress}</span>
                    <div className="w-48 h-2 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-blue" style={{ width: `${selectedProject.fundingProgress}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-gray-400 text-sm">Hedeflenen Tutar</span>
                  <span className="text-xl font-bold text-white">{selectedProject.target}</span>
                </div>
              </div>

              {/* PDF Download Button */}
              <div id="modal-download-btn" className="mt-6 flex justify-end border-t border-white/10 pt-6">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="px-6 py-3 bg-white text-black font-extrabold rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 flex items-center shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95"
                >
                  {isDownloading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Download className="w-5 h-5 mr-2" />
                  )}
                  {isDownloading ? 'PDF Hazırlanıyor...' : 'Raporu PDF Olarak İndir'}
                </button>
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

export default OwnerDashboardPage;
