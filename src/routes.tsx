import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import Residues from './pages/Residues';
import Piles from './pages/Piles';
import Configuration from './pages/Configuration';
import Microbiology from './pages/Microbiology';
import Clients from './pages/Clients';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/farms" element={<Farms />} />
      <Route path="/composting/residues" element={<Residues />} />
      <Route path="/composting/piles" element={<Piles />} />
      <Route path="/configuration" element={<Configuration />} />
      <Route path="/microbiology" element={<Microbiology />} />
      <Route path="/clients" element={<Clients />} />
    </Routes>
  );
};

export default AppRoutes