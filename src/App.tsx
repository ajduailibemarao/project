import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Bidders from './pages/Bidders';
import BiddingProcesses from './pages/BiddingProcesses';
import DirectContracts from './pages/DirectContracts';
import Penalties from './pages/Penalties';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Context
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bidders" element={<Bidders />} />
            <Route path="bidding-processes" element={<BiddingProcesses />} />
            <Route path="direct-contracts" element={<DirectContracts />} />
            <Route path="penalties" element={<Penalties />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;