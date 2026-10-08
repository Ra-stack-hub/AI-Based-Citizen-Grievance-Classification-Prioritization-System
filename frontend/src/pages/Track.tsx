import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Circle } from 'lucide-react';

const Track = () => {
  const [search, setSearch] = useState('');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/api/v1/complaints/public', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setComplaints(data);
          if (data.length > 0) {
            setSelectedTicket(data[0]);
          }
        }
      })
      .catch(err => console.error("Failed to fetch complaints", err));
  }, []);

  const filteredComplaints = complaints.map(c => {
    if (!search.trim()) return { ...c, _searchScore: 1 };
    
    let score = 0;
    const searchTerms = search.toLowerCase().split(' ').filter(t => t);
    
    searchTerms.forEach(s => {
      // ID match is highest priority
      if ((c._id || c.id)?.toLowerCase().includes(s)) score += 10;
      // Title match
      if (c.title?.toLowerCase().includes(s)) score += 5;
      // Description match
      if (c.description?.toLowerCase().includes(s)) score += 3;
      // Department match
      if (c.ai_analysis?.predicted_department?.toLowerCase().includes(s)) score += 2;
      // Keyword match
      if (c.ai_analysis?.keywords?.some((k: string) => k.toLowerCase().includes(s))) score += 2;
    });
    
    return { ...c, _searchScore: score };
  })
  .filter(c => c._searchScore > 0)
  .sort((a, b) => b._searchScore - a._searchScore)
  .slice(0, 50);

  // Auto-select the top result when search changes or filtered list updates
  useEffect(() => {
    if (filteredComplaints.length > 0) {
      const isSelectedInFiltered = filteredComplaints.some(c => (c._id || c.id) === (selectedTicket?._id || selectedTicket?.id));
      if (!isSelectedInFiltered || search.trim() !== '') {
         // Auto select top match when searching
         if (search.trim() !== '' || !isSelectedInFiltered) {
            setSelectedTicket(filteredComplaints[0]);
         }
      }
    } else {
      setSelectedTicket(null);
    }
  }, [search, complaints]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background text-textPrimary p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">Track your grievance</h1>
          <p className="text-textSecondary text-lg max-w-2xl">
            Search by ticket ID or keyword to see the full triage trail.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Search & List */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-textSecondary" />
              </div>
              <input
                type="text"
                placeholder="GRV-2481 or 'pothole'"
                className="w-full bg-surface shadow-sm border border-borderLight rounded-xl py-4 pl-12 pr-4 text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-2 h-[600px] overflow-y-auto space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-borderLight [&::-webkit-scrollbar-thumb]:hover:bg-textSecondary [&::-webkit-scrollbar-thumb]:rounded-full">
              {filteredComplaints.length === 0 ? (
                <div className="p-8 text-center text-textSecondary">No complaints found.</div>
              ) : (
                filteredComplaints.map((ticket) => (
                  <div 
                    key={ticket._id || ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      (selectedTicket?._id || selectedTicket?.id) === (ticket._id || ticket.id) 
                        ? 'bg-surfaceLight shadow-sm border border-primary/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'border border-transparent hover:bg-surfaceLight'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono text-textSecondary uppercase tracking-wider">{(ticket._id || ticket.id)?.substring(0,8) || 'TICKET'}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider ${
                        ticket.status === 'in_progress' ? 'bg-warning/10 text-warning border border-warning/20' :
                        ticket.status === 'assigned' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        ticket.status === 'new' ? 'bg-primary/10 text-primary border border-primary/20' :
                        'bg-success/10 text-success border border-success/20'
                      }`}>
                        {ticket.status?.replace('_', ' ').toUpperCase() || 'NEW'}
                      </span>
                    </div>
                    <h4 className="font-medium text-textPrimary text-sm line-clamp-2 leading-relaxed">{ticket.title}</h4>
                    <div className="mt-3 text-[11px] text-textSecondary flex justify-between items-center">
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span className="capitalize px-2 py-0.5 bg-surfaceLight rounded-md truncate max-w-[120px]">
                        {ticket.ai_analysis?.predicted_department?.replace(' Department', '') || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Ticket Details */}
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-8 sticky top-6 min-h-[500px] flex flex-col justify-center">
            {!selectedTicket ? (
              <div className="text-center text-textSecondary">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Select a ticket from the list to view its tracking details.</p>
              </div>
            ) : (
              <div className="relative pl-4 space-y-8 before:absolute before:inset-y-0 before:left-[7px] before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/30 before:to-transparent">
                <div className="relative flex items-start gap-5">
                  <div className="absolute -left-[5px] bg-background z-10">
                    <CheckCircle2 className="w-6 h-6 text-primary" fill="currentColor" stroke="var(--color-background)" />
                  </div>
                  <div className="pl-6 pt-0.5">
                    <h4 className="text-sm font-bold text-textPrimary mb-1">Submitted</h4>
                    <p className="text-xs text-textSecondary mb-2">Complaint received on {new Date(selectedTicket.created_at).toLocaleDateString()}</p>
                    {selectedTicket.image_url && (
                      <img src={selectedTicket.image_url} alt="Evidence" className="mt-2 max-h-32 rounded-lg border border-borderLight" />
                    )}
                  </div>
                </div>

                <div className="relative flex items-start gap-5">
                  <div className="absolute -left-[5px] bg-background z-10">
                    <CheckCircle2 className="w-6 h-6 text-primary" fill="currentColor" stroke="var(--color-background)" />
                  </div>
                  <div className="pl-6 pt-0.5 w-full">
                    <h4 className="text-sm font-bold text-textPrimary mb-2">Classified</h4>
                    <div className="mt-2 bg-surfaceLight border border-borderLight rounded-xl p-5 space-y-3 shadow-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-textSecondary">Department</span>
                        <span className="font-medium text-textPrimary text-right">{selectedTicket.ai_analysis?.predicted_department || 'Pending'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-textSecondary">Priority</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] tracking-wider ${
                          selectedTicket.ai_analysis?.predicted_priority?.toUpperCase() === 'CRITICAL' ? 'bg-danger/10 text-danger border border-danger/20' : 
                          selectedTicket.ai_analysis?.predicted_priority?.toUpperCase() === 'HIGH' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-primary/10 text-primary border border-primary/20'
                        }`}>{selectedTicket.ai_analysis?.predicted_priority?.toUpperCase() || 'PENDING'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-textSecondary">Sentiment</span>
                        <span className="text-textPrimary capitalize">{selectedTicket.ai_analysis?.sentiment || 'N/A'}</span>
                      </div>
                      {selectedTicket.ai_analysis?.keywords && selectedTicket.ai_analysis.keywords.length > 0 && (
                        <div className="flex flex-col gap-2 text-sm pt-3 border-t border-borderLight mt-2">
                           <span className="text-textSecondary text-[10px] uppercase tracking-wider">Keywords</span>
                           <div className="flex flex-wrap gap-1.5">
                             {selectedTicket.ai_analysis.keywords.map((kw: string, i: number) => (
                               <span key={i} className="px-2 py-1 bg-surfaceLight rounded border border-borderLight text-[11px] text-textSecondary">{kw}</span>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedTicket.status === 'rejected' ? (
                  <div className="relative flex items-start gap-5">
                    <div className="absolute -left-[5px] bg-background rounded-full border-2 border-danger w-6 h-6 flex items-center justify-center z-10">
                       <div className="w-2 h-2 bg-danger rounded-full shadow-[0_0_8px_#ef4444]"></div>
                    </div>
                    <div className="pl-6 pt-0.5">
                      <h4 className="text-sm font-bold text-danger mb-1">Rejected</h4>
                      <p className="text-xs text-textSecondary mb-2">Complaint was rejected by the officer.</p>
                      {selectedTicket.rejection_reason && (
                        <div className="mt-2 bg-danger/10 border border-danger/20 rounded-xl p-4">
                          <span className="text-danger font-medium text-xs block mb-1">REASON FOR REJECTION</span>
                          <span className="text-sm text-textPrimary">{selectedTicket.rejection_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative flex items-start gap-5">
                      <div className={`absolute -left-[5px] bg-background rounded-full border-2 ${selectedTicket.status !== 'new' ? 'border-primary' : 'border-borderLight'} w-6 h-6 flex items-center justify-center z-10`}>
                         {selectedTicket.status !== 'new' && <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#06b6d4]"></div>}
                      </div>
                      <div className={`pl-6 pt-0.5 ${selectedTicket.status === 'new' ? 'opacity-50' : ''}`}>
                        <h4 className="text-sm font-bold text-textPrimary mb-1">Assigned</h4>
                        <p className="text-xs text-textSecondary">Ward officer assignment.</p>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-5">
                      <div className={`absolute -left-[5px] bg-background rounded-full border-2 ${selectedTicket.status === 'in_progress' || selectedTicket.status === 'resolved' ? 'border-primary' : 'border-borderLight'} w-6 h-6 flex items-center justify-center z-10`}>
                         {(selectedTicket.status === 'in_progress' || selectedTicket.status === 'resolved') && <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#06b6d4]"></div>}
                      </div>
                      <div className={`pl-6 pt-0.5 ${selectedTicket.status === 'in_progress' || selectedTicket.status === 'resolved' ? '' : 'opacity-50'}`}>
                        <h4 className="text-sm font-bold text-textPrimary mb-1">In Progress</h4>
                        <p className="text-xs text-textSecondary">Field team dispatched, work order raised.</p>
                        {selectedTicket.progress_note && (
                          <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl p-3">
                            <span className="text-primary font-medium text-[10px] uppercase tracking-wider block mb-1">OFFICER NOTE (ETA & STATUS)</span>
                            <span className="text-sm text-textPrimary">{selectedTicket.progress_note}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative flex items-start gap-5">
                      <div className={`absolute -left-[5px] bg-background rounded-full border-2 ${selectedTicket.status === 'resolved' ? 'border-primary' : 'border-borderLight'} w-6 h-6 flex items-center justify-center z-10`}>
                         {selectedTicket.status === 'resolved' && <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#06b6d4]"></div>}
                      </div>
                      <div className={`pl-6 pt-0.5 ${selectedTicket.status === 'resolved' ? '' : 'opacity-50'}`}>
                        <h4 className="text-sm font-medium text-textPrimary mb-1">Resolved</h4>
                        <p className="text-xs text-textSecondary">Closure photo uploaded and citizen notified.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Track;
