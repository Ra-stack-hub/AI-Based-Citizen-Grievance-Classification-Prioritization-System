import React from 'react';
import { Search, Filter, MoreVertical } from 'lucide-react';

const AdminUsers = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">User Management</h1>
          <p className="text-slate-500 font-medium mt-1">Manage citizens, officers, and system admins</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors">
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="relative w-64">
            <input type="text" placeholder="Search users..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-2 rounded-md bg-white">
            <Filter className="w-4 h-4" /> Filter Role
          </button>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">Name</th>
              <th className="px-6 py-4 border-b border-slate-200">Email</th>
              <th className="px-6 py-4 border-b border-slate-200">Role</th>
              <th className="px-6 py-4 border-b border-slate-200">Status</th>
              <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3].map((i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold text-slate-800">John Doe {i}</td>
                <td className="px-6 py-4 text-slate-500">john{i}@example.com</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${i===1 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                    {i===1 ? 'Admin' : 'Citizen'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5 ml-auto" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
