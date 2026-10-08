import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, MapPin, Clock, Check, RefreshCw } from 'lucide-react';

const ComplaintReview = () => {
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isInProgressing, setIsInProgressing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [progressNote, setProgressNote] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchComplaint = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/complaints/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setComplaint(data);
        }
      } catch (err) {
        console.error("Failed to fetch complaint", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, isAuthenticated, token, navigate]);

  const updateStatus = async (newStatus: string, reason?: string, note?: string) => {
    if (newStatus === 'rejected' && !reason) return;
    if (newStatus === 'in_progress' && !note) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus, 
          rejection_reason: reason,
          progress_note: note 
        })
      });
      if (response.ok) {
        setComplaint({ 
          ...complaint, 
          status: newStatus, 
          rejection_reason: reason,
          progress_note: note 
        });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
      setIsRejecting(false);
      setIsInProgressing(false);
      setRejectReason('');
      setProgressNote('');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex justify-center items-center"><span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (!complaint) {
    return <div className="min-h-screen bg-background text-textPrimary p-10">Complaint not found</div>;
  }

  return (
    <div className="w-full min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${
                complaint.status === 'resolved' ? 'bg-success/20 text-success' : 
                complaint.status === 'rejected' ? 'bg-danger/20 text-danger' :
                'bg-warning/20 text-warning'
              }`}>
                {complaint.status ? complaint.status.replace('_', ' ') : 'NEW'}
              </span>
              <span className="text-xs text-textSecondary font-mono bg-surface shadow-sm px-2 py-1 rounded">
                ID: {complaint._id || complaint.id}
              </span>
            </div>
            
            {complaint.status === 'rejected' && complaint.rejection_reason && (
              <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl">
                <div className="flex items-center gap-2 text-danger font-bold mb-1">
                  <AlertTriangle className="w-5 h-5" /> Complaint Rejected
                </div>
                <p className="text-sm text-textPrimary"><strong>Reason:</strong> {complaint.rejection_reason}</p>
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-textPrimary mb-4">{complaint.title}</h1>
            <p className="text-textSecondary mb-8 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
            
            {complaint.image_url && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-textSecondary mb-3">Attached Evidence</h3>
                <img src={complaint.image_url} alt="Evidence" className="max-h-64 rounded-xl border border-borderLight" />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-surfaceLight p-4 rounded-xl border border-borderLight">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-textSecondary"><MapPin className="w-4 h-4" /> Location</div>
                  {complaint.location?.latitude && (
                    <a 
                      href={`https://www.google.com/maps?q=${complaint.location.latitude},${complaint.location.longitude}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded hover:bg-primary/30 transition-colors"
                    >
                      View Map
                    </a>
                  )}
                </div>
                <div className="text-textPrimary font-medium">{complaint.location?.address || 'N/A'}</div>
                {complaint.location?.latitude && (
                  <div className="text-xs text-textSecondary mt-1">
                    GPS: {complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)}
                  </div>
                )}
              </div>
              <div className="bg-surfaceLight p-4 rounded-xl border border-borderLight">
                <div className="flex items-center gap-2 text-textSecondary mb-1"><Clock className="w-4 h-4" /> Reported on</div>
                <div className="text-textPrimary font-medium">{new Date(complaint.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - AI & Actions */}
        <div className="space-y-6">
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
            <h3 className="text-textPrimary font-medium mb-4 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" /> AI Analysis</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-textSecondary mb-1">Assigned Department</div>
                <div className="text-sm font-medium text-textPrimary">{complaint.ai_analysis?.predicted_department || 'General'}</div>
              </div>
              <div>
                <div className="text-xs text-textSecondary mb-1">Priority Level</div>
                <div className="text-sm font-bold text-danger">{complaint.ai_analysis?.predicted_priority || 'MEDIUM'}</div>
              </div>
              <div>
                <div className="text-xs text-textSecondary mb-1">Sentiment</div>
                <div className="text-sm font-medium text-textPrimary">{complaint.ai_analysis?.sentiment || 'Neutral'}</div>
              </div>
              {complaint.ai_analysis?.is_duplicate && (
                <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg text-xs text-warning mt-4 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Warning: AI detected this as a potential duplicate of an existing grievance.
                </div>
              )}
              {complaint.ai_analysis?.is_fake_image && (
                <div className="bg-danger/10 border border-danger/20 p-3 rounded-lg text-xs text-danger mt-4 flex gap-2 flex-col">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <strong>Suspicious Evidence Alert</strong>
                  </div>
                  <div className="pl-6 text-[11px] opacity-90">
                    The attached evidence might be an AI-generated or downloaded stock image. 
                    <br/>
                    Reason: {complaint.ai_analysis?.image_analysis?.details || 'Failed authenticity checks.'} (Score: {complaint.ai_analysis?.image_authenticity_score})
                  </div>
                </div>
              )}
              {complaint.ai_analysis?.is_spam && (
                <div className="bg-danger/10 border border-danger/20 p-3 rounded-lg text-xs text-danger mt-4 flex gap-2 flex-col">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <strong>Spam / Fake Text Alert</strong>
                  </div>
                  <div className="pl-6 text-[11px] opacity-90">
                    The complaint text has been flagged as potential spam or gibberish.
                    <br/>
                    Score: {(complaint.ai_analysis?.spam_score * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
            <h3 className="text-textPrimary font-medium mb-4">Officer Actions</h3>
            
            {isRejecting ? (
              <div className="space-y-3">
                <textarea 
                  className="w-full bg-surfaceLight border border-borderLight rounded-xl p-3 text-sm focus:border-danger focus:ring-1 focus:ring-danger outline-none"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus('rejected', rejectReason, undefined)}
                    disabled={updating || !rejectReason.trim()}
                    className="flex-1 bg-danger hover:bg-danger/90 text-white font-medium py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Confirm Reject
                  </button>
                  <button 
                    onClick={() => { setIsRejecting(false); setRejectReason(''); }}
                    disabled={updating}
                    className="flex-1 bg-surfaceLight hover:bg-surfaceLight/80 text-textPrimary font-medium py-2 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : isInProgressing ? (
              <div className="space-y-3">
                <textarea 
                  className="w-full bg-surfaceLight border border-borderLight rounded-xl p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  rows={3}
                  placeholder="ETA for completion, reason for delay, or next steps..."
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus('in_progress', undefined, progressNote)}
                    disabled={updating || !progressNote.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Confirm Progress
                  </button>
                  <button 
                    onClick={() => { setIsInProgressing(false); setProgressNote(''); }}
                    disabled={updating}
                    className="flex-1 bg-surfaceLight hover:bg-surfaceLight/80 text-textPrimary font-medium py-2 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => setIsInProgressing(true)}
                  disabled={updating || complaint.status === 'in_progress' || complaint.status === 'resolved' || complaint.status === 'rejected'}
                  className="w-full bg-primary/20 hover:bg-primary/40 border border-primary/30 text-primary font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  Mark In Progress
                </button>
                <button 
                  onClick={() => updateStatus('resolved')}
                  disabled={updating || complaint.status === 'resolved' || complaint.status === 'rejected'}
                  className="w-full bg-success/20 hover:bg-success/40 border border-success/30 text-success font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Resolve Grievance
                </button>
                <button 
                  onClick={() => setIsRejecting(true)}
                  disabled={updating || complaint.status === 'rejected' || complaint.status === 'resolved'}
                  className="w-full bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  Reject Complaint
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComplaintReview;
