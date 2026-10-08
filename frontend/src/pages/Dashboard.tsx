import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Clock, Info } from 'lucide-react';

const Dashboard = () => {
  const { token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchComplaints = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/complaints/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setComplaints(data);
        }
      } catch (err) {
        console.error("Failed to fetch complaints", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [isAuthenticated, token, navigate]);

  return (
    <div className="w-full min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-10 border-b border-borderLight pb-6">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-2">My Grievances</h1>
            <p className="text-textSecondary">Welcome back, {user?.full_name || 'Citizen'}. Track your filed complaints here.</p>
          </div>
          <Link to="/submit" className="bg-primary hover:bg-accent text-background font-semibold py-2 px-6 rounded-full transition-colors text-sm">
            + New Complaint
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-12 text-center">
            <Info className="w-12 h-12 text-textSecondary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-textPrimary mb-2">No complaints filed yet</h3>
            <p className="text-textSecondary mb-6">When you report an issue, it will appear here so you can track its progress.</p>
            <Link to="/submit" className="text-primary hover:underline font-medium">File your first grievance</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint, i) => (
              <motion.div 
                key={complaint._id || complaint.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surfaceLight border border-borderLight hover:bg-surfaceLight shadow-sm rounded-xl p-6 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 mb-3 md:mb-0">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      complaint.ai_analysis?.predicted_priority?.toLowerCase() === 'critical' ? 'bg-danger/20 text-danger border border-danger/30' :
                      complaint.ai_analysis?.predicted_priority?.toLowerCase() === 'high' ? 'bg-warning/20 text-warning border border-warning/30' :
                      'bg-primary/20 text-primary border border-primary/30'
                    }`}>
                      {complaint.ai_analysis?.predicted_priority || 'MEDIUM'}
                    </span>
                    <span className="text-xs text-textSecondary font-mono uppercase bg-surface shadow-sm px-2 py-1 rounded">
                      ID: {(complaint._id || complaint.id)?.substring(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                    <span className="text-sm font-medium text-warning">Pending Review</span>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-textPrimary mb-2">{complaint.title}</h3>
                <p className="text-sm text-textSecondary mb-4 line-clamp-2">{complaint.description}</p>
                
                <div className="flex flex-wrap gap-4 text-xs text-textSecondary">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {complaint.location?.address || 'Unknown'}</span>
                  <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {complaint.ai_analysis?.predicted_department || 'General'}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(complaint.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
