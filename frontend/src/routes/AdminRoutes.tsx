import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminAnalytics from '../pages/admin/AdminAnalytics';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
        <Route path="/settings" element={<div className="p-8 text-slate-800 font-bold text-xl">System Settings Module</div>} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
