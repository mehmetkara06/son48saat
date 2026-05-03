import React, { useState } from 'react';
import { Sun, Wallet, HardHat, ArrowRight, Info, Zap, Shield, BarChart3, Globe, LineChart, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import InfoCenter from '../components/InfoCenter';

function LoginPage() {
  const [investorForm, setInvestorForm] = useState(null); // 'login' | 'signup' | null
  const [ownerForm, setOwnerForm] = useState(null);       // 'login' | 'signup' | null
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorMsg('');
  };

  const handleInvestorAction = (action) => {
    resetFields();
    setInvestorForm(action);
    if (action) setOwnerForm(null);
  };

  const handleOwnerAction = (action) => {
    resetFields();
    setOwnerForm(action);
    if (action) setInvestorForm(null);
  };

  const handleSubmit = async (e, role) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const activeForm = role === 'investor' ? investorForm : ownerForm;

    try {
      if (activeForm === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role, full_name: fullName }
          }
        });
        if (error) setErrorMsg(error.message);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          setErrorMsg('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        } else if (data?.user?.user_metadata?.role !== role) {
          // Yanlış formdan giriş yapılmaya çalışılıyor
          await supabase.auth.signOut();
          const accountType = data?.user?.user_metadata?.role === 'owner' ? 'Geliştirici' : 'Yatırımcı';
          setErrorMsg(`Bu hesap bir ${accountType} hesabı. Lütfen ${accountType} girişini kullanın.`);
        }
      }
    } catch (err) {
      setErrorMsg('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const isAnyFormActive = investorForm || ownerForm;

  return (
    <div className="min-h-screen text-sun-text flex flex-col p-3 md:p-6 relative overflow-y-auto overflow-x-hidden font-sans" style={{backgroundColor: 'var(--login-bg, #000)'}}>
      
      {/* Background Image & Overlay */}
      <div 
        className={`fixed inset-0 z-0 bg-cover bg-center pointer-events-none transition-opacity duration-1000 ${isAnyFormActive ? 'opacity-40' : 'opacity-70'}`}
        style={{ backgroundImage: 'url("/hero_bg_hud.jpg")' }}
      ></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/40 via-black/30 to-black/90 pointer-events-none"></div>

      {/* Background Orbs */}
      <div className="fixed top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-sun-green/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow z-0"></div>
      <div className="fixed top-1/2 right-1/4 transform translate-x-1/4 -translate-y-1/2 w-[50vw] h-[50vw] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow z-0" style={{animationDelay: '2s'}}></div>

      {/* Header */}
      <div className={`text-center mt-4 md:mt-8 mb-6 md:mb-10 relative z-10 transition-all duration-700 ease-in-out ${isAnyFormActive ? 'transform scale-90 opacity-80' : 'animate-in fade-in slide-in-from-top-10'}`}>
        
        {/* Scrolling Text Marquee (Seamless Loop) */}
        <div className="w-full overflow-hidden mb-8 py-2 border-y border-white/5 bg-sun-green/5 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.05)] flex items-center group">
          <div className="animate-marquee whitespace-nowrap flex w-max text-sun-green/90 font-medium tracking-wide text-sm md:text-base group-hover:[animation-play-state:paused]">
            <span className="px-6">Sürdürülebilir enerji projelerini, şeffaf veri analizleri ve dijital hisse modelleriyle demokratikleştiriyoruz. İster 1 panel, ister 1 santral fonlayın. &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;</span>
            <span className="px-6">Sürdürülebilir enerji projelerini, şeffaf veri analizleri ve dijital hisse modelleriyle demokratikleştiriyoruz. İster 1 panel, ister 1 santral fonlayın. &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;</span>
            <span className="px-6">Sürdürülebilir enerji projelerini, şeffaf veri analizleri ve dijital hisse modelleriyle demokratikleştiriyoruz. İster 1 panel, ister 1 santral fonlayın. &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;</span>
            <span className="px-6">Sürdürülebilir enerji projelerini, şeffaf veri analizleri ve dijital hisse modelleriyle demokratikleştiriyoruz. İster 1 panel, ister 1 santral fonlayın. &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;</span>
          </div>
        </div>

        <div className="flex items-center justify-center mb-4">
          <Sun className="h-8 w-8 md:h-12 md:w-12 text-sun-green animate-float mr-2 md:mr-3 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
            SUN<span className="text-transparent bg-clip-text bg-gradient-to-r from-sun-green to-emerald-300">SHARE</span>
          </h1>
        </div>
      </div>

      <div className={`flex flex-col max-w-6xl w-full mx-auto relative z-10 flex-1 transition-all duration-700 ${isAnyFormActive ? 'justify-center mb-0 gap-0' : 'gap-10 mb-16'}`}>
        
        {/* Login Cards Section - TOP */}
        <div className={`flex flex-col md:flex-row items-stretch w-full transition-all duration-700 ease-in-out ${isAnyFormActive ? 'gap-0 justify-center' : 'gap-8 justify-center'}`}>
          
          {/* Yatırımcı Kartı */}
          <div 
            className={`glass-panel rounded-3xl flex flex-col group relative transition-all duration-700 ease-in-out border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transform origin-center overflow-hidden
            ${ownerForm 
              ? 'w-0 max-w-0 opacity-0 p-0 m-0 border-0 scale-75' 
              : (investorForm 
                   ? 'w-full md:w-[600px] flex-none p-5 md:p-8 ring-2 ring-sun-green/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] scale-[1.02] -translate-y-2' 
                   : 'w-full flex-1 p-5 md:p-8 hover:border-sun-green/40 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1'
                )
            }`}
          >
            {/* Inner Wrapper to maintain content width while container shrinks */}
            <div className="w-full min-w-[280px]">
              <div className={`absolute inset-0 bg-gradient-to-br from-sun-green/10 to-transparent transition-opacity duration-700 ${investorForm ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
              
              <div className="flex items-center mb-4 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 bg-gradient-to-br from-sun-dark to-gray-900 border border-sun-green/30 rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-5 shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform duration-500">
                  <Wallet className="w-6 h-6 md:w-8 md:h-8 text-sun-green" />
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide whitespace-nowrap">Yatırım Yap</h2>
                  <p className="text-gray-400 text-sm md:text-base mt-1 line-clamp-2">Portföyünüzü büyütün, gelir elde edin.</p>
                </div>
              </div>
              
              {/* Action Buttons (Fade out when form is active) */}
              <div className={`transition-all duration-700 ease-in-out overflow-hidden flex flex-col transform origin-top ${!investorForm ? 'max-h-[100px] opacity-100 mt-2 translate-y-0 scale-100' : 'max-h-0 opacity-0 mt-0 translate-y-4 scale-95'}`}>
                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                  <button 
                    onClick={() => handleInvestorAction('login')}
                    className="flex-1 whitespace-nowrap bg-gradient-to-r from-sun-green to-emerald-500 text-black font-bold py-3.5 px-4 rounded-xl hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center"
                  >
                    Giriş Yap <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
                  </button>
                  <button 
                    onClick={() => handleInvestorAction('signup')}
                    className="flex-1 whitespace-nowrap bg-white/5 backdrop-blur-md border border-white/20 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-white/10 hover:border-sun-green/50 hover:text-sun-green hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all"
                  >
                    Kayıt Ol
                  </button>
                </div>
              </div>

              {/* Form Section (Expands when active) */}
              <div className={`transition-all duration-700 ease-in-out overflow-hidden transform origin-top ${investorForm ? 'max-h-[500px] opacity-100 mt-4 translate-y-0 scale-100' : 'max-h-0 opacity-0 mt-0 -translate-y-4 scale-95'}`}>
                <form onSubmit={(e) => handleSubmit(e, 'investor')} className="flex flex-col gap-4 relative z-10">
                  <h3 className="text-white font-medium mb-1">{investorForm === 'login' ? 'Yatırımcı Girişi' : 'Yatırımcı Hesabı Oluştur'}</h3>
                  
                  {errorMsg && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{errorMsg}</div>}

                  <div className={`transition-all duration-700 ease-in-out overflow-hidden transform origin-top ${investorForm === 'signup' ? 'max-h-[100px] opacity-100 translate-y-0 scale-100' : 'max-h-0 opacity-0 -translate-y-4 scale-95'}`}>
                    <input required={investorForm === 'signup'} value={fullName} onChange={e => setFullName(e.target.value)} type="text" placeholder="Ad Soyad" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-sun-green/50 focus:ring-1 focus:ring-sun-green/50 transition-all placeholder:text-gray-500" />
                  </div>
                  
                  <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="E-posta Adresi" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-sun-green/50 focus:ring-1 focus:ring-sun-green/50 transition-all placeholder:text-gray-500" />
                  <input required value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Şifre" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-sun-green/50 focus:ring-1 focus:ring-sun-green/50 transition-all placeholder:text-gray-500" />
                  
                  <div className="flex gap-3 mt-2">
                    <button disabled={loading} type="submit" className="flex-1 whitespace-nowrap bg-gradient-to-r from-sun-green to-emerald-500 text-black font-bold py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:scale-100">
                      {loading ? 'Bekleniyor...' : (investorForm === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
                    </button>
                    <button type="button" onClick={() => handleInvestorAction(null)} className="px-4 py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center justify-center flex-shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Proje Sahibi Kartı */}
          <div 
            className={`glass-panel rounded-3xl flex flex-col group relative transition-all duration-700 ease-in-out border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transform origin-center overflow-hidden
            ${investorForm 
              ? 'w-0 max-w-0 opacity-0 p-0 m-0 border-0 scale-75' 
              : (ownerForm 
                   ? 'w-full md:w-[600px] flex-none p-5 md:p-8 ring-2 ring-brand-blue/30 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] scale-[1.02] -translate-y-2' 
                   : 'w-full flex-1 p-5 md:p-8 hover:border-brand-blue/40 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] hover:-translate-y-1'
                )
            }`}
          >
            {/* Inner Wrapper to maintain content width while container shrinks */}
            <div className="w-full min-w-[280px]">
              <div className={`absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent transition-opacity duration-700 ${ownerForm ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
              
              <div className="flex items-center mb-4 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 bg-gradient-to-br from-sun-dark to-gray-900 border border-brand-blue/30 rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-5 shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform duration-500">
                  <HardHat className="w-6 h-6 md:w-8 md:h-8 text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide whitespace-nowrap">Alanını Değerlendir</h2>
                  <p className="text-gray-400 text-sm md:text-base mt-1 line-clamp-2">Projenizi oluşturun, fonlamaya açın.</p>
                </div>
              </div>
              
              {/* Action Buttons (Fade out when form is active) */}
              <div className={`transition-all duration-700 ease-in-out overflow-hidden flex flex-col transform origin-top ${!ownerForm ? 'max-h-[100px] opacity-100 mt-2 translate-y-0 scale-100' : 'max-h-0 opacity-0 mt-0 translate-y-4 scale-95'}`}>
                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                  <button 
                    onClick={() => handleOwnerAction('login')}
                    className="flex-1 whitespace-nowrap bg-gradient-to-r from-brand-blue to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center"
                  >
                    Giriş Yap <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
                  </button>
                  <button 
                    onClick={() => handleOwnerAction('signup')}
                    className="flex-1 whitespace-nowrap bg-white/5 backdrop-blur-md border border-white/20 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-white/10 hover:border-brand-blue/50 hover:text-brand-blue hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all"
                  >
                    Kayıt Ol
                  </button>
                </div>
              </div>

              {/* Form Section (Expands when active) */}
              <div className={`transition-all duration-700 ease-in-out overflow-hidden transform origin-top ${ownerForm ? 'max-h-[500px] opacity-100 mt-4 translate-y-0 scale-100' : 'max-h-0 opacity-0 mt-0 -translate-y-4 scale-95'}`}>
                <form onSubmit={(e) => handleSubmit(e, 'owner')} className="flex flex-col gap-4 relative z-10">
                  <h3 className="text-white font-medium mb-1">{ownerForm === 'login' ? 'Geliştirici Girişi' : 'Geliştirici Hesabı Oluştur'}</h3>
                  
                  {errorMsg && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{errorMsg}</div>}

                  <div className={`transition-all duration-700 ease-in-out overflow-hidden transform origin-top ${ownerForm === 'signup' ? 'max-h-[100px] opacity-100 translate-y-0 scale-100' : 'max-h-0 opacity-0 -translate-y-4 scale-95'}`}>
                    <input required={ownerForm === 'signup'} value={fullName} onChange={e => setFullName(e.target.value)} type="text" placeholder="Firma / Ad Soyad" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all placeholder:text-gray-500" />
                  </div>
                  
                  <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="E-posta Adresi" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all placeholder:text-gray-500" />
                  <input required value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Şifre" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all placeholder:text-gray-500" />
                  
                  <div className="flex gap-3 mt-2">
                    <button disabled={loading} type="submit" className="flex-1 whitespace-nowrap bg-gradient-to-r from-brand-blue to-blue-500 text-white font-bold py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:scale-100">
                      {loading ? 'Bekleniyor...' : (ownerForm === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
                    </button>
                    <button type="button" onClick={() => handleOwnerAction(null)} className="px-4 py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center justify-center flex-shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>

        {/* Informational Section - BOTTOM (Fades out and shrinks when a form is active) */}
        <div className={`transition-all duration-700 ease-in-out transform origin-top flex flex-col ${isAnyFormActive ? 'opacity-0 h-0 max-h-0 overflow-hidden m-0 p-0 scale-95 border-0' : 'opacity-100 max-h-[1000px] glass-panel p-5 md:p-10 rounded-3xl animate-in fade-in slide-in-from-bottom-10 delay-500 shadow-2xl backdrop-blur-xl border border-white/10 scale-100'}`}>
          <h2 className="text-xl md:text-3xl font-bold text-white mb-4 md:mb-6 flex items-center border-b border-white/10 pb-3 md:pb-4">
            <Info className="w-6 h-6 md:w-8 md:h-8 text-sun-green mr-2 md:mr-3 flex-shrink-0" /> SunShare Ekosistemi
          </h2>
          
          <div className="space-y-6">
            <p className="text-gray-200 text-base md:text-xl leading-relaxed font-light">
              SunShare, yenilenebilir enerji yatırımlarını tamamen demokratikleştiren, uydu verileri ve yapay zeka destekli yeni nesil bir <strong className="text-white font-medium">dijital kitle fonlama</strong> ve analiz platformudur. Geleneksel enerji yatırımlarının aksine, binlerce dolarlık başlangıç sermayesine ihtiyaç duymadan, dilediğiniz bütçeyle temiz enerji projelerine ortak olmanızı sağlar.
            </p>
            
            <p className="text-gray-200 text-sm md:text-lg leading-relaxed font-light border-l-2 border-sun-green/50 pl-3 md:pl-4 bg-sun-green/5 rounded-r-xl py-2 md:py-3">
              Amacımız, küresel karbon ayak izini azaltırken yatırımcılara şeffaf, izlenebilir ve yüksek getirili bir portföy sunmaktır. Her bir güneş paneli, dijital olarak tokenize edilerek blokzincir altyapısında güvence altına alınır.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mt-6 md:mt-10">
              <div className="flex items-start group">
                <div className="bg-gradient-to-br from-sun-green/20 to-emerald-500/10 p-3 rounded-xl mr-5 mt-1 border border-sun-green/20 group-hover:border-sun-green/50 transition-colors duration-500">
                  <Zap className="w-6 h-6 text-sun-green" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-sun-green transition-colors duration-300">Temiz Enerjiye Doğrudan Yatırım</h3>
                  <p className="text-base text-gray-400 leading-relaxed">Aracı kurumları, bankaları ve gizli komisyonları ortadan kaldırarak projelerin ürettiği enerjiden elde edilen gelirlere doğrudan paydaş olun. Günlük üretim verileri anlık olarak cüzdanınıza yansır.</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="bg-gradient-to-br from-brand-blue/20 to-blue-500/10 p-3 rounded-xl mr-5 mt-1 border border-brand-blue/20 group-hover:border-brand-blue/50 transition-colors duration-500">
                  <Globe className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-brand-blue transition-colors duration-300">Uydu Destekli PVGIS Analizleri</h3>
                  <p className="text-base text-gray-400 leading-relaxed">Avrupa Birliği PVGIS (Photovoltaic Geographical Information System) veritabanı entegrasyonu ile yatırım yapacağınız veya kuracağınız projenin milimetrik radyasyon verilerini ve 25 yıllık detaylı finansal amortisman (ROI) tablosunu inceleyin.</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 p-3 rounded-xl mr-5 mt-1 border border-purple-500/20 group-hover:border-purple-500/50 transition-colors duration-500">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-purple-400 transition-colors duration-300">Güvenilir ve Şeffaf Sistem</h3>
                  <p className="text-base text-gray-400 leading-relaxed">Gelişmiş akıllı kontrat mimarisi ile her yatırımınız dijital olarak doğrulanır. Üretilen enerji miktarı, bakım masrafları ve net kazanç oranları 7/24 şeffaf bir şekilde izlenebilir.</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 p-3 rounded-xl mr-5 mt-1 border border-amber-500/20 group-hover:border-amber-500/50 transition-colors duration-500">
                  <LineChart className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-amber-400 transition-colors duration-300">Dinamik İkincil Pazar</h3>
                  <p className="text-base text-gray-400 leading-relaxed">Sahip olduğunuz dijital güneş paneli hisselerini dilediğiniz an ikincil piyasamızda diğer kullanıcılara güncel değerinden satabilir, portföyünüzü anında nakde çevirebilirsiniz.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Info Center Section */}
        <div className={`transition-all duration-700 ease-in-out transform origin-top flex flex-col mt-8 ${isAnyFormActive ? 'opacity-0 h-0 max-h-0 overflow-hidden m-0 p-0 scale-95 border-0' : 'opacity-100 max-h-[5000px] animate-in fade-in slide-in-from-bottom-10 delay-700 scale-100'}`}>
          <InfoCenter />
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
