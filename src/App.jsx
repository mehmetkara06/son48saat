import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AnalysisPage from './pages/AnalysisPage';
import MarketplacePage from './pages/MarketplacePage';

function App() {
  // role: 'investor' | 'owner' | null
  const [role, setRole] = useState(null);

  if (!role) {
    return <LoginPage onLogin={setRole} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout role={role} onLogout={() => setRole(null)} />}>
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
