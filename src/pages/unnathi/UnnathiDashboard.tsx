import React from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Building2, HeartPulse, Users, UserRound, LayoutDashboard, ChevronRight, Activity, Clock, FileText, AlertTriangle, Database, Cloud, ShieldCheck, Network, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const UnnathiDashboard = () => {
  const { sites, hospitals, users, radiologists, studies } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Strict scoping based on role
  const scopedSites = sites.filter(c => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.role === 'SITE_ADMIN') return c.id === user.siteId;
    return false;
  });

  const handleOpenDashboard = (hospitalId: string) => {
    useAuthStore.getState().setSelectedHospitalId(hospitalId);
    if (user?.role === 'SUPER_ADMIN') {
      useAuthStore.getState().setRole('HOSPITAL_ADMIN');
    }
    navigate('/admin/dashboard');
  };

  const scopedHospitals = hospitals.filter(h => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.role === 'SITE_ADMIN') return h.parentSiteId === user.siteId;
    return false;
  });

  const stats = [
    { label: 'Wallet Balance', value: `₹ ${scopedSites.reduce((acc, s) => acc + (s.walletBalance || 0), 0) + scopedHospitals.reduce((acc, h) => acc + (h.walletBalance || 0), 0)}`, icon: Activity, color: 'emerald', link: '/finance/ledger' },
    { label: 'Sites', value: scopedSites.length, icon: Building2, color: 'blue', link: '/unnathi/sites' },
    { label: 'Total Hospitals', value: scopedHospitals.length, icon: HeartPulse, color: 'rose', link: '/unnathi/hospitals' },
    { label: 'Radiologists', value: radiologists.length, icon: UserRound, color: 'amber', link: '/admin/radiologists' },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[1600px] mx-auto space-y-8 pb-12">
        <motion.div variants={itemVariants} className="flex flex-col mb-4">
          <h1 className="text-3xl font-black text-[#10263D] tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-[#176B73]" />
            Platform Dashboard
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 pl-9">
            Comprehensive platform telemetry and operations overview
          </p>
        </motion.div>

        {/* Row 1: Primary */}
        <motion.div variants={itemVariants}>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Primary</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-2xl border border-indigo-400/20 flex flex-col justify-between shadow-[0_8px_30px_rgb(99,102,241,0.2)] text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white shadow-inner"><Activity className="w-5 h-5" /></div>
                <span className="font-black text-lg bg-white/20 px-2 py-0.5 rounded-lg">₹</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tight mb-1">
                  {sites.reduce((acc, s) => acc + (s.walletBalance || 0), 0) + hospitals.reduce((acc, h) => acc + (h.walletBalance || 0), 0)}
                </h3>
                <p className="text-[11px] text-indigo-100 font-bold uppercase tracking-widest">Total Funds</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] p-6 rounded-2xl border-t-4 border-t-blue-500 border border-[#E2E8F0] flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-blue-500/10 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-100/50 rounded-full blur-xl group-hover:bg-blue-200/50 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-100 rounded-xl text-blue-700 shadow-sm border border-blue-200"><Building2 className="w-5 h-5" /></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-blue-950 tracking-tight mb-1">{scopedSites.length}</h3>
                <p className="text-[11px] text-blue-600/80 font-bold uppercase tracking-widest">Organizations</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F0FDF4] p-6 rounded-2xl border-t-4 border-t-emerald-500 border border-[#E2E8F0] flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-xl group-hover:bg-emerald-200/50 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700 shadow-sm border border-emerald-200"><HeartPulse className="w-5 h-5" /></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-emerald-950 tracking-tight mb-1">{scopedHospitals.length}</h3>
                <p className="text-[11px] text-emerald-600/80 font-bold uppercase tracking-widest">Active Centres</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#FFFBEB] p-6 rounded-2xl border-t-4 border-t-amber-500 border border-[#E2E8F0] flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-amber-500/10 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-amber-100/50 rounded-full blur-xl group-hover:bg-amber-200/50 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shadow-sm border border-amber-200"><UserRound className="w-5 h-5" /></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-amber-950 tracking-tight mb-1">{radiologists.length}</h3>
                <p className="text-[11px] text-amber-600/80 font-bold uppercase tracking-widest">Radiologists</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F5F3FF] p-6 rounded-2xl border-t-4 border-t-purple-500 border border-[#E2E8F0] flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-purple-500/10 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-100/50 rounded-full blur-xl group-hover:bg-purple-200/50 transition-colors duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 bg-purple-100 rounded-xl text-purple-700 shadow-sm border border-purple-200"><Activity className="w-5 h-5" /></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-purple-950 tracking-tight mb-1">{studies.length}</h3>
                <p className="text-[11px] text-purple-600/80 font-bold uppercase tracking-widest">Studies Today</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Row 2: Operations */}
        <motion.div variants={itemVariants}>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-gradient-to-r from-[#F1F5F9] to-white p-5 rounded-2xl border-l-4 border-l-slate-400 border border-[#E2E8F0] flex items-center justify-between shadow-sm group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Pending Studies</p>
                <h3 className="text-2xl font-black text-slate-800">{studies.filter(s => s.status === 'Pending').length}</h3>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 border border-slate-200 shadow-sm group-hover:scale-110 transition-transform"><Clock className="w-5 h-5" /></div>
            </div>
            <div className="bg-gradient-to-r from-[#FEF2F2] to-white p-5 rounded-2xl border-l-4 border-l-rose-500 border border-[#E2E8F0] flex items-center justify-between shadow-sm group hover:-translate-y-0.5 hover:shadow-md hover:shadow-rose-500/10 transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mb-1">STAT / Emergency</p>
                <h3 className="text-2xl font-black text-rose-700">{studies.filter(s => s.priority === 'STAT').length}</h3>
              </div>
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600 border border-rose-200 shadow-sm group-hover:scale-110 transition-transform"><AlertTriangle className="w-5 h-5" /></div>
            </div>
            <div className="bg-gradient-to-r from-[#FFF7ED] to-white p-5 rounded-2xl border-l-4 border-l-orange-500 border border-[#E2E8F0] flex items-center justify-between shadow-sm group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1">TAT Breached</p>
                <h3 className="text-2xl font-black text-orange-700">0</h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl text-orange-600 border border-orange-200 shadow-sm group-hover:scale-110 transition-transform"><Clock className="w-5 h-5" /></div>
            </div>
            <div className="bg-gradient-to-r from-[#F0FDF4] to-white p-5 rounded-2xl border-l-4 border-l-emerald-500 border border-[#E2E8F0] flex items-center justify-between shadow-sm group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Reports Completed</p>
                <h3 className="text-2xl font-black text-emerald-700">{studies.filter(s => s.status === 'Completed').length}</h3>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 border border-emerald-200 shadow-sm group-hover:scale-110 transition-transform"><FileText className="w-5 h-5" /></div>
            </div>
          </div>
        </motion.div>

        {/* Row 3: Analytics */}
        <motion.div variants={itemVariants}>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-[#EFF6FF] to-white p-6 rounded-2xl border-t-4 border-t-blue-400 border border-[#E2E8F0] h-56 flex flex-col items-center justify-center text-blue-900 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <TrendingUp className="w-12 h-12 mb-4 text-blue-300 group-hover:text-blue-500 transition-colors duration-500 relative z-10" />
              <p className="text-[11px] font-black tracking-widest uppercase text-blue-600 relative z-10">7-day Studies Trend</p>
            </div>
            <div className="bg-gradient-to-br from-[#F0FDF4] to-white p-6 rounded-2xl border-t-4 border-t-teal-400 border border-[#E2E8F0] h-56 flex flex-col items-center justify-center text-teal-900 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <PieChart className="w-12 h-12 mb-4 text-teal-300 group-hover:text-teal-500 transition-colors duration-500 relative z-10" />
              <p className="text-[11px] font-black tracking-widest uppercase text-teal-600 relative z-10">Modality Distribution</p>
            </div>
            <div className="bg-gradient-to-br from-[#F5F3FF] to-white p-6 rounded-2xl border-t-4 border-t-purple-400 border border-[#E2E8F0] h-56 flex flex-col items-center justify-center text-purple-900 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <BarChart3 className="w-12 h-12 mb-4 text-purple-300 group-hover:text-purple-500 transition-colors duration-500 relative z-10" />
              <p className="text-[11px] font-black tracking-widest uppercase text-purple-600 relative z-10">TAT Performance</p>
            </div>
          </div>
        </motion.div>

        {/* Row 4: Organization table */}
        <motion.div variants={itemVariants}>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Organization Directory</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Centres</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Radiologists</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Studies Today</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {scopedSites.slice(0, 5).map(site => (
                    <tr key={site.id} className="hover:bg-slate-50/80 cursor-pointer transition-colors group" onClick={() => navigate('/unnathi/sites')}>
                      <td className="px-6 py-4 whitespace-nowrap font-black text-[#10263D] group-hover:text-[#176B73] transition-colors">{site.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500">{site.organizationType === 'COMPANY_MANAGED' ? 'Teleradiology' : 'Hospital'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{scopedHospitals.filter(h => h.parentSiteId === site.id).length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500">{site.settings?.accountType || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-[10px] font-black rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Row 5: Platform health */}
        <motion.div variants={itemVariants}>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Platform Health</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            <div className="bg-gradient-to-br from-[#EFF6FF] to-white text-blue-950 p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Database className="w-6 h-6 text-blue-500 mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-blue-600/80 font-bold uppercase tracking-widest mb-1">Total Storage</p>
                <p className="text-xl font-black">0 TB</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#F0FDF4] to-white text-emerald-950 p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Activity className="w-6 h-6 text-emerald-500 mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-emerald-600/80 font-bold uppercase tracking-widest mb-1">Monthly Studies</p>
                <p className="text-xl font-black">0</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#F8FAFC] to-white text-slate-900 p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Cloud className="w-6 h-6 text-cyan-500 mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">DICOM Uploads</p>
                <p className="text-xl font-black">0/hr</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#F5F3FF] to-white text-purple-950 p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FileText className="w-6 h-6 text-purple-500 mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-purple-600/80 font-bold uppercase tracking-widest mb-1">Avg Study Size</p>
                <p className="text-xl font-black">0 MB</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#FFFBEB] to-white text-amber-950 p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Users className="w-6 h-6 text-amber-500 mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-amber-600/80 font-bold uppercase tracking-widest mb-1">Radiologists</p>
                <p className="text-xl font-black">0 Online</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(16,185,129,0.3)] border border-emerald-400/20 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
              <Network className="w-6 h-6 text-white mb-4 relative z-10" />
              <div className="relative z-10">
                <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mb-1">System Health</p>
                <p className="text-xl font-black text-white">Optimal</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }


  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col mb-4">
        <h1 className="text-3xl font-black text-[#10263D] tracking-tight flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-[#176B73]" />
          Company Dashboard
        </h1>
        <p className="text-sm font-semibold text-slate-500 mt-1 pl-9">
          Overview of your organization and associated facilities
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const bgColors = {
            blue: 'from-blue-500 to-blue-700 shadow-[0_8px_30px_rgb(59,130,246,0.3)]',
            rose: 'from-rose-500 to-rose-700 shadow-[0_8px_30px_rgb(244,63,94,0.3)]',
            emerald: 'from-emerald-500 to-emerald-700 shadow-[0_8px_30px_rgb(16,185,129,0.3)]',
            amber: 'from-amber-500 to-amber-700 shadow-[0_8px_30px_rgb(245,158,11,0.3)]'
          };
          
          return (
            <div 
              key={stat.label} 
              onClick={() => navigate(stat.link)}
              className={`bg-gradient-to-br ${bgColors[stat.color as keyof typeof bgColors]} p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-40`}
            >
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white shadow-inner`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white tracking-tight mb-1">{stat.value}</h3>
                <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Organization Hierarchy */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black text-[#10263D]">Organization Hierarchy Overview</h2>
          <p className="text-sm text-slate-500 font-semibold mt-1">Structured view of sites and their associated hospitals</p>
        </div>
        
        <div className="p-6 space-y-6">
          {scopedSites.map(company => (
            <div key={company.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white border border-slate-200 text-[#176B73] rounded-xl shadow-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#10263D] text-lg">{company.name}</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{company.code}</p>
                  </div>
                </div>
                <button onClick={() => navigate('/unnathi/sites')} className="text-xs font-bold text-[#176B73] flex items-center hover:text-[#10263D] transition-colors bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              {/* Direct Company Hospitals */}
              {scopedHospitals.filter(h => h.parentSiteId === company.id).length > 0 ? (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scopedHospitals.filter(h => h.parentSiteId === company.id).map(hospital => (
                    <div key={hospital.id} className="group flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 hover:border-[#176B73]/30 hover:bg-teal-50/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md" onClick={() => handleOpenDashboard(hospital.id)}>
                      <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-[#176B73] border border-slate-100 group-hover:border-teal-100 group-hover:shadow-sm rounded-lg transition-all">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-[#10263D] group-hover:text-[#176B73] transition-colors">{hospital.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Hospital</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm font-bold text-slate-400">
                  No hospitals mapped to this company yet.
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UnnathiDashboard;
