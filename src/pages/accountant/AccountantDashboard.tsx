import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { IndianRupee, FileText, AlertCircle, Banknote, TrendingUp, ArrowUpRight, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function AccountantDashboard() {
  const { invoices, studies, hospitals, updateStudy } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'Unpaid').reduce((acc, curr) => acc + curr.amount, 0);
  
  const scopedHospitals = hospitals.filter(h => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.hospitalId) return h.id === user.hospitalId;
    if (user?.siteId) return h.parentSiteId === user.siteId;
    return false;
  });
  
  const scopedHospitalIds = scopedHospitals.map(h => h.id);

  const unpaidStudies = studies.filter(s => 
    s.paymentStatus !== 'Paid' && 
    ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus) &&
    scopedHospitalIds.includes(s.hospitalId)
  );

  const superAdminDuesStudies = studies.filter(s => 
    scopedHospitalIds.includes(s.hospitalId) &&
    ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus) &&
    s.superAdminPaymentStatus !== 'Paid'
  );

  const superAdminDues = superAdminDuesStudies.reduce((acc, s) => {
    const hosp = hospitals.find(h => h.id === s.hospitalId);
    const comm = hosp?.modalityCommissions?.[s.modality] || 0;
    return acc + comm;
  }, 0);

  const handlePaySuperAdmin = () => {
    superAdminDuesStudies.forEach(s => {
      updateStudy(s.id, { superAdminPaymentStatus: 'Paid' });
    });
    setShowConfirmModal(false);
  };

  const mockRevenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0D2461] border-none shadow-2xl rounded-xl p-3 text-white">
          <p className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-lg font-black tracking-tight">₹{payload[0].value.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Accountant Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Daily revenue and pending dues overview</p>
          </div>
        </div>
        <Button onClick={() => navigate('/accountant/invoices')} className="h-10 px-5 text-sm font-black rounded-xl bg-[#00A8CC] hover:bg-[#008ba8] text-white shadow-md shadow-cyan-500/20 tracking-wide">
          Manage Invoices <ArrowUpRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      {/* Premium Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl inline-block">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Dues */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl inline-block">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Dues</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">₹{pendingRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Issued */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0D2461]/5 rounded-bl-full -mr-10 -mt-10 opacity-100 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="p-2.5 bg-slate-50 text-[#0D2461] rounded-xl inline-block border border-slate-100">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invoices Issued</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{invoices.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unbilled Studies */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl inline-block">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unbilled Studies</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{unpaidStudies.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Super Admin Dues */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl inline-block">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Super Admin Dues</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">₹{superAdminDues.toLocaleString('en-IN')}</span>
                </div>
                {superAdminDues > 0 && (
                  <button onClick={() => setShowConfirmModal(true)} className="mt-3 text-[10px] font-bold text-white bg-purple-500 hover:bg-purple-600 px-3 py-1.5 rounded-lg w-full transition-colors">
                    Pay Dues
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-black text-[#0D2461]">Revenue Trend</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">This Week</p>
            </div>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black">+14.5%</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRevenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar 
                  dataKey="revenue" 
                  fill="#00A8CC" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Unbilled Studies */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-black text-[#0D2461]">Recent Unbilled Studies</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Needs Invoice Generation</p>
          </div>
          <div className="p-2 flex-1">
            <div className="space-y-1">
              {unpaidStudies.slice(0, 5).map(study => (
                <div key={study.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                      <Banknote className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{study.caseNumber}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">{study.modality}</span>
                        <span className="text-xs font-semibold text-slate-500 truncate max-w-[200px]">{study.studyDescription}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/accountant/invoices')} 
                    variant="outline"
                    className="h-9 px-4 text-xs font-black rounded-lg border-slate-200 text-[#0D2461] hover:text-[#00A8CC] hover:border-[#00A8CC]/30 hover:bg-cyan-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    Generate
                  </Button>
                </div>
              ))}
              {unpaidStudies.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle className="w-10 h-10 mb-3 text-emerald-400" />
                  <p className="text-sm font-bold">All studies are billed!</p>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button onClick={() => navigate('/studies')} className="w-full text-[11px] font-bold text-slate-500 hover:text-[#00A8CC] uppercase tracking-widest transition-colors">
              View All Studies →
            </button>
          </div>
        </div>

      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col items-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            
            <h2 className="text-xl font-black text-[#0D2461] mb-2">Confirm Payment</h2>
            <p className="text-sm font-semibold text-slate-500 mb-8">
              Are you sure you want to mark <strong className="text-slate-800">₹{superAdminDues.toLocaleString('en-IN')}</strong> as paid to the Super Admin? This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-center w-full gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmModal(false)} 
                className="flex-1 h-12 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePaySuperAdmin} 
                className="flex-1 h-12 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
              >
                Confirm Paid
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
