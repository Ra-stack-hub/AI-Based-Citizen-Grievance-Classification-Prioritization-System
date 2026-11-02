import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CitizenLayout from '../components/layout/CitizenLayout';
import CitizenDashboard from '../pages/Citizen/CitizenDashboard';
import ReportIssue from '../pages/Citizen/ReportIssue';
import ComplaintHistory from '../pages/Citizen/ComplaintHistory';

const CitizenRoutes = () => {
  return (
    <Routes>
      <Route element={<CitizenLayout />}>
        <Route path="/" element={<CitizenDashboard />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/history" element={<ComplaintHistory />} />
      </Route>
    </Routes>
  );
};

export default CitizenRoutes;
