import React from 'react';
import { Sun, Wallet, HardHat, ArrowRight } from 'lucide-react';

function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-black text-sun-text flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-sun-green/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute top-1/2 right-1/4 transform translate-x-1/4 -translate-y-1/2 w-[50vw] h-[50vw] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow" style={{animationDelay: '2s'}}></div>

      {/* Header */}
      <div className="text-center mb-16 relative z-10 animate-in fade-in slide-in-from-top-10 duration-1000">
        <div className="flex items-center justify-center mb-6">
          <Sun className="h-14 w-14 text-sun-green animate-float mr-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
            SUN<span className="text-transparent bg-clip-text bg-gradient-to-r from-sun-green to-emerald-300">SHARE</span>
          </h1>
        </div>
        <p className="text-gray-400 text-xl font-light tracking-wide max-w-2xl mx-auto">
          Yeni nesil güneş enerjisi analiz ve dijital kitle fonlama platformuna hoş geldiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full relative z-10">
        
        {/* Yatırımcı Kartı */}
        <button 
          onClick={() => onLogin('investor')}
          className="glass-panel p-10 rounded-3xl flex flex-col items-start text-left group hover:border-sun-green/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] transition-all duration-500 relative overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700 delay-150"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sun-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-sun-green/10 group-hover:border-sun-green/30 transition-all duration-500 shadow-lg">
            <Wallet className="w-8 h-8 text-white group-hover:text-sun-green transition-colors" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-sun-green transition-colors">Yatırımcı Girişi</h2>
          <p className="text-gray-400 mb-10 flex-1 text-lg font-light leading-relaxed">
            Dijital hisselerle doğrulanmış projelere ortak olun, şeffaf getiri analiziyle portföyünüzü büyütün.
          </p>
          <div className="flex items-center text-white/70 group-hover:text-sun-green font-medium text-lg mt-auto transition-colors">
            Portföyüme Git <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
          </div>
        </button>

        {/* Proje Sahibi Kartı */}
        <button 
          onClick={() => onLogin('owner')}
          className="glass-panel p-10 rounded-3xl flex flex-col items-start text-left group hover:border-brand-blue/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] transition-all duration-500 relative overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-brand-blue/10 group-hover:border-brand-blue/30 transition-all duration-500 shadow-lg">
            <HardHat className="w-8 h-8 text-white group-hover:text-brand-blue transition-colors" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-brand-blue transition-colors">Geliştirici Paneli</h2>
          <p className="text-gray-400 mb-10 flex-1 text-lg font-light leading-relaxed">
            Uydu destekli PVGIS fizibilite analizleri yapın, projelerinizi kitle fonlamasına açın ve yönetin.
          </p>
          <div className="flex items-center text-white/70 group-hover:text-brand-blue font-medium text-lg mt-auto transition-colors">
            Analiz Paneline Git <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
          </div>
        </button>

      </div>
    </div>
  );
}

export default LoginPage;
