import React, { useEffect, useState } from 'react';
import { FileText, MapPin, Search, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useComplaint } from '../../hooks/useComplaint';

const ComplaintHistory = () => {
  const { getComplaints, loading } = useComplaint();
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getComplaints();
        if(data && data.length > 0) {
          setComplaints(data);
        } else {
          setComplaints([
            { _id: '1', title: 'Street light not working', status: 'resolved', created_at: '2026-09-28T10:00:00', location: { address: 'Sector 4, Park Road' }, ai_analysis: { predicted_department: 'Electricity' } },
            { _id: '2', title: 'Garbage dump overflow', status: 'pending', created_at: '2026-10-01T14:30:00', location: { address: 'Market Square' }, ai_analysis: { predicted_department: 'Sanitation' } },
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><CheckCircle2 className="w-3 h-3"/> Resolved</span>;
      case 'in_progress':
        return <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium"><AlertCircle className="w-3 h-3"/> In Progress</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"><Clock className="w-3 h-3"/> Pending</span>;
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Complaints</h1>
          <p className="text-gray-500 mt-2">Track the status of all your reported issues.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search complaints..." 
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white min-w-[250px]"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading your history...</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {complaints.map((c) => (
              <div key={c._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{c.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {c.location?.address || 'Unknown'}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(c.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {c.ai_analysis?.predicted_department || 'Processing...'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                    {getStatusBadge(c.status)}
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                  </div>
                </div>
              </div>
            ))}
            
            {complaints.length === 0 && (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No complaints yet</h3>
                <p className="text-gray-500 mt-1">You haven't reported any issues.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintHistory;
