import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { exportToCSV } from '../../utils/export';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Calendar, Download, RefreshCw, Search, Building2, UserCircle2, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

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

  // Generate payout data based on radiologist studies (assuming 30% payout of template price)
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
      paymentStatus: false, // You would need a payout table to track this properly
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
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header with Segmented Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Finance Billing</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage postpaid sites and radiologist payouts</p>
        </div>
        
        <div className="flex p-1 bg-slate-100 rounded-xl">
          {['Site Postpaid', 'Radiologist'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex items-center px-6 py-2 text-sm font-black rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-white text-[#0D2461] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'Site Postpaid' ? <Building2 className="w-4 h-4 mr-2" /> : <UserCircle2 className="w-4 h-4 mr-2" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Control Strip */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
        <select 
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="flex-1 min-w-[200px] h-11 border-slate-200 rounded-xl text-sm font-semibold bg-slate-50 px-4 focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20 outline-none transition-all"
        >
          <option value="All">All {activeTab === 'Site Postpaid' ? 'Sites' : 'Radiologists'}</option>
          {activeTab === 'Site Postpaid' 
            ? scopedHospitals.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
            : scopedRadiologists.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
          }
        </select>

        <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-4 h-11 bg-slate-50 text-sm font-semibold text-slate-600">
          <span>{dateRangeStr}</span>
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
        </div>

        <label className="flex items-center space-x-2 text-sm font-bold text-slate-600 cursor-pointer hover:text-[#0D2461] transition-colors bg-slate-50 border border-slate-200 h-11 px-4 rounded-xl">
          <input type="checkbox" checked={isLastMonth} onChange={(e) => setIsLastMonth(e.target.checked)} className="rounded text-[#00A8CC] focus:ring-[#00A8CC] w-4 h-4" />
          <span>Last Month</span>
        </label>

        <Button className="h-11 px-6 rounded-xl font-black bg-[#0D2461] hover:bg-[#081840] text-white shadow-md shadow-[#0D2461]/20">
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>

        <Button onClick={handleExport} variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Premium Summary Badges */}
      <div className="flex flex-wrap gap-4 justify-start">
        <div className="flex items-center px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Total {activeTab === 'Site Postpaid' ? 'Hospitals' : 'Radiologists'}</p>
            <p className="text-lg font-black text-indigo-900">{totalEntities}</p>
          </div>
        </div>
        
        <div className="flex items-center px-5 py-2.5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Studies</p>
            <p className="text-lg font-black text-blue-900">{totalStudies}</p>
          </div>
        </div>

        <div className="flex items-center px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
            <span className="font-black text-emerald-600 text-sm">₹</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Total Amount</p>
            <p className="text-lg font-black text-emerald-900">₹ {totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              {activeTab === 'Site Postpaid' ? (
                <>
                  <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase">Site No</TableHead>
                  <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Site Name</TableHead>
                  <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Date Range</TableHead>
                  <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Services</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase">Rad ID</TableHead>
                  <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Name</TableHead>
                  <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Date Range</TableHead>
                  <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Specialization</TableHead>
                </>
              )}
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase text-right">Total Study</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase text-right">Total Amount</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase text-center">Payment Status</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase text-center">{activeTab === 'Site Postpaid' ? 'Service Status' : 'Status'}</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row: any, idx: number) => (
              <TableRow key={row.id || idx} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-50 group">
                <TableCell className="py-4 px-6 font-mono text-slate-500 font-bold text-xs">{activeTab === 'Site Postpaid' ? row.siteNo : row.radId}</TableCell>
                <TableCell className="py-4 px-4 font-black text-[#0D2461] text-sm uppercase">{activeTab === 'Site Postpaid' ? row.siteName : row.name}</TableCell>
                <TableCell className="py-4 px-4">
                  <div className="text-xs font-bold text-slate-600">{row.fromDate}</div>
                  <div className="text-[10px] font-semibold text-slate-400">to {row.toDate}</div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${row.services === 'Postpaid' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {activeTab === 'Site Postpaid' ? row.services : row.specialization}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4 text-right font-black text-slate-800">{row.totalStudy}</TableCell>
                <TableCell className="py-4 px-6 text-right font-black text-emerald-600">₹ {row.totalAmount.toLocaleString('en-IN')}</TableCell>
                <TableCell className="py-4 px-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={row.paymentStatus} />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00A8CC]"></div>
                  </label>
                </TableCell>
                <TableCell className="py-4 px-4 text-center">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{row.serviceStatus}</span>
                </TableCell>
                <TableCell className="py-4 px-6 text-center">
                  {user?.role === 'SUPER_ADMIN' && activeTab === 'Site Postpaid' && !row.paymentStatus ? (
                    <Button onClick={() => handleCollectDues(row.id)} className="h-8 px-3 text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                      Collect
                    </Button>
                  ) : (
                    <button className="p-2 rounded-lg text-slate-400 hover:text-[#00A8CC] hover:bg-cyan-50 transition-colors" title={activeTab === 'Site Postpaid' ? 'Regenerate Bill Summary' : 'Process Payout'}>
                      <RefreshCw className="w-4 h-4 mx-auto" />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FileText className="h-8 w-8 mb-3 opacity-20" />
                    <p className="text-sm font-medium">No billing records found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
