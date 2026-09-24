import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Activity, Briefcase, Stethoscope, TrendingUp, Download, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function AnalyticsDashboard() {
  const { studies, patients, hospitals } = useMockDb();
  const { user } = useAuthStore();

  const filteredHospitals = hospitals.filter(h => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.role === 'SITE_ADMIN') return h.parentSiteId === user?.siteId;
    return h.id === user?.hospitalId;
  });
  const scopedHospitalIds = filteredHospitals.map(h => h.id);

  const scopedStudies = studies.filter(s => scopedHospitalIds.includes(s.hospitalId));
  const scopedPatients = patients.filter(p => scopedHospitalIds.includes(p.hospitalId));

  const totalStudies = scopedStudies.length;
  const totalPatients = scopedPatients.length;
  const totalRevenue = scopedStudies.length * 2500; // Mock calculation based on real volume
  const avgTat = '1.8 Hrs';

  // Modality Distribution Real Data
  const modalityCounts = scopedStudies.reduce((acc, curr) => {
    acc[curr.modality] = (acc[curr.modality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const modalityData = Object.keys(modalityCounts).map(key => ({ name: key, value: modalityCounts[key] }));
  const COLORS = ['#0D2461', '#00A8CC', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Centre Performance Real Data
  const centreData = filteredHospitals.map(h => {
    const hStudies = scopedStudies.filter(s => s.hospitalId === h.id);
    return {
      name: h.name,
      cases: hStudies.length,
      revenue: hStudies.length * 2500
    };
  }).filter(h => h.cases > 0);

  // Daily Trend Mock/Real Hybrid Data
  const trendData = [
    { name: 'Mon', studies: Math.floor(totalStudies * 0.1), emergencies: Math.floor(totalStudies * 0.02) },
    { name: 'Tue', studies: Math.floor(totalStudies * 0.15), emergencies: Math.floor(totalStudies * 0.03) },
    { name: 'Wed', studies: Math.floor(totalStudies * 0.12), emergencies: Math.floor(totalStudies * 0.02) },
    { name: 'Thu', studies: Math.floor(totalStudies * 0.14), emergencies: Math.floor(totalStudies * 0.02) },
    { name: 'Fri', studies: Math.floor(totalStudies * 0.18), emergencies: Math.floor(totalStudies * 0.04) },
    { name: 'Sat', studies: Math.floor(totalStudies * 0.2), emergencies: Math.floor(totalStudies * 0.05) },
    { name: 'Sun', studies: Math.floor(totalStudies * 0.11), emergencies: Math.floor(totalStudies * 0.01) },
  ];

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Analytics & Intelligence</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Real-time operational metrics and financial performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <Input type="date" className="h-8 text-xs w-36 border-0 bg-transparent focus-visible:ring-0 shadow-none font-bold text-slate-600" defaultValue="2026-08-01" />
            <span className="text-slate-300 font-medium text-xs">to</span>
            <Input type="date" className="h-8 text-xs w-36 border-0 bg-transparent focus-visible:ring-0 shadow-none font-bold text-slate-600" defaultValue="2026-09-08" />
          </div>
          <Button className="bg-[#00A8CC] hover:bg-[#008ba8] text-white h-10 px-5 text-sm font-bold rounded-xl shadow-md shadow-[#00A8CC]/20">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Premium Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Volume</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{totalStudies.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Activity className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12.5% <span className="text-slate-400 font-medium ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Patients</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{totalPatients.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Briefcase className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +8.2% <span className="text-slate-400 font-medium ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System TAT</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{avgTat}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Stethoscope className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> -15 mins <span className="text-slate-400 font-medium ml-1">improvement</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0D2461] to-indigo-900 rounded-2xl p-6 shadow-md border border-indigo-800 relative overflow-hidden group hover:shadow-lg transition-all text-white">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Est. Revenue</p>
              <h3 className="text-3xl font-black text-white">₹ {(totalRevenue / 100000).toFixed(2)}L</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-emerald-300 backdrop-blur-sm"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-300">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +22.4% <span className="text-indigo-200 font-medium ml-1">vs last month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-black text-[#0D2461]">Volume Trajectory</h3>
              <p className="text-xs font-medium text-slate-400">Total cases vs emergencies over 7 days</p>
            </div>
            <select className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#00A8CC]">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="studies" stroke="#0D2461" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Total Studies" />
                <Line type="monotone" dataKey="emergencies" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Emergencies" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="mb-2">
            <h3 className="text-base font-black text-[#0D2461]">Modality Split</h3>
            <p className="text-xs font-medium text-slate-400">Distribution across modalities</p>
          </div>
          <div className="h-[260px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modalityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {modalityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ color: '#333' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {modalityData.map((m, i) => (
              <div key={m.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                <div className="text-xs font-bold text-slate-700">{m.name} <span className="text-slate-400 font-medium">({m.value}%)</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-black text-[#0D2461]">Top Performing Hospitals</h3>
            <p className="text-xs font-medium text-slate-400">Revenue and volume comparison across top 5 locations</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs font-bold border-slate-200">View All Locations</Button>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={centreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
              <Bar yAxisId="left" dataKey="cases" fill="#00A8CC" name="Total Cases" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar yAxisId="right" dataKey="revenue" fill="#0D2461" name="Revenue (₹)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
