import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, RefreshCw, Zap, Mail, Clock, AlertTriangle, AlertCircle, CheckCircle, FileSearch, XCircle, Building, ChevronRight } from 'lucide-react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';



export function LiveStudyTrend() {
  const { hospitals, studies } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Filter hospitals based on user role
  const scopedHospitals = hospitals.filter(h => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.role === 'SITE_ADMIN') return h.parentSiteId === user?.siteId;
    return h.id === user?.hospitalId;
  });
  const scopedHospitalIds = scopedHospitals.map(h => h.id);

  // Filter studies based on scoped hospitals
  const scopedStudies = studies.filter(s => scopedHospitalIds.includes(s.hospitalId));
  
  // State
  const [activeTab, setActiveTab] = useState('Dashboard Chart');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('Site');
  const [selectedModality, setSelectedModality] = useState('All');
  
  // Daily Trend Data (Dynamic)
  const today = new Date().toISOString().split('T')[0];
  const metricsData = [
    { label: 'Today', value: scopedStudies.filter(s => s.createdAt.startsWith(today)).length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50/50' },
    { label: 'Month', value: scopedStudies.length, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
    { label: 'Active', value: scopedStudies.filter(s => s.status === 'Active' || s.status === 'Review').length, icon: Zap, color: 'text-cyan-600', bg: 'bg-cyan-50/50' },
    { label: 'Unread', value: scopedStudies.filter(s => s.status === 'Unread' || s.status === 'New').length, icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
    { label: 'Pending', value: scopedStudies.filter(s => s.status === 'Pending' || s.status === 'Draft').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50' },
    { label: 'TAT Delay', value: 0, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50/50' },
    { label: 'Action Needed', value: scopedStudies.filter(s => s.status === 'Action Needed').length, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50/50' },
    { label: 'Final', value: scopedStudies.filter(s => s.status === 'Final').length, icon: CheckCircle, color: 'text-[#0D2461]', bg: 'bg-[#0D2461]/5' },
    { label: 'Review', value: scopedStudies.filter(s => s.status === 'Review').length, icon: FileSearch, color: 'text-purple-600', bg: 'bg-purple-50/50' },
    { label: 'Cancel', value: scopedStudies.filter(s => s.status === 'Cancelled').length, icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-50/50' },
  ];

  // Simulated Analytics Data
  const siteAnalyticsData = scopedHospitals.map(c => ({
    name: c.name.split(' ')[0],
    volume: scopedStudies.filter(s => s.hospitalId === c.id).length,
  })).slice(0, 6).filter(c => c.volume > 0);
  const barColors = ['#0D2461', '#00A8CC', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

  const baseChartData = [
    { date: '10:00 AM', CT: 12, MRI: 8, Xray: 15 },
    { date: '11:00 AM', CT: 19, MRI: 12, Xray: 22 },
    { date: '12:00 PM', CT: 15, MRI: 10, Xray: 18 },
    { date: '01:00 PM', CT: 22, MRI: 15, Xray: 30 },
    { date: '02:00 PM', CT: 18, MRI: 11, Xray: 25 },
    { date: '03:00 PM', CT: 25, MRI: 18, Xray: 35 },
    { date: '04:00 PM', CT: 20, MRI: 14, Xray: 28 },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleGo = () => {
    handleRefresh();
    alert(`Applied filters: ${filterType}, ${selectedModality}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-[#0D2461]">Live Study Trend</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Real-time radiological workflow metrics and operations center.</p>
        </div>
        <Button 
          variant="default" 
          className="bg-[#0D2461] hover:bg-[#081840] text-white shadow-md transition-all font-bold"
          onClick={handleRefresh}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Feed
        </Button>
      </div>

      {/* Premium Metrics Row */}
      <div className="flex space-x-4 overflow-x-auto pb-4 pt-2 scrollbar-hide">
        {metricsData.map((m, i) => (
          <div 
            key={i} 
            className={`flex-shrink-0 flex flex-col items-center justify-center p-4 w-32 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white group ${m.bg}`}
          >
            <div className="flex items-center space-x-1.5 mb-2 opacity-90 group-hover:opacity-100 transition-opacity">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${m.color}`}>{m.label}</span>
            </div>
            <span className={`text-3xl font-black ${m.color}`}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Modern Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        {['Dashboard Chart', 'Critical Sites', 'Site Analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); handleRefresh(); }}
            className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all relative ${
              activeTab === tab 
                ? 'text-[#0D2461] bg-white border border-slate-200 border-b-white' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
            }`}
            style={{ marginBottom: activeTab === tab ? '-1px' : '0' }}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl bg-gradient-to-r from-[#0D2461] to-[#00A8CC]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Dynamic Content Section */}
      <Card className="border-t-0 rounded-tl-none shadow-sm min-h-[500px] border-slate-200">
        <CardContent className="p-8">
          
          {/* Universal Filters */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 shadow-inner">
            <div className="flex items-center space-x-6">
              <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button
                  onClick={() => setFilterType('Site')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${filterType === 'Site' ? 'bg-[#0D2461] text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  By Site
                </button>
                <button
                  onClick={() => setFilterType('Radiologist')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${filterType === 'Radiologist' ? 'bg-[#0D2461] text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  By Radiologist
                </button>
              </div>
              
              <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg px-4 py-1.5 shadow-sm cursor-pointer hover:border-[#00A8CC] transition-colors">
                <Calendar className="h-4 w-4 text-[#00A8CC]" />
                <span className="text-xs font-bold text-slate-700">Sep 01, 2026 — Sep 07, 2026</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select 
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="border border-slate-200 rounded-lg px-4 py-2 bg-white text-xs font-bold text-slate-700 min-w-[160px] focus:ring-2 focus:ring-[#00A8CC]/20 outline-none shadow-sm"
              >
                <option value="All">All Modalities</option>
                <option value="CT">CT Scans</option>
                <option value="MRI">MRI Scans</option>
                <option value="X-Ray">X-Rays</option>
              </select>

              <Button onClick={handleGo} size="sm" className="bg-[#00A8CC] hover:bg-[#008ba8] text-white px-6 font-bold shadow-md shadow-[#00A8CC]/20">
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Conditional Rendering based on activeTab */}
          <div className={`transition-opacity duration-300 ${isRefreshing ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'}`}>
            
            {/* VIEW 1: Dashboard Chart */}
            {activeTab === 'Dashboard Chart' && (
              <div className="h-[420px] w-full animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-lg font-black text-[#0D2461]">Modality Volume Timeline</h3>
                    <p className="text-xs font-medium text-slate-400">Comparing studies completed over the selected timeframe</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={baseChartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                    {(selectedModality === 'All' || selectedModality === 'CT') && <Line type="monotone" dataKey="CT" stroke="#0D2461" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{ r: 6 }} />}
                    {(selectedModality === 'All' || selectedModality === 'MRI') && <Line type="monotone" dataKey="MRI" stroke="#00A8CC" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{ r: 6 }} />}
                    {(selectedModality === 'All' || selectedModality === 'X-Ray') && <Line type="monotone" dataKey="Xray" name="X-Ray" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{ r: 6 }} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* VIEW 2: Critical Sites */}
            {activeTab === 'Critical Sites' && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-lg font-black text-[#0D2461]">Urgent Attention Required</h3>
                    <p className="text-xs font-medium text-slate-400">Sites currently experiencing SLA breaches or high TAT delays</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {hospitals.slice(0,3).map((site, idx) => (
                    <div key={site.id} className="relative bg-white border border-rose-200 rounded-2xl p-6 shadow-md shadow-rose-100/50 overflow-hidden group hover:shadow-lg transition-all">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
                      <div className="absolute right-0 top-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3 text-rose-700 font-black text-lg">
                          <div className="p-2 bg-rose-100 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
                          {site.name}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending</span>
                          <span className="text-xl font-black text-slate-800">{12 + (idx * 5)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                          <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Max Delay</span>
                          <span className="text-xl font-black text-rose-600">+{2 + idx} <span className="text-sm">hrs</span></span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => navigate('/manager/tat')}
                        className="w-full mt-6 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold shadow-sm group-hover:border-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all"
                      >
                        Intervene Queue <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                  {hospitals.length === 0 && (
                     <div className="col-span-3 text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                       <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                       <h3 className="text-lg font-bold text-slate-700">All Clear</h3>
                       <p className="text-slate-500 text-sm">No critical SLA breaches detected at any site.</p>
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: Site Analytics */}
            {activeTab === 'Site Analytics' && (
              <div className="h-[420px] w-full animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-lg font-black text-[#0D2461]">Volume Distribution</h3>
                    <p className="text-xs font-medium text-slate-400">Total studies generated per site</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={siteAnalyticsData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }} 
                    />
                    <Bar dataKey="volume" name="Total Studies" radius={[8, 8, 0, 0]}>
                      {siteAnalyticsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
