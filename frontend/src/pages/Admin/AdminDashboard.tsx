import React from 'react';
import { Users, AlertTriangle, CheckCircle, Activity, BarChart3, Clock } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Overview</h1>
        <p className="text-slate-500 font-medium mt-1">Real-time status of GrievAI infrastructure</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Users</p>
              <h3 className="text-3xl font-black text-slate-800">1,248</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-emerald-600 font-semibold flex items-center gap-1">
            <Activity className="w-4 h-4" /> +12% this week
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Active Issues</p>
              <h3 className="text-3xl font-black text-slate-800">42</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-rose-600 font-semibold flex items-center gap-1">
            <Activity className="w-4 h-4" /> +5% this week
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Resolved</p>
              <h3 className="text-3xl font-black text-slate-800">892</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500 font-medium flex items-center gap-1">
            85% resolution rate
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Avg Resolution</p>
              <h3 className="text-3xl font-black text-slate-800">48h</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-emerald-600 font-semibold flex items-center gap-1">
            <Activity className="w-4 h-4" /> -5h faster
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[300px] flex flex-col items-center justify-center">
           <BarChart3 className="w-16 h-16 text-slate-200 mb-4" />
           <p className="text-slate-500 font-medium">Analytics Chart Module</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-4">System Alerts</h3>
           <div className="space-y-4">
             <div className="flex gap-4 items-start p-4 bg-rose-50 rounded-lg border border-rose-100">
               <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
               <div>
                 <h4 className="font-bold text-rose-800">High volume of Sanitation reports</h4>
                 <p className="text-sm text-rose-600 mt-1">AI detected a 40% surge in garbage-related complaints in Sector 4.</p>
               </div>
             </div>
             <div className="flex gap-4 items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
               <Activity className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
               <div>
                 <h4 className="font-bold text-blue-800">Database Backup Successful</h4>
                 <p className="text-sm text-blue-600 mt-1">Automated routine backup completed at 02:00 AM.</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
