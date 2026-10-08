import React from 'react';
import { Routes, Route } from 'react-router-dom';

const OfficerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 font-bold text-2xl">Officer Dashboard Overview</div>} />
      <Route path="/complaints" element={<div className="p-8">Assigned Complaints</div>} />
      <Route path="/reports" element={<div className="p-8">Generate Reports</div>} />
    </Routes>
  );
};

export default OfficerRoutes;
