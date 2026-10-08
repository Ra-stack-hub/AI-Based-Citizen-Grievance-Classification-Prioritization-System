import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const CitizenDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Citizen'}!</h1>
        <p className="text-blue-100 max-w-xl">
          Report issues in your neighborhood directly to the concerned department. Your active participation makes our city smarter and cleaner.
        </p>
        <div className="mt-6 flex gap-4">
          <Link to="/dashboard/report" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-sm">
            Report New Issue
          </Link>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4">Your Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Reported</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">5</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">In Progress</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">2</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Resolved</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">3</h3>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Activity</h2>
          <Link to="/dashboard/history" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Pothole on Main Street</h4>
                    <p className="text-sm text-gray-500">Reported on Oct 1, 2026</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full whitespace-nowrap">
                  In Progress
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
