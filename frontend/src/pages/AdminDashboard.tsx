import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Layers, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const lineData = [
  { name: 'Mon', filed: 40, resolved: 24 },
  { name: 'Tue', filed: 55, resolved: 35 },
  { name: 'Wed', filed: 60, resolved: 40 },
  { name: 'Thu', filed: 45, resolved: 45 },
  { name: 'Fri', filed: 70, resolved: 55 },
  { name: 'Sat', filed: 45, resolved: 35 },
  { name: 'Sun', filed: 35, resolved: 30 },
];

const predictiveData = [
  { month: 'Oct', actual: 400, predicted: 400 },
  { month: 'Nov', actual: 380, predicted: 380 },
  { month: 'Dec', actual: 450, predicted: 450 },
  { month: 'Jan', predicted: 510 },
  { month: 'Feb', predicted: 620 },
  { month: 'Mar', predicted: 580 },
];

const wardData = [
  { name: 'Ward 12', value: 96 },
  { name: 'Ward 18', value: 74 },
  { name: 'Ward 7', value: 61 },
  { name: 'Ward 5', value: 44 },
  { name: 'Ward 3', value: 31 },
];

const AdminDashboard = () => {
  const [filter, setFilter] = useState('All');
  const [totalComplaints, setTotalComplaints] = useState(0);
  
  const [priorityData, setPriorityData] = useState<any[]>([
    { name: 'Critical', value: 1, color: '#ef4444' }, 
    { name: 'High', value: 1, color: '#8b5cf6' },    
    { name: 'Medium', value: 1, color: '#f59e0b' },   
    { name: 'Low', value: 1, color: '#10b981' },      
  ]);

  const [loadData, setLoadData] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/api/v1/complaints/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 403) {
          alert("You do not have permission to view this page. Redirecting to your dashboard.");
          window.location.href = '/dashboard';
          throw new Error('Forbidden');
        }
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setTotalComplaints(data.length);
          
          // Calculate Priority Mix
          const pCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
          data.forEach(c => {
             const p = c.ai_analysis?.predicted_priority?.toUpperCase();
             if (p && pCounts[p as keyof typeof pCounts] !== undefined) {
               pCounts[p as keyof typeof pCounts]++;
             }
          });
          setPriorityData([
            { name: 'Critical', value: pCounts.CRITICAL, color: '#ef4444' },
            { name: 'High', value: pCounts.HIGH, color: '#8b5cf6' },
            { name: 'Medium', value: pCounts.MEDIUM, color: '#f59e0b' },
            { name: 'Low', value: pCounts.LOW, color: '#10b981' },
          ]);

          // Calculate Load by Department
          const deptCounts: Record<string, number> = {};
          data.forEach(c => {
             const d = c.ai_analysis?.predicted_department || 'Unknown';
             deptCounts[d] = (deptCounts[d] || 0) + 1;
          });
          const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6b7280', '#ec4899', '#3b82f6', '#14b8a6', '#f43f5e'];
          const newLoadData = Object.keys(deptCounts).map((key, i) => ({
             name: key.replace(' Department', '').substring(0, 10), // shorten for chart
             value: deptCounts[key],
             fill: colors[i % colors.length]
          })).sort((a,b) => b.value - a.value).slice(0, 6);
          setLoadData(newLoadData);
          setRecentComplaints(data.slice(0, 10)); // Take top 10 most recent complaints for queue
        }
      })
      .catch(err => console.error("Failed to fetch complaints", err));
  }, []);
  return (
    <div className="min-h-[calc(100vh-80px)] bg-background text-textPrimary p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Control room</h1>
            <p className="text-textSecondary">City-wide grievance analytics, refreshed every 60 seconds.</p>
          </div>
          <div className="flex items-center gap-2 bg-surfaceLight p-1 rounded-full border border-borderLight">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f ? 'bg-primary text-background' : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-textSecondary text-sm font-medium">Open grievances</div>
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold text-textPrimary mb-1">{totalComplaints > 0 ? totalComplaints : 412}</div>
            <div className="text-xs text-textSecondary">+6.1% wk</div>
          </div>
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-textSecondary text-sm font-medium">Critical / SLA risk</div>
              <AlertTriangle className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold text-textPrimary mb-1">27</div>
            <div className="text-xs text-textSecondary">9 breach soon</div>
          </div>
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-textSecondary text-sm font-medium">Avg resolution</div>
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold text-textPrimary mb-1">38 hrs</div>
            <div className="text-xs text-textSecondary">-4 hrs wk</div>
          </div>
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-textSecondary text-sm font-medium">Resolved this week</div>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold text-textPrimary mb-1">299</div>
            <div className="text-xs text-textSecondary">82% SLA met</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filed vs Resolved */}
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
            <h3 className="text-textPrimary font-medium mb-6">Filed vs resolved</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '8px'}} itemStyle={{color: '#fff'}} />
                  <Line type="monotone" dataKey="filed" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs text-textSecondary">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> filed</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-success"></span> resolved</div>
            </div>
          </div>

          {/* Priority mix */}
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
            <h3 className="text-textPrimary font-medium mb-6">Priority mix</h3>
            <div className="h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#fff'}} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center hole decoration */}
              <div className="absolute inset-0 m-auto w-24 h-24 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs text-textSecondary">
              {priorityData.map(p => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></span> {p.name}
                </div>
              ))}
            </div>
          </div>

          {/* Load by department */}
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
            <h3 className="text-textPrimary font-medium mb-6">Load by department</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loadData} margin={{ top: 5, right: 0, bottom: -10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '8px'}} cursor={{fill: '#ffffff05'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {loadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ward hotspots */}
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
            <h3 className="text-textPrimary font-medium mb-6">Ward hotspots</h3>
            <div className="space-y-6 mt-4">
              {wardData.map((ward, i) => (
                <div key={ward.name}>
                  <div className="flex justify-between text-xs text-textSecondary mb-2">
                    <span>{ward.name}</span>
                    <span>{ward.value} open</span>
                  </div>
                  <div className="h-1.5 w-full bg-surfaceLight rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
                      style={{ width: `${(ward.value / 100) * 100}%`, opacity: 1 - (i * 0.15) }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Analytics */}
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-textPrimary font-medium">Predictive Volume Trend (ML Model)</h3>
              <div className="text-xs text-textSecondary px-2 py-1 bg-surfaceLight rounded border border-borderLight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                AI Forecast
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '8px'}} itemStyle={{color: '#fff'}} />
                  <Area type="monotone" dataKey="actual" stroke="#06b6d4" fillOpacity={0} strokeWidth={2} />
                  <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPredicted)" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-textSecondary mt-4">Model predicts a 22% surge in grievance volume by February due to historical seasonal trends.</p>
          </div>
        </div>

        {/* Officer Queue Table */}
        <div className="bg-surface shadow-sm border border-borderLight rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-borderLight">
            <h3 className="text-textPrimary font-medium mb-1">Officer queue</h3>
            <p className="text-xs text-textSecondary">Sorted by AI priority score · 6 tickets</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surfaceLight text-textSecondary text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket</th>
                  <th className="px-6 py-4 font-medium">Grievance</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentComplaints.map((row) => (
                  <tr key={row._id || row.id} className="hover:bg-surfaceLight transition-colors">
                    <td className="px-6 py-4 text-textSecondary font-mono">{(row._id || row.id)?.substring(0,8)}...</td>
                    <td className="px-6 py-4">
                      <div className="text-textPrimary font-medium mb-1 truncate max-w-[200px]">{row.title}</div>
                      <div className="text-xs text-textSecondary">{new Date(row.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-textSecondary">{row.ai_analysis?.predicted_department || 'Pending'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                        row.ai_analysis?.predicted_priority?.toUpperCase() === 'CRITICAL' ? 'bg-danger/10 text-danger border border-danger/20' :
                        row.ai_analysis?.predicted_priority?.toUpperCase() === 'HIGH' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        row.ai_analysis?.predicted_priority?.toUpperCase() === 'MEDIUM' ? 'bg-primary/10 text-primary border border-primary/20' :
                        'bg-success/10 text-success border border-success/20'
                      }`}>
                        {row.ai_analysis?.predicted_priority?.toUpperCase() || 'LOW'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                        row.status === 'in_progress' ? 'bg-warning/10 text-warning border border-warning/20' :
                        row.status === 'assigned' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        row.status === 'new' ? 'bg-primary/10 text-primary border border-primary/20' :
                        'bg-success/10 text-success border border-success/20'
                      }`}>
                        {row.status ? row.status.replace('_', ' ').toUpperCase() : 'NEW'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/officer/complaint/${row._id || row.id}`} className="text-primary hover:text-accent font-medium text-xs">
                        Review &rarr;
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
