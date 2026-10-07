import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { exportToCSV } from '../../utils/export';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Calendar, Download, RefreshCw, Search, Building2, UserCircle2, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Card } from '../../components/ui/card';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Finance Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage postpaid sites and radiologist payouts</p>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-md border border-border">
          {['Site Postpaid', 'Radiologist'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                activeTab === tab 
                  ? 'bg-card text-foreground shadow-sm border border-border' 
                  : 'text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {tab === 'Site Postpaid' ? <Building2 className="w-4 h-4 mr-2" /> : <UserCircle2 className="w-4 h-4 mr-2" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Control Strip */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="flex-1 min-w-[200px] h-9 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
          >
            <option value="All">All {activeTab === 'Site Postpaid' ? 'Sites' : 'Radiologists'}</option>
            {activeTab === 'Site Postpaid' 
              ? scopedHospitals.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              : scopedRadiologists.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
            }
          </select>

          <div className="flex items-center space-x-2 border border-border rounded-md px-3 h-9 bg-card text-sm font-medium text-foreground shadow-sm">
            <span>{dateRangeStr}</span>
            <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
          </div>

          <label className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors bg-card border border-border h-9 px-3 rounded-md shadow-sm">
            <input type="checkbox" checked={isLastMonth} onChange={(e) => setIsLastMonth(e.target.checked)} className="rounded border-border text-primary focus:ring-primary w-4 h-4" />
            <span>Last Month</span>
          </label>

          <Button className="h-9 px-4">
            <Search className="w-4 h-4 mr-2" /> Search
          </Button>

          <Button onClick={handleExport} variant="outline" className="h-9 px-4">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </Card>

      {/* Summary Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center p-4">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mr-4">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total {activeTab === 'Site Postpaid' ? 'Hospitals' : 'Radiologists'}</p>
            <p className="text-xl font-semibold text-foreground">{totalEntities}</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-4">
          <div className="w-10 h-10 rounded-md bg-secondary/10 flex items-center justify-center mr-4">
            <FileText className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Studies</p>
            <p className="text-xl font-semibold text-foreground">{totalStudies}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="w-10 h-10 rounded-md bg-success/10 flex items-center justify-center mr-4">
            <span className="font-semibold text-success text-lg">₹</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Amount</p>
            <p className="text-xl font-semibold text-success">₹ {totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </Card>
      </div>

      {/* Data Grid */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent">
                {activeTab === 'Site Postpaid' ? (
                  <>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Site No</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Site Name</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Date Range</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Services</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Rad ID</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Name</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Date Range</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Specialization</TableHead>
                  </>
                )}
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3 text-right">Total Study</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3 text-right">Total Amount</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3 text-center">Payment Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3 text-center">{activeTab === 'Site Postpaid' ? 'Service Status' : 'Status'}</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row: any, idx: number) => (
                <TableRow key={row.id || idx} className="hover:bg-muted/30 transition-colors border-b border-border group">
                  <TableCell className="py-3 font-mono text-muted-foreground text-xs">{activeTab === 'Site Postpaid' ? row.siteNo : row.radId}</TableCell>
                  <TableCell className="py-3 font-medium text-primary text-sm">{activeTab === 'Site Postpaid' ? row.siteName : row.name}</TableCell>
                  <TableCell className="py-3">
                    <div className="text-xs font-medium text-foreground">{row.fromDate}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">to {row.toDate}</div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${row.services === 'Postpaid' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-success/10 text-success border-success/20'}`}>
                      {activeTab === 'Site Postpaid' ? row.services : row.specialization}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right font-medium text-foreground">{row.totalStudy}</TableCell>
                  <TableCell className="py-3 text-right font-semibold text-success">₹ {row.totalAmount.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={row.paymentStatus} />
                      <div className="w-9 h-5 bg-muted border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success peer-checked:border-success"></div>
                    </label>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <span className="text-[10px] font-semibold text-success uppercase">{row.serviceStatus}</span>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    {user?.role === 'SUPER_ADMIN' && activeTab === 'Site Postpaid' && !row.paymentStatus ? (
                      <Button onClick={() => handleCollectDues(row.id)} size="sm" className="h-7 px-3 text-[10px] bg-success hover:bg-success/90 text-success-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        Collect
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity" title={activeTab === 'Site Postpaid' ? 'Regenerate Bill Summary' : 'Process Payout'}>
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                    No billing records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
