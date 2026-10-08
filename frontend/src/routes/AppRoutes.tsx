import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import AdminRoutes from './AdminRoutes';
import OfficerRoutes from './OfficerRoutes';
import CitizenRoutes from './CitizenRoutes';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Citizen Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['citizen', 'admin']} />}>
        <Route path="/dashboard/*" element={<CitizenRoutes />} />
      </Route>

      {/* Officer Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['officer', 'admin']} />}>
        <Route path="/officer/*" element={<OfficerRoutes />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>

      <Route path="/unauthorized" element={<div className="p-8 h-screen w-full flex items-center justify-center text-red-500 text-xl font-bold">Unauthorized Access</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
