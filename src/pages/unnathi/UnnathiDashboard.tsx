import React from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Building2, HeartPulse, Users, UserRound, LayoutDashboard, ChevronRight, Activity, Clock, FileText, AlertTriangle, Database, Cloud, ShieldCheck, Network, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    { label: 'Sites', value: scopedSites.length, icon: Building2, color: 'blue', link: '/unnathi/sites' },
    { label: 'Total Hospitals', value: scopedHospitals.length, icon: HeartPulse, color: 'rose', link: '/unnathi/hospitals' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'emerald', link: '/admin/users' },
    { label: 'Radiologists', value: radiologists.length, icon: UserRound, color: 'amber', link: '/admin/radiologists' },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    return (
      <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-unnathi-fade-in pb-16">
        <div className="flex flex-col mb-2">
          <h1 className="text-3xl font-black text-[#0D2461] flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#00A8CC] rounded-xl">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            Super Admin Platform Dashboard
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-2 uppercase tracking-widest pl-14">
            Comprehensive platform telemetry and operations overview
          </p>
        </div>

        {/* Row 1: Primary */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Primary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">Organizations</p>
                <h3 className="text-2xl font-black text-[#0D2461]">{scopedSites.length}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Building2 className="w-5 h-5" /></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">Active Centres</p>
                <h3 className="text-2xl font-black text-[#0D2461]">{scopedHospitals.length}</h3>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg text-teal-600"><HeartPulse className="w-5 h-5" /></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">Radiologists</p>
                <h3 className="text-2xl font-black text-[#0D2461]">{radiologists.length}</h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-purple-600"><UserRound className="w-5 h-5" /></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">Studies Today</p>
                <h3 className="text-2xl font-black text-[#0D2461]">{studies.length}</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><Activity className="w-5 h-5" /></div>
            </div>
          </div>
        </div>

        {/* Row 2: Operations */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">Pending Studies</p>
                <h3 className="text-2xl font-black text-[#0D2461]">{studies.filter(s => s.status === 'Pending').length}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-5 h-5" /></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">STAT/Emergency</p>
                <h3 className="text-2xl font-black text-rose-600">{studies.filter(s => s.priority === 'STAT').length}</h3>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg text-rose-600"><AlertTriangle className="w-5 h-5" /></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">TAT Breached</p>
                <h3 className="text-2xl font-black text-orange-600">0</h3>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><Clock className="w-5 h-5" /></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">Reports Completed Today</p>
                <h3 className="text-2xl font-black text-emerald-600">{studies.filter(s => s.status === 'Completed').length}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><FileText className="w-5 h-5" /></div>
            </div>
          </div>
        </div>

        {/* Row 3: Analytics */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <TrendingUp className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-sm font-bold">7-day Studies Trend (Chart)</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <PieChart className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-sm font-bold">Modality Distribution (Chart)</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <BarChart3 className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-sm font-bold">TAT Performance (Chart)</p>
            </div>
          </div>
        </div>

        {/* Row 4: Organization table */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Organization Table</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Centres</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Radiologists</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Studies Today</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Studies</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Validity</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Storage</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {scopedSites.slice(0, 5).map(site => (
                  <tr key={site.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/unnathi/sites')}>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-[#0D2461]">{site.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{site.organizationType === 'COMPANY_MANAGED' ? 'Teleradiology' : 'Hospital'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">{scopedHospitals.filter(h => h.parentSiteId === site.id).length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{site.settings?.accountType || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">Unlimited</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">0 TB</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 5: Platform health */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Platform Health</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <Database className="w-5 h-5 text-cyan-400 mb-2" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Storage</p>
                <p className="text-lg font-bold">0 TB</p>
              </div>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <Activity className="w-5 h-5 text-emerald-400 mb-2" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Monthly Studies</p>
                <p className="text-lg font-bold">0</p>
              </div>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <Cloud className="w-5 h-5 text-blue-400 mb-2" />
              <div>
                <p className="text-xs text-slate-400 font-medium">DICOM Uploads</p>
                <p className="text-lg font-bold">0/hr</p>
              </div>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <FileText className="w-5 h-5 text-purple-400 mb-2" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Avg Study Size</p>
                <p className="text-lg font-bold">0 MB</p>
              </div>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <Users className="w-5 h-5 text-rose-400 mb-2" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Radiologists</p>
                <p className="text-lg font-bold">0 Online</p>
              </div>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <Network className="w-5 h-5 text-green-400 mb-2" />
              <div>
                <p className="text-xs text-slate-400 font-medium">System Health</p>
                <p className="text-lg font-bold text-green-400">All Systems Go</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-unnathi-fade-in">
      {/* Header */}
      <div className="flex flex-col mb-2">
        <h1 className="text-3xl font-black text-[#0D2461] flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#00A8CC] rounded-xl">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          {user?.role === 'SITE_ADMIN' ? 'Company Dashboard' : 
           'Dashboard'}
        </h1>
        <p className="text-sm font-semibold text-slate-400 mt-2 uppercase tracking-widest pl-14">
          Overview of your organization
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const bgColors = {
            blue: 'bg-blue-50 text-blue-600',
            rose: 'bg-rose-50 text-rose-600',
            emerald: 'bg-emerald-50 text-emerald-600',
            amber: 'bg-amber-50 text-amber-600'
          };
          const accentColors = {
            blue: 'bg-blue-500/5',
            rose: 'bg-rose-500/5',
            emerald: 'bg-emerald-500/5',
            amber: 'bg-amber-500/5'
          };

          return (
            <div 
              key={stat.label} 
              onClick={() => navigate(stat.link)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
            >
              <div className={`absolute right-0 top-0 w-24 h-24 ${accentColors[stat.color as keyof typeof accentColors]} rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-300`}></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-4xl font-black text-[#0D2461]">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${bgColors[stat.color as keyof typeof bgColors]}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-xs font-bold text-[#00A8CC] mt-6">
                Manage {stat.label.split(' ').pop()} <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Organization Hierarchy */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-[#0D2461]">Organization Hierarchy Overview</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Structured view of sites and their associated hospitals</p>
        </div>
        
        <div className="p-6 space-y-6">
          {scopedSites.map(company => (
            <div key={company.id} className="border border-indigo-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-indigo-50/50 to-white p-5 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0D2461] text-base">{company.name}</h4>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{company.code}</p>
                  </div>
                </div>
                <button onClick={() => navigate('/unnathi/sites')} className="text-xs font-bold text-indigo-600 flex items-center hover:text-indigo-800 transition-colors">
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              {/* Direct Company Hospitals */}
              {scopedHospitals.filter(h => h.parentSiteId === company.id).length > 0 ? (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {scopedHospitals.filter(h => h.parentSiteId === company.id).map(hospital => (
                    <div key={hospital.id} className="group flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 hover:border-[#00A8CC]/30 hover:bg-[#00A8CC]/5 transition-colors cursor-pointer" onClick={() => handleOpenDashboard(hospital.id)}>
                      <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-[#00A8CC] rounded-lg transition-colors">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-[#0D2461] transition-colors">{hospital.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Hospital</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center text-sm font-medium text-slate-400">
                  No hospitals mapped to this company yet.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnnathiDashboard;
