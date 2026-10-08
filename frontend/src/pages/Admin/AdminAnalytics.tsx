import React from 'react';
import { BarChart3 } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Analytics</h1>
        <p className="text-slate-500 font-medium mt-1">Deep dive into complaint data and AI predictions</p>
      </div>

      <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
        <BarChart3 className="w-24 h-24 text-indigo-200 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">Detailed Analytics Coming Soon</h2>
        <p className="text-slate-500 max-w-md mt-2">This module will include AI-generated heatmaps, category distribution charts, and predictive analysis of future issues.</p>
      </div>
    </div>
  );
};

export default AdminAnalytics;
