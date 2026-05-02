import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AnalysisPage from './pages/AnalysisPage';
import MarketplacePage from './pages/MarketplacePage';
import { supabase } from './lib/supabase';

function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setRole(session?.user?.user_metadata?.role || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setRole(session?.user?.user_metadata?.role || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-sun-green font-bold text-xl">Yükleniyor...</div>;
  }

  if (!role) {
    return <LoginPage />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout role={role} onLogout={handleLogout} />}>
          {role === 'investor' ? (
            <>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route index element={<Navigate to="/owner-dashboard" replace />} />
              <Route path="owner-dashboard" element={<OwnerDashboardPage />} />
              <Route path="analysis" element={<AnalysisPage />} />
              <Route path="*" element={<Navigate to="/owner-dashboard" replace />} />
            </>
          )}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
