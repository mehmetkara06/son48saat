import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, ShoppingCart, Sun, Bell, LogOut, HardHat, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function Layout({ role, onLogout }) {
  const isInvestor = role === 'investor';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = isInvestor ? [
    { name: 'Portföyüm', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Pazar Yeri', path: '/marketplace', icon: ShoppingCart },
  ] : [
    { name: 'Projelerim', path: '/owner-dashboard', icon: LayoutDashboard },
    { name: 'Fizibilite Analizi', path: '/analysis', icon: Map },
  ];

  const UserIcon = isInvestor ? Wallet : HardHat;
  const accentColor = isInvestor ? 'text-sun-green' : 'text-brand-blue';
  const bgActive = isInvestor ? 'bg-sun-green/10' : 'bg-brand-blue/10';

  return (
    <div className="min-h-screen bg-black text-sun-text flex flex-col relative font-sans">
      
      {/* Background Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 pointer-events-none bg-sun-green z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 pointer-events-none bg-brand-blue z-0"></div>

      {/* Floating Pill Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className={cn(
          "glass-pill rounded-full px-2 py-2 flex items-center gap-1 transition-all duration-500 pointer-events-auto",
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
          <div className="flex items-center pl-4 pr-2 border-l border-white/10 gap-2">
            <button className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <div className="h-8 w-px bg-white/10 mx-1"></div>
            <div className={cn("flex items-center justify-center h-9 w-9 rounded-full border border-white/10", bgActive, accentColor)}>
              <UserIcon className="h-4 w-4" />
            </div>
            <button 
              onClick={onLogout}
              className="ml-1 p-2.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-12 px-6 max-w-7xl mx-auto w-full relative z-10">
        <Outlet />
      </main>
      
    </div>
  );
}

export default Layout;
