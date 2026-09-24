import React from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Building2, HeartPulse, Users, UserRound, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnnathiDashboard = () => {
  const { sites, hospitals, users, radiologists } = useMockDb();
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-unnathi-fade-in">
      {/* Header */}
      <div className="flex flex-col mb-2">
        <h1 className="text-3xl font-black text-[#0D2461] flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#00A8CC] rounded-xl">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          {user?.role === 'SUPER_ADMIN' ? 'Unnathi Platform Dashboard' : 
           user?.role === 'SITE_ADMIN' ? 'Company Dashboard' : 
           'Dashboard'}
        </h1>
        <p className="text-sm font-semibold text-slate-400 mt-2 uppercase tracking-widest pl-14">
          {user?.role === 'SUPER_ADMIN' ? 'Overview of the entire healthcare hierarchy' : 
           'Overview of your organization'}
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

          {/* Independent Hospitals - ONLY for SUPER_ADMIN */}
          {user?.role === 'SUPER_ADMIN' && scopedHospitals.filter(h => h.organizationType === 'UNNATHI_MANAGED').length > 0 && (
            <div className="border border-rose-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow mt-8">
              <div className="bg-gradient-to-r from-rose-50/50 to-white p-5 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-100 text-rose-700 rounded-lg">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0D2461] text-base">Independent Hospitals</h4>
                    <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">Unnathi Managed</p>
                  </div>
                </div>
                <button onClick={() => navigate('/unnathi/hospitals')} className="text-xs font-bold text-rose-600 flex items-center hover:text-rose-800 transition-colors">
                  Manage Hospitals <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scopedHospitals.filter(h => h.organizationType === 'UNNATHI_MANAGED').map(hospital => (
                  <div key={hospital.id} className="group flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer" onClick={() => handleOpenDashboard(hospital.id)}>
                    <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-rose-500 rounded-lg transition-colors">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-700 group-hover:text-[#0D2461] transition-colors">{hospital.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{hospital.code}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnnathiDashboard;
