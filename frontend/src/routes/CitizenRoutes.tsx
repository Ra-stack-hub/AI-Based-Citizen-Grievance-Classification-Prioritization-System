import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CitizenLayout from '../components/layout/CitizenLayout';
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import ReportIssue from '../pages/citizen/ReportIssue';
import ComplaintHistory from '../pages/citizen/ComplaintHistory';

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
