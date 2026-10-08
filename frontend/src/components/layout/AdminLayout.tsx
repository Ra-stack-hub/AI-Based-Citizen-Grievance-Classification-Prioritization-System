import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminChatbot from '../chat/AdminChatbot';
import { LogOut, LayoutDashboard, Users, Settings, Database, Activity } from 'lucide-react';

const AdminLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl shadow-indigo-500/10">
        <div className="p-6 bg-slate-950 border-b border-slate-800">
          <h2 className="text-2xl font-black text-indigo-500 flex items-center gap-2 tracking-tight">
            <Database className="w-6 h-6" /> DATACORE
          </h2>
          <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-bold">Admin Terminal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/admin" className="flex items-center gap-3 p-3 text-sm font-medium hover:bg-indigo-600/10 hover:text-indigo-400 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Overview
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 p-3 text-sm font-medium hover:bg-indigo-600/10 hover:text-indigo-400 rounded-lg transition-colors">
            <Users className="w-5 h-5" /> User Management
          </Link>
          <Link to="/admin/analytics" className="flex items-center gap-3 p-3 text-sm font-medium hover:bg-indigo-600/10 hover:text-indigo-400 rounded-lg transition-colors">
            <Activity className="w-5 h-5" /> System Analytics
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 p-3 text-sm font-medium hover:bg-indigo-600/10 hover:text-indigo-400 rounded-lg transition-colors">
            <Settings className="w-5 h-5" /> Configurations
          </Link>
        </nav>
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="text-sm font-medium text-white truncate">
              {user?.full_name || 'System Admin'}
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-md transition-all font-medium border border-rose-500/20 hover:border-transparent text-sm">
            <LogOut className="w-4 h-4" /> System Disconnect
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        {/* Background decorative pattern for Admin view */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <AdminChatbot />
    </div>
  );
};

export default AdminLayout;
