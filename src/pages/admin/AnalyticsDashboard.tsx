import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Activity, Briefcase, Stethoscope, TrendingUp, Download, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
  const totalRevenue = scopedStudies.length * 2500;
  const avgTat = '1.8 Hrs';

  const modalityCounts = scopedStudies.reduce((acc, curr) => {
    acc[curr.modality] = (acc[curr.modality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const modalityData = Object.keys(modalityCounts).map(key => ({ name: key, value: modalityCounts[key] }));
  const COLORS = ['#10263D', '#176B73', '#B08D57', '#5C6875', '#2563EB', '#D7DEE4'];

  const centreData = filteredHospitals.map(h => {
    const hStudies = scopedStudies.filter(s => s.hospitalId === h.id);
    return {
      name: h.name,
      cases: hStudies.length,
      revenue: hStudies.length * 2500
    };
  }).filter(h => h.cases > 0);

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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#10263D] tracking-tight font-heading">Analytics & Intelligence</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Operational metrics and financial performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2 bg-card p-1 rounded-md border border-border shadow-sm">
            <Input type="date" className="h-8 text-sm w-36 border-0 focus-visible:ring-0 shadow-none font-medium" defaultValue="2026-08-01" />
            <span className="text-xs text-muted-foreground font-medium px-1">to</span>
            <Input type="date" className="h-8 text-sm w-36 border-0 focus-visible:ring-0 shadow-none font-medium" defaultValue="2026-09-08" />
          </div>
          <Button variant="outline" className="h-10">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] p-6 rounded-2xl border-t-4 border-t-blue-500 border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-100/50 rounded-full blur-xl group-hover:bg-blue-200/50 transition-colors duration-500" />
          <div className="relative z-10 flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-black text-blue-600/80 uppercase tracking-widest">Total Volume</h3>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-3xl font-black text-blue-950">{totalStudies.toLocaleString()}</div>
            <p className="text-xs text-blue-600 font-bold mt-2 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12.5% from last month
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#F8FAFC] to-[#F0FDF4] p-6 rounded-2xl border-t-4 border-t-emerald-500 border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-xl group-hover:bg-emerald-200/50 transition-colors duration-500" />
          <div className="relative z-10 flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-black text-emerald-600/80 uppercase tracking-widest">Active Patients</h3>
            <Briefcase className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-3xl font-black text-emerald-950">{totalPatients.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +8.2% from last month
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#F8FAFC] to-[#FFF7ED] p-6 rounded-2xl border-t-4 border-t-orange-500 border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-orange-100/50 rounded-full blur-xl group-hover:bg-orange-200/50 transition-colors duration-500" />
          <div className="relative z-10 flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-black text-orange-600/80 uppercase tracking-widest">System TAT</h3>
            <Stethoscope className="w-5 h-5 text-orange-600" />
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-3xl font-black text-orange-950">{avgTat}</div>
            <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> -15 mins improvement
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-2xl border border-indigo-400/20 shadow-[0_8px_30px_rgb(99,102,241,0.2)] text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-black text-indigo-100 uppercase tracking-widest">Est. Revenue</h3>
            <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-3xl font-black text-white">₹ {(totalRevenue / 100000).toFixed(2)}L</div>
            <p className="text-xs text-indigo-100 font-bold mt-2 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +22.4% from last month
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Volume Trajectory</CardTitle>
              <CardDescription>Total cases vs emergencies over 7 days</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D7DEE4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5C6875' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5C6875' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #D7DEE4', boxShadow: '0 4px 6px -1px rgba(16, 38, 61, 0.08)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="studies" name="Routine Cases" stroke="#10263D" strokeWidth={3} dot={{ r: 4, fill: '#10263D', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="emergencies" name="Emergency" stroke="#DC2626" strokeWidth={3} dot={{ r: 4, fill: '#DC2626', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Modality Distribution</CardTitle>
            <CardDescription>Breakdown by study type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modalityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {modalityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(16, 38, 61, 0.08)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500, color: '#18212B' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-semibold text-primary">{totalStudies}</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
}
