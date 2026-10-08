import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CitizenChatbot from '../chat/CitizenChatbot';
import { LogOut, Home, AlertCircle, Clock } from 'lucide-react';

const CitizenLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg hidden md:flex flex-col border-r dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            GrievAI
          </h2>
          <p className="text-sm text-gray-500 mt-1">Citizen Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium">
            <Home className="w-5 h-5 text-blue-500" /> Dashboard
          </Link>
          <Link to="/report" className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium">
            <AlertCircle className="w-5 h-5 text-blue-500" /> Report Issue
          </Link>
          <Link to="/history" className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium">
            <Clock className="w-5 h-5 text-blue-500" /> My History
          </Link>
        </nav>
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300 truncate px-2">
            {user?.full_name || 'Citizen User'}
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors font-medium">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <CitizenChatbot />
    </div>
  );
};

export default CitizenLayout;
