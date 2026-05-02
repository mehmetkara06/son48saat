import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, ShoppingCart, Sun, Bell, LogOut, User, Settings, Moon, Sun as SunIcon, X, ShieldCheck, Wallet, ArrowDownToLine, ArrowUpFromLine, Building2, CreditCard, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function Layout({ role, onLogout, userFullName }) {
  const isInvestor = role === 'investor';
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('idle');
  const [passwordError, setPasswordError] = useState('');

  // Wallet States
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('sunshare_balance');
    return saved !== null ? parseFloat(saved) : 12450.00;
  });

  useEffect(() => {
    localStorage.setItem('sunshare_balance', balance.toString());
  }, [balance]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTab, setWalletTab] = useState('deposit'); // 'deposit' | 'withdraw'
  const [walletMethod, setWalletMethod] = useState('card'); // 'iban' | 'card'
  const [walletAmount, setWalletAmount] = useState('');
  const [walletStatus, setWalletStatus] = useState('idle'); // 'idle' | 'processing' | 'success'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    setIsLightTheme(document.body.classList.contains('light-theme'));
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const isLight = document.body.classList.toggle('light-theme');
    setIsLightTheme(isLight);
    setShowProfileMenu(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus('error');
      setPasswordError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setPasswordStatus('processing');
    setPasswordError('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus('error');
      setPasswordError(error.message);
    } else {
      setPasswordStatus('success');
      setTimeout(() => {
        setShowSettingsModal(false);
        setPasswordStatus('idle');
        setNewPassword('');
      }, 2000);
    }
  };

  const handleWalletSubmit = (e) => {
    e.preventDefault();
    setWalletStatus('processing');
    setTimeout(() => {
      setWalletStatus('success');
      
      const amount = parseFloat(walletAmount);
      if (walletTab === 'deposit') {
        setBalance(prev => prev + amount);
      } else {
        setBalance(prev => prev - amount);
      }

      setTimeout(() => {
        setShowWalletModal(false);
        setWalletStatus('idle');
        setWalletAmount('');
      }, 3000);
    }, 1500);
  };

  const navItems = isInvestor ? [
    { name: 'Portföyüm', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Pazar Yeri', path: '/marketplace', icon: ShoppingCart },
  ] : [
    { name: 'Projelerim', path: '/owner-dashboard', icon: LayoutDashboard },
    { name: 'Fizibilite Analizi', path: '/analysis', icon: Map },
  ];

  const accentColor = isInvestor ? 'text-sun-green' : 'text-brand-blue';
  const bgActive = isInvestor ? 'bg-sun-green/10' : 'bg-brand-blue/10';
  const hoverActive = isInvestor ? 'hover:text-sun-green hover:bg-sun-green/10' : 'hover:text-brand-blue hover:bg-brand-blue/10';

  return (
    <div className="min-h-screen bg-black text-sun-text flex flex-col relative font-sans">
      
      {/* Background Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 pointer-events-none bg-sun-green z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 pointer-events-none bg-brand-blue z-0"></div>

      {/* Floating Pill Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className={cn(
          "glass-pill rounded-full px-2 py-2 flex items-center gap-1 transition-all duration-500 pointer-events-auto relative",
          scrolled ? "py-1 shadow-2xl bg-black/60" : "py-2"
        )}>
          {/* Logo Section */}
          <div className="flex items-center px-4 pr-6 border-r border-white/10">
            <Sun className={cn("h-6 w-6 mr-2 animate-pulse-slow", accentColor)} />
            <span className="font-bold text-lg tracking-wide text-white">
              SUN<span className={accentColor}>SHARE</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center px-2 gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-2.5 rounded-full transition-all duration-300 text-sm font-medium",
                    isActive 
                      ? `${bgActive} ${accentColor} shadow-inner` 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )
                }
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center pl-4 pr-2 border-l border-white/10 gap-2 relative">
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                className={cn("p-2.5 rounded-full transition-colors relative", showNotifications ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5")}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute top-12 right-[-60px] w-64 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                    <h4 className="text-sm font-bold text-white">Bildirimler</h4>
                  </div>
                  <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                    <Bell className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">Henüz bildirim yok</p>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-white/10 mx-1"></div>

            {/* Profile Menu */}
            <div className="relative flex items-center">
              <button 
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
                  showProfileMenu ? "bg-white/10 text-white" : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <div className={cn("flex items-center justify-center h-8 w-8 rounded-full border border-white/10", bgActive, accentColor)}>
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold hidden md:block max-w-[100px] truncate">{userFullName || 'Kullanıcı'}</span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute top-12 right-0 w-56 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="p-4 border-b border-white/5">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Hesap</p>
                    <p className="text-sm font-bold text-white truncate">{userFullName || 'Kullanıcı'}</p>
                    <p className="text-xs text-gray-400 capitalize">{role === 'investor' ? 'Yatırımcı' : 'Geliştirici'}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => { setShowWalletModal(true); setShowProfileMenu(false); }}
                      className={`w-full flex items-center px-3 py-2 text-sm text-gray-300 rounded-xl transition-colors ${hoverActive}`}
                    >
                      <Wallet className="w-4 h-4 mr-3" /> Cüzdanım
                    </button>
                    <button 
                      onClick={() => { setShowSettingsModal(true); setShowProfileMenu(false); }}
                      className={`w-full flex items-center px-3 py-2 text-sm text-gray-300 rounded-xl transition-colors ${hoverActive}`}
                    >
                      <Settings className="w-4 h-4 mr-3" /> Ayarlar
                    </button>
                    <button 
                      onClick={toggleTheme}
                      className={`w-full flex items-center px-3 py-2 text-sm text-gray-300 rounded-xl transition-colors ${hoverActive}`}
                    >
                      {isLightTheme ? <Moon className="w-4 h-4 mr-3" /> : <SunIcon className="w-4 h-4 mr-3" />} 
                      {isLightTheme ? 'Karanlık Mod' : 'Aydınlık Mod'}
                    </button>
                  </div>
                  <div className="p-2 border-t border-white/5">
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" /> Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-12 px-6 max-w-7xl mx-auto w-full relative z-10">
        <Outlet context={{ balance, setBalance }} />
      </main>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => walletStatus !== 'processing' && setShowWalletModal(false)}></div>
          
          <div className="glass-panel w-full max-w-md bg-[#0a0a0a] border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden">
            {walletStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-20 h-20 bg-sun-green/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-sun-green" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">İşlem Başarılı!</h3>
                <p className="text-gray-400">
                  {walletTab === 'deposit' 
                    ? 'Para yatırma işleminiz başarıyla tamamlandı. Bakiye güncellendi.' 
                    : 'Çekim işleminiz işleme alındı. Tutar hesabınıza aktarılacaktır.'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-sun-green" />
                    Cüzdanım
                  </h3>
                  <button onClick={() => setShowWalletModal(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6 bg-sun-green/10 border border-sun-green/20 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-gray-300 text-sm font-medium">Mevcut Bakiye</span>
                  <span className="text-3xl font-extrabold text-sun-green drop-shadow-md">
                    ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex gap-2 p-1 bg-black/40 border border-white/10 rounded-xl mb-6">
                  <button 
                    onClick={() => { setWalletTab('deposit'); setWalletMethod('card'); setWalletAmount(''); }}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${walletTab === 'deposit' ? 'bg-sun-green text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                  >
                    <ArrowDownToLine className="w-4 h-4 mr-2" /> Para Yatır
                  </button>
                  <button 
                    onClick={() => { setWalletTab('withdraw'); setWalletMethod('iban'); setWalletAmount(''); }}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${walletTab === 'withdraw' ? 'bg-sun-green text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                  >
                    <ArrowUpFromLine className="w-4 h-4 mr-2" /> Para Çek
                  </button>
                </div>

                <form onSubmit={handleWalletSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tutar (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
                      <input 
                        required 
                        type="number" 
                        min="50" 
                        max={walletTab === 'withdraw' ? balance : 100000}
                        value={walletAmount}
                        onChange={(e) => setWalletAmount(e.target.value)}
                        placeholder="0.00" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-sun-green/50 transition-all font-semibold text-lg" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Yöntem</label>
                    <div className="flex gap-2 p-1 bg-black/40 border border-white/10 rounded-xl">
                      <button 
                        type="button"
                        onClick={() => setWalletMethod('card')}
                        className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-all ${walletMethod === 'card' ? 'bg-white/10 text-white shadow-md border border-white/5' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
                      >
                        <CreditCard className="w-4 h-4 mr-2" /> Kredi Kartı
                      </button>
                      <button 
                        type="button"
                        onClick={() => setWalletMethod('iban')}
                        className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-all ${walletMethod === 'iban' ? 'bg-white/10 text-white shadow-md border border-white/5' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
                      >
                        <Building2 className="w-4 h-4 mr-2" /> Banka (IBAN)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {walletMethod === 'iban' ? (
                      <>
                        <input required type="text" placeholder="Hesap Sahibi (Ad Soyad)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sun-green/50 transition-all text-sm" />
                        <input required type="text" placeholder="TR00 0000 0000 0000 0000 0000 00" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sun-green/50 transition-all text-sm font-mono" />
                      </>
                    ) : (
                      <>
                        <input required type="text" placeholder="Kart Üzerindeki İsim" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sun-green/50 transition-all text-sm" />
                        <input required type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sun-green/50 transition-all text-sm font-mono" />
                        <div className="flex gap-4">
                          <input required type="text" placeholder="AA/YY" maxLength={5} className="w-1/2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sun-green/50 transition-all text-sm" />
                          <input required type="text" placeholder="CVV" maxLength={3} className="w-1/2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sun-green/50 transition-all text-sm" />
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    disabled={walletStatus === 'processing' || !walletAmount} 
                    type="submit" 
                    className="w-full bg-sun-green text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-6 flex items-center justify-center text-lg disabled:opacity-50"
                  >
                    {walletStatus === 'processing' ? 'İşleniyor...' : walletTab === 'deposit' ? 'Para Yatır' : 'Talebi Onayla'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Settings / Password Change Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => passwordStatus !== 'processing' && setShowSettingsModal(false)}></div>
          <div className="glass-panel w-full max-w-sm bg-[#0a0a0a] border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
            {passwordStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center text-center py-4">
                <div className="w-16 h-16 bg-sun-green/20 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-sun-green" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Şifre Güncellendi</h3>
                <p className="text-sm text-gray-400">Yeni şifreniz başarıyla kaydedildi.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Hesap Ayarları</h3>
                  <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-300 mb-4 border-b border-white/10 pb-2">Şifre Değiştir</h4>
                  {passwordError && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mb-4">{passwordError}</div>}
                  <form onSubmit={handlePasswordChange}>
                    <input 
                      required 
                      type="password" 
                      placeholder="Yeni Şifre" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sun-green/50 transition-all text-sm mb-4" 
                    />
                    <button 
                      disabled={passwordStatus === 'processing' || !newPassword}
                      type="submit" 
                      className={`w-full font-bold py-3 rounded-xl transition-all duration-300 ${isInvestor ? 'bg-sun-green text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-brand-blue text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'} disabled:opacity-50`}
                    >
                      {passwordStatus === 'processing' ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}

export default Layout;
