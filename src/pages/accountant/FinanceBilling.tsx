import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { exportToCSV } from '../../utils/export';
import { Button } from '../../components/ui/button';
import { Calendar, Download, RefreshCw, Search, Building2, UserCircle2, FileText, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function FinanceBilling() {
  const { user } = useAuthStore();
  const { hospitals, radiologists, invoices, studies, templates, updateStudy } = useMockDb();
  const [activeTab, setActiveTab] = useState<'Site Postpaid' | 'Radiologist'>('Site Postpaid');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isLastMonth, setIsLastMonth] = useState(false);

  // Filter hospitals based on role/access
  const scopedHospitals = hospitals.filter(h => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.hospitalId) return h.id === user.hospitalId;
    if (user?.siteId) return h.parentSiteId === user.siteId;
    return false;
  });

  // Mock date calculations for UI
  const dateRangeStr = isLastMonth ? '01/08/2026 → 31/08/2026' : '01/09/2026 → 08/09/2026';

  const billingData = scopedHospitals.map((c, i) => {
    let totalAmount = 0;
    let totalStudy = 0;
    let isPaid = true;

    // For ALL roles, we only reflect the super admin dues/commissions for unbilled studies
    const unbilledStudies = studies.filter(s => 
      s.hospitalId === c.id && 
      ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus) &&
      s.superAdminPaymentStatus !== 'Paid'
    );
    totalStudy = unbilledStudies.length;
    totalAmount = unbilledStudies.reduce((sum, s) => sum + (c.modalityCommissions?.[s.modality] || 0), 0);
    isPaid = totalAmount === 0;

    return {
      id: c.id,
      siteNo: (c as any).siteNumber ? (c as any).siteNumber.replace('S-', '') : c.code || `S-${i+1}`,
      siteName: c.name,
      fromDate: isLastMonth ? '2026-08-01' : '2026-09-01',
      toDate: isLastMonth ? '2026-08-31' : '2026-09-08',
      services: (c as any).accountType || 'Postpaid',
      totalStudy,
      totalAmount,
      paymentStatus: isPaid,
      serviceStatus: c.status,
    };
  });

  // Filter radiologists based on role/access
  const scopedRadiologists = radiologists.filter(r => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.hospitalId) return r.hospitalIds?.includes(user.hospitalId);
    if (user?.siteId) {
      const siteHospitals = hospitals.filter(h => h.parentSiteId === user.siteId).map(h => h.id);
      return r.hospitalIds?.some(id => siteHospitals.includes(id));
    }
    return true;
  });

  // Generate payout data based on radiologist studies
  const payoutData = scopedRadiologists.map((r, i) => {
    const radStudies = studies.filter(s => s.assignedRadiologistId === r.id && (s.reportingStatus === 'Verified' || s.reportingStatus === 'Dispatched' || s.reportingStatus === 'Final'));
    const totalStudy = radStudies.length;
    
    let totalAmount = 0;
    radStudies.forEach(s => {
      const template = templates.find(t => t.hospitalId === s.hospitalId && t.modality === s.modality && (t.studyName === s.bodyPart || t.studyName === s.studyDescription));
      const studyPrice = template?.price || 500;
      totalAmount += (studyPrice * 0.3); // 30% payout
    });

    return {
      id: r.id,
      radId: `RAD-${(i + 1).toString().padStart(3, '0')}`,
      name: r.name,
      fromDate: isLastMonth ? '2026-08-01' : '2026-09-01',
      toDate: isLastMonth ? '2026-08-31' : '2026-09-08',
      specialization: r.specialization,
      totalStudy,
      totalAmount,
      paymentStatus: false,
      serviceStatus: r.availability,
    };
  });

  const activeData = activeTab === 'Site Postpaid' ? billingData : payoutData;
  const filteredData = selectedFilter === 'All' ? activeData : activeData.filter((d: any) => d.id === selectedFilter);

  const totalEntities = filteredData.length;
  const totalStudies = filteredData.reduce((acc, curr) => acc + curr.totalStudy, 0);
  const totalAmount = filteredData.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const handleExport = () => {
    const exportFileName = `finance_${activeTab === 'Site Postpaid' ? 'billing' : 'payout'}_${isLastMonth ? 'last_month' : 'current'}.csv`;
    const exportContent = activeTab === 'Site Postpaid' ? filteredData.map((b: any) => ({
      'Site No': b.siteNo,
      'Site Name': b.siteName,
      'Date Range': `${b.fromDate} to ${b.toDate}`,
      'Services': b.services,
      'Total Study': b.totalStudy,
      'Total Amount': b.totalAmount,
      'Payment Status': b.paymentStatus ? 'Paid' : 'Pending',
      'Service Status': b.serviceStatus
    })) : filteredData.map((r: any) => ({
      'Rad ID': r.radId,
      'Name': r.name,
      'Date Range': `${r.fromDate} to ${r.toDate}`,
      'Specialization': r.specialization,
      'Total Study': r.totalStudy,
      'Total Amount': r.totalAmount,
      'Payment Status': r.paymentStatus ? 'Paid' : 'Pending',
      'Status': r.serviceStatus
    }));

    exportToCSV(exportFileName, exportContent);
  };

  const handleCollectDues = (hospitalId: string) => {
    if (confirm("Are you sure you want to mark these studies as paid for the Super Admin?")) {
      const unbilledStudies = studies.filter(s => 
        s.hospitalId === hospitalId && 
        ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus) &&
        s.superAdminPaymentStatus !== 'Paid'
      );
      unbilledStudies.forEach(s => {
        updateStudy(s.id, { superAdminPaymentStatus: 'Paid' });
      });
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto p-8">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight font-heading flex items-center">
            <Building2 className="w-8 h-8 text-accent mr-3" /> Finance & Billing
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Manage postpaid sites and radiologist payouts</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-border shadow-inner">
          {['Site Postpaid', 'Radiologist'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as any); setSelectedFilter('All'); }}
              className={`flex items-center px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-white text-primary shadow-md border border-transparent translate-y-[1px]' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {tab === 'Site Postpaid' ? <Building2 className="w-4 h-4 mr-2" /> : <UserCircle2 className="w-4 h-4 mr-2" />}
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Control Strip */}
      <motion.div variants={itemVariants} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-bold border border-border bg-slate-50 text-slate-700 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner"
          >
            <option value="All">All {activeTab === 'Site Postpaid' ? 'Sites' : 'Radiologists'}</option>
            {activeTab === 'Site Postpaid' 
              ? scopedHospitals.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              : scopedRadiologists.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
            }
          </select>
        </div>

        <div className="flex items-center space-x-2 border border-border rounded-lg px-4 py-2 bg-slate-50 text-sm font-bold text-slate-700 shadow-inner">
          <span>{dateRangeStr}</span>
          <Calendar className="w-4 h-4 text-accent ml-2" />
        </div>

        <label className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-primary transition-colors bg-card border border-border py-2 px-4 rounded-lg shadow-sm">
          <input type="checkbox" checked={isLastMonth} onChange={(e) => setIsLastMonth(e.target.checked)} className="rounded border-slate-300 text-accent focus:ring-accent/50 w-4 h-4 cursor-pointer" />
          <span>Last Month</span>
        </label>

        <Button className="bg-primary hover:bg-primary-hover shadow-sm text-white px-5 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5">
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>

        <Button onClick={handleExport} variant="outline" className="border-border hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all">
          <Download className="w-4 h-4 mr-2 text-slate-400" /> Export
        </Button>
      </motion.div>

      {/* Summary Badges */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] p-6 rounded-2xl border-t-4 border-t-blue-500 border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-100/50 rounded-full blur-xl group-hover:bg-blue-200/50 transition-colors duration-500" />
          <div className="relative z-10 flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-black text-blue-600/80 uppercase tracking-widest">Total {activeTab === 'Site Postpaid' ? 'Hospitals' : 'Radiologists'}</h3>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-3xl font-black text-blue-950">{totalEntities}</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F0FDF4] p-6 rounded-2xl border-t-4 border-t-emerald-500 border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-xl group-hover:bg-emerald-200/50 transition-colors duration-500" />
          <div className="relative z-10 flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-black text-emerald-600/80 uppercase tracking-widest">Total Studies</h3>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-3xl font-black text-emerald-950">{totalStudies}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#F8FAFC] to-[#FFF7ED] p-6 rounded-2xl border-t-4 border-t-orange-500 border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-orange-100/50 rounded-full blur-xl group-hover:bg-orange-200/50 transition-colors duration-500" />
          <div className="relative z-10 flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-black text-orange-600/80 uppercase tracking-widest">Total Amount</h3>
            <div className="w-5 h-5 flex items-center justify-center font-bold text-orange-600">₹</div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-3xl font-black text-orange-950">₹ {totalAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </motion.div>

      {/* Data Grid */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50/50 border-b border-border">
              <tr>
                {activeTab === 'Site Postpaid' ? (
                  <>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Site No</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Site Name</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Date Range</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Services</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Rad ID</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Date Range</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Specialization</th>
                  </>
                )}
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Study</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Amount</th>
                <th className="px-6 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">Payment Status</th>
                <th className="px-6 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">{activeTab === 'Site Postpaid' ? 'Service Status' : 'Status'}</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              <AnimatePresence>
                {filteredData.map((row: any, idx: number) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={row.id || idx} 
                    className="hover:bg-accent/5 hover:-translate-y-[2px] hover:shadow-md hover:z-10 relative bg-card transition-all duration-300 ease-out group"
                  >
                    <td className="px-6 py-4 font-black text-slate-500 text-xs tracking-tight">{activeTab === 'Site Postpaid' ? row.siteNo : row.radId}</td>
                    <td className="px-6 py-4 font-black text-primary flex items-center">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3">
                        {activeTab === 'Site Postpaid' ? <Building2 className="w-4 h-4 text-accent" /> : <UserCircle2 className="w-4 h-4 text-accent" />}
                      </div>
                      {activeTab === 'Site Postpaid' ? row.siteName : row.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-700">{row.fromDate}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">to {row.toDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-[9px] uppercase tracking-widest font-black rounded shadow-sm border ${row.services === 'Postpaid' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {activeTab === 'Site Postpaid' ? row.services : row.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-700 text-base">{row.totalStudy}</td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">₹ {row.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                        <input type="checkbox" className="sr-only peer" defaultChecked={row.paymentStatus} />
                        <div className="w-10 h-5.5 bg-slate-200 border border-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-600 shadow-inner"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex items-center text-[9px] uppercase tracking-widest font-black rounded-full bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                        {row.serviceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        {user?.role === 'SUPER_ADMIN' && activeTab === 'Site Postpaid' && !row.paymentStatus ? (
                          <button onClick={() => handleCollectDues(row.id)} className="text-emerald-700 bg-emerald-50 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg border border-transparent hover:border-emerald-500/20 transition-all text-[11px] font-black uppercase tracking-widest flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Collect
                          </button>
                        ) : (
                          <button title={activeTab === 'Site Postpaid' ? 'Regenerate Bill Summary' : 'Process Payout'} className="text-accent bg-accent/10 hover:bg-accent hover:text-white p-2 rounded-lg border border-transparent hover:border-accent/20 transition-all">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="text-sm font-bold">No billing records found</p>
                      <p className="text-xs font-semibold mt-1">Try adjusting your filters or date range</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
