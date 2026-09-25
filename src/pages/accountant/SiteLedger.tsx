import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { 
  Eye, FileText, RefreshCw, LayoutGrid, Calendar as CalendarIcon, 
  Search, X, CheckCircle, ShieldAlert, Loader2, Download, Plus, Wallet
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';

export default function SiteLedger() {
  const { user } = useAuthStore();
  const { hospitals, studies, invoices, addInvoice, updateStudy } = useMockDb();
  const [activeTab, setActiveTab] = useState<'All' | 'Prepaid' | 'Postpaid'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [siteDetailsModal, setSiteDetailsModal] = useState<any | null>(null);
  
  // Specific Action Modals
  const [billingModal, setBillingModal] = useState<any | null>(null);
  const [addFundsModal, setAddFundsModal] = useState<any | null>(null);
  const [addFundsData, setAddFundsData] = useState({ amount: '', method: 'UPI', reference: '', remarks: '' });
  const [syncState, setSyncState] = useState<{ [key: string]: 'syncing' | 'success' }>({});
  const [gridModal, setGridModal] = useState<any | null>(null);
  const [scheduleModal, setScheduleModal] = useState<any | null>(null);
  const [downloadState, setDownloadState] = useState<{ [key: string]: 'downloading' | 'success' }>({});

  const scopedHospitals = hospitals.filter(h => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.hospitalId) return h.id === user.hospitalId;
    if (user?.siteId) return h.parentSiteId === user.siteId;
    return false;
  });

  const filteredCentres = scopedHospitals
    .filter(c => activeTab === 'All' || ((c as any).accountType || 'Postpaid') === activeTab)
    .filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((c as any).siteNumber || c.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSync = (siteId: string) => {
    setSyncState(prev => ({ ...prev, [siteId]: 'syncing' }));
    setTimeout(() => {
      setSyncState(prev => ({ ...prev, [siteId]: 'success' }));
      setTimeout(() => {
        setSyncState(prev => {
          const newState = { ...prev };
          delete newState[siteId];
          return newState;
        });
      }, 2000);
    }, 1500);
  };

  const handleDownload = (siteId: string) => {
    setDownloadState(prev => ({ ...prev, [siteId]: 'downloading' }));
    setTimeout(() => {
      // Simulate real download by creating a blob and triggering a download link
      const blob = new Blob([`Charge Sheet Data for Site ${siteId}\nDate: ${new Date().toISOString()}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Charge_Sheet_${siteId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadState(prev => ({ ...prev, [siteId]: 'success' }));
      setTimeout(() => {
        setDownloadState(prev => {
          const newState = { ...prev };
          delete newState[siteId];
          return newState;
        });
      }, 2000);
    }, 2000);
  };

  const getBillingBreakdown = (hospital: any) => {
    const unbilledStudies = studies.filter(s => 
      s.hospitalId === hospital.id && 
      ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus) && 
      s.superAdminPaymentStatus !== 'Paid'
    );
    
    const breakdown: Record<string, { count: number, commission: number, total: number }> = {};
    let totalUnbilledAmount = 0;
    
    unbilledStudies.forEach(s => {
      // For Super Admin view, compute commission (modality pricing)
      const comm = hospital.modalityCommissions?.[s.modality] || (s.modality === 'MRI' ? 150 : (s.modality === 'CT' ? 100 : (['X-Ray', 'CR', 'DR'].includes(s.modality) ? 30 : 50)));
      if (!breakdown[s.modality]) {
        breakdown[s.modality] = { count: 0, commission: comm, total: 0 };
      }
      breakdown[s.modality].count++;
      breakdown[s.modality].total += comm;
      totalUnbilledAmount += comm;
    });
    
    return { breakdown, totalUnbilledAmount, totalUnbilledCount: unbilledStudies.length };
  };

  const handleConfirmPayment = () => {
    if (!billingModal) return;
    
    const unbilledStudies = studies.filter(s => 
      s.hospitalId === billingModal.id && 
      ['Final', 'Verified', 'Dispatched'].includes(s.reportingStatus) && 
      s.superAdminPaymentStatus !== 'Paid'
    );
    
    // Mark these studies as paid for the super admin commission
    unbilledStudies.forEach(s => {
      // NOTE: We do not create an invoice here to avoid polluting the patient invoice list.
      // The commission payment is tracked purely via superAdminPaymentStatus.
      updateStudy(s.id, { superAdminPaymentStatus: 'Paid' });
    });
    
    setBillingModal(null);
  };

  const handleAddFunds = () => {
    if (!addFundsModal || !addFundsData.amount) return;
    const amount = Number(addFundsData.amount);
    if (isNaN(amount) || amount <= 0) return;
    
    // Update the hospital's wallet balance
    const newBalance = (addFundsModal.walletBalance || 0) + amount;
    updateHospital(addFundsModal.id, { walletBalance: newBalance });
    
    setAddFundsModal(null);
    setAddFundsData({ amount: '', method: 'UPI', reference: '', remarks: '' });
  };

  return (
    <>
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Site Ledger</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Finance / Site ledger</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            {['All', 'Prepaid', 'Postpaid'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex items-center px-6 py-2 text-sm font-black rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-[#0D2461] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'All' && <LayoutGrid className="w-4 h-4 mr-2 text-slate-400" />}
                {tab}
              </button>
            ))}
          </div>
          
          <label className="flex items-center space-x-2 text-sm font-bold text-slate-600 cursor-pointer hover:text-[#0D2461] transition-colors bg-slate-50 border border-slate-200 h-11 px-4 rounded-xl">
            <input type="checkbox" className="rounded text-[#00A8CC] focus:ring-[#00A8CC] w-4 h-4" />
            <span>Pending Payment</span>
          </label>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search site, email, mob..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-9 w-[250px] h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 text-sm font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase">Site No</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Site Details</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase text-center">Payment Status</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase text-center">Billing</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase text-center">Payment</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase text-center">Charges</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase text-center">Warning Status</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase text-center">Warning Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCentres.map((centre, idx) => (
              <TableRow key={centre.id || idx} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-50 group">
                <TableCell className="py-4 px-6 font-mono text-slate-500 font-bold text-xs">
                  {((centre as any).siteNumber || centre.code || 'S-1').replace('S-', '8') + Math.floor(Math.random() * 100)}
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-black text-[#0D2461] uppercase text-sm">{centre.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(centre as any).accountType || 'Postpaid'} account</div>
                    </div>
                    <button 
                      onClick={() => setSiteDetailsModal(centre)} 
                      title="View Secure Site Details" 
                      className="text-[#0D2461] hover:text-[#00A8CC] hover:bg-cyan-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    {centre.accountType === 'Prepaid' ? (
                      <>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wallet Balance</span>
                        <span className={`text-sm font-black ${((centre.walletBalance || 0) - getBillingBreakdown(centre).totalUnbilledAmount) <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ₹ {((centre.walletBalance || 0) - getBillingBreakdown(centre).totalUnbilledAmount)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Amount</span>
                        <span className={`text-sm font-black ${getBillingBreakdown(centre).totalUnbilledAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ₹ {getBillingBreakdown(centre).totalUnbilledAmount}
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4 text-center">
                  <button 
                    onClick={() => setBillingModal(centre)}
                    className="inline-flex items-center px-3 py-1.5 border border-indigo-200 text-indigo-600 bg-indigo-50 rounded-lg text-xs font-black hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> BILLING
                  </button>
                </TableCell>
                <TableCell className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 w-fit mx-auto">
                    
                    {/* Sync Button */}
                    <button 
                      onClick={() => handleSync(centre.id)}
                      disabled={syncState[centre.id] === 'syncing'}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors disabled:opacity-50"
                      title="Sync Payment Log"
                    >
                      {syncState[centre.id] === 'syncing' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : syncState[centre.id] === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* View Grid Button */}
                    <button 
                      onClick={() => setGridModal(centre)}
                      className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-100 transition-colors"
                      title="View Payment Grid"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    
                    {/* Schedule Button */}
                    <button 
                      onClick={() => setScheduleModal(centre)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors"
                      title="Payment Schedule"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </button>

                    {/* Add Funds Button */}
                    {centre.accountType === 'Prepaid' && user?.role === 'SUPER_ADMIN' && (
                      <button 
                        onClick={() => setAddFundsModal(centre)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="Add Funds to Wallet"
                      >
                        <Wallet className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4 text-center">
                  <button 
                    onClick={() => handleDownload(centre.id)}
                    disabled={downloadState[centre.id] === 'downloading'}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-sm disabled:opacity-50"
                    title="Download Charge Sheet"
                  >
                    {downloadState[centre.id] === 'downloading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : downloadState[centre.id] === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </TableCell>
                <TableCell className="py-4 px-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </TableCell>
                <TableCell className="py-4 px-6 text-center text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                  Off
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>

      {/* ─── Custom Overlay Modals ────────────────────────────────────────────── */}
      
      {/* 1. Site Details Modal (The "Eye" Icon Modal) */}
      {siteDetailsModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-slate-50/50 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0D2461] tracking-tight">Secure Site Details</h2>
                </div>
              </div>
              <button onClick={() => setSiteDetailsModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center border-b border-slate-100 pb-6">
                <h3 className="text-2xl font-black text-[#0D2461]">{siteDetailsModal.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Site No: {siteDetailsModal.siteNumber || siteDetailsModal.code}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username / Contact ID</label>
                  <div className="text-sm font-black text-slate-800 mt-1">{siteDetailsModal.contactPerson || 'admin'}</div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 rounded-bl-full -mr-8 -mt-8"></div>
                  <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest relative z-10">Secure Access Password</label>
                  <div className="flex justify-between items-center mt-1 relative z-10">
                    <div className="text-base font-mono font-bold text-amber-900 tracking-wider bg-amber-100/50 px-3 py-1 rounded-lg">
                      {siteDetailsModal.name.split(' ')[0]}@123
                    </div>
                    <CheckCircle className="w-5 h-5 text-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {siteDetailsModal.accountType === 'Prepaid' ? 'Remaining Balance' : 'Current Due'}
                    </label>
                    <div className={`text-xl font-black mt-1 ${
                      siteDetailsModal.accountType === 'Prepaid' 
                        ? ((siteDetailsModal.walletBalance || 0) - getBillingBreakdown(siteDetailsModal).totalUnbilledAmount <= 0 ? 'text-rose-600' : 'text-emerald-600')
                        : (getBillingBreakdown(siteDetailsModal).totalUnbilledAmount > 0 ? 'text-rose-600' : 'text-emerald-600')
                    }`}>
                      ₹ {
                        siteDetailsModal.accountType === 'Prepaid'
                          ? ((siteDetailsModal.walletBalance || 0) - getBillingBreakdown(siteDetailsModal).totalUnbilledAmount)
                          : getBillingBreakdown(siteDetailsModal).totalUnbilledAmount
                      }
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Type</label>
                    <div className="text-xl font-black text-[#0D2461] mt-1">{siteDetailsModal.accountType || 'Postpaid'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-6 bg-slate-50/50 border-t border-slate-100 gap-3">
              <Button onClick={() => setSiteDetailsModal(null)} className="w-full h-11 rounded-xl font-black bg-[#0D2461] hover:bg-[#081840] text-white shadow-md shadow-[#0D2461]/20">
                Close Secure View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Billing Modal */}
      {billingModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-slate-50/50 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0D2461] tracking-tight">
                    {billingModal.accountType === 'Prepaid' ? 'Wallet Overview' : 'Confirm Payment'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">For {billingModal.name} ({billingModal.accountType || 'Postpaid'})</p>
                </div>
              </div>
              <button onClick={() => setBillingModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Billing Period</p>
                    <p className="text-sm font-black text-indigo-900 mt-1">{format(new Date(), 'MMM 01, yyyy')} - {format(new Date(), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Unbilled Studies</p>
                    <p className="text-xl font-black text-indigo-600 mt-1">{getBillingBreakdown(billingModal).totalUnbilledCount}</p>
                  </div>
                </div>
                
                <div className="border-t border-indigo-100/50 pt-4">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Modality Breakdown (Unbilled)</p>
                  <div className="space-y-2">
                    {Object.entries(getBillingBreakdown(billingModal).breakdown).map(([mod, data]) => (
                      <div key={mod} className="flex justify-between items-center text-xs font-semibold text-indigo-900 bg-white/60 px-3 py-1.5 rounded-lg border border-indigo-50">
                        <span>{data.count} {mod} Scans (× ₹{data.commission})</span>
                        <span>₹ {data.total}</span>
                      </div>
                    ))}
                    {Object.keys(getBillingBreakdown(billingModal).breakdown).length === 0 && (
                      <div className="text-xs font-semibold text-slate-500 italic">No unbilled studies found.</div>
                    )}
                  </div>
                  
                  {billingModal.accountType === 'Prepaid' ? (
                    <>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-indigo-100/50">
                        <span className="text-sm font-black text-slate-600">Initial Wallet Amount</span>
                        <span className="text-sm font-black text-slate-700">₹ {billingModal.walletBalance || 0}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-black text-rose-600">Auto-Deducted</span>
                        <span className="text-sm font-black text-rose-600">- ₹ {getBillingBreakdown(billingModal).totalUnbilledAmount}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-indigo-100/50">
                        <span className="text-sm font-black text-indigo-900">Remaining Balance</span>
                        <span className={`text-lg font-black ${(billingModal.walletBalance || 0) - getBillingBreakdown(billingModal).totalUnbilledAmount <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ₹ {(billingModal.walletBalance || 0) - getBillingBreakdown(billingModal).totalUnbilledAmount}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-indigo-100/50">
                      <span className="text-sm font-black text-indigo-900">Total Due Amount</span>
                      <span className="text-lg font-black text-indigo-700">₹ {getBillingBreakdown(billingModal).totalUnbilledAmount}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
                <textarea 
                  className="w-full h-24 p-3 rounded-xl bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 text-sm font-semibold resize-none"
                  placeholder={billingModal.accountType === 'Prepaid' ? 'Notes about wallet...' : 'Enter any specific notes for this payment confirmation...'}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end p-6 border-t border-slate-100 bg-slate-50/50 gap-3">
              <Button variant="outline" onClick={() => setBillingModal(null)} className="h-11 px-6 rounded-xl font-bold border-slate-200">
                Close
              </Button>
              {billingModal.accountType === 'Prepaid' ? (
                <Button 
                  onClick={() => {
                    setAddFundsModal(billingModal);
                    setBillingModal(null);
                  }} 
                  className="h-11 px-8 rounded-xl font-black bg-[#00A8CC] hover:bg-[#0090B0] text-white shadow-md shadow-[#00A8CC]/20"
                >
                  Recharge Wallet
                </Button>
              ) : (
                <Button onClick={handleConfirmPayment} disabled={getBillingBreakdown(billingModal).totalUnbilledAmount === 0} className="h-11 px-8 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                  Confirm Payment Received
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Payment Grid Modal */}
      {gridModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-50/50 flex justify-between items-center border-b border-slate-100 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0D2461] tracking-tight">Payment History Grid</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">For {gridModal.name}</p>
                </div>
              </div>
              <button onClick={() => setGridModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-100">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-slate-400 font-black py-3 px-4 text-[10px] tracking-widest uppercase">Date</TableHead>
                      <TableHead className="text-slate-400 font-black py-3 px-4 text-[10px] tracking-widest uppercase">Transaction ID</TableHead>
                      <TableHead className="text-slate-400 font-black py-3 px-4 text-[10px] tracking-widest uppercase text-right">Amount</TableHead>
                      <TableHead className="text-slate-400 font-black py-3 px-4 text-[10px] tracking-widest uppercase text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3].map((i) => (
                      <TableRow key={i} className="hover:bg-slate-50 border-b border-slate-50">
                        <TableCell className="py-3 px-4 text-xs font-bold text-slate-600">2026-08-0{i}</TableCell>
                        <TableCell className="py-3 px-4 text-xs font-mono text-slate-500">TXN-9842{i}A</TableCell>
                        <TableCell className="py-3 px-4 text-xs text-right font-black text-slate-800">₹ {(Math.random() * 50000).toFixed(0)}</TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-50 text-emerald-600">Successful</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="flex justify-end p-6 bg-slate-50/50 border-t border-slate-100 shrink-0">
              <Button onClick={() => setGridModal(null)} className="h-10 px-6 rounded-xl font-bold bg-[#0D2461] hover:bg-[#081840] text-white">
                Close Grid
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {addFundsModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 bg-emerald-50/50 flex justify-between items-center border-b border-emerald-100/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-emerald-900 tracking-tight">Add Wallet Funds</h2>
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mt-1">For {addFundsModal.name}</p>
                </div>
              </div>
              <button onClick={() => setAddFundsModal(null)} className="p-2 hover:bg-emerald-100 rounded-full transition-colors text-emerald-600/50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount (₹) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-semibold">₹</span>
                  </div>
                  <Input 
                    type="number"
                    value={addFundsData.amount}
                    onChange={e => setAddFundsData(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-8 h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-black"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['UPI', 'NEFT', 'Cash'].map(method => (
                    <button
                      key={method}
                      onClick={() => setAddFundsData(prev => ({ ...prev, method }))}
                      className={`h-10 rounded-lg text-sm font-bold border transition-all ${
                        addFundsData.method === method 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {addFundsData.method !== 'Cash' && (
                <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Transaction / Reference ID</label>
                  <Input 
                    value={addFundsData.reference}
                    onChange={e => setAddFundsData(prev => ({ ...prev, reference: e.target.value }))}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-semibold"
                    placeholder="e.g. UTR or UPI Transaction ID"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Remarks (Optional)</label>
                <textarea 
                  value={addFundsData.remarks}
                  onChange={e => setAddFundsData(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full h-20 p-3 rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-semibold resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end p-6 border-t border-slate-100 bg-slate-50/50 gap-3">
              <Button variant="outline" onClick={() => setAddFundsModal(null)} className="h-11 px-6 rounded-xl font-bold border-slate-200 text-slate-600">
                Cancel
              </Button>
              <Button 
                onClick={handleAddFunds}
                disabled={!addFundsData.amount || Number(addFundsData.amount) <= 0}
                className="h-11 px-8 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                Add Funds
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-slate-50/50 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <CalendarIcon className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0D2461] tracking-tight">Payment Schedule</h2>
                </div>
              </div>
              <button onClick={() => setScheduleModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Next Payment Due Date</label>
                <Input 
                  type="date"
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 text-sm font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reminder Frequency</label>
                <select className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-semibold bg-slate-50 focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20 outline-none">
                  <option>Weekly</option>
                  <option>Bi-Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end p-6 border-t border-slate-100 bg-slate-50/50 gap-3">
              <Button variant="outline" onClick={() => setScheduleModal(null)} className="h-11 px-6 rounded-xl font-bold border-slate-200">
                Cancel
              </Button>
              <Button onClick={() => setScheduleModal(null)} className="h-11 px-8 rounded-xl font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20">
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
