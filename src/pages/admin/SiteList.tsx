import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMockDb } from '../../store/useMockDb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Search, Edit, CheckCircle, FileText, PlusCircle, 
  EyeOff, Eye, List, Download, Calendar, Clock, X,
  Shield, Settings, Upload, Server, UserCheck, 
  CreditCard, MapPin, Phone, Mail, FileSpreadsheet, Lock, Trash2
} from 'lucide-react';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';

export default function SiteList() {
  const { hospitals, addHospital, updateHospital, deleteHospital } = useMockDb();
  const [activeTab, setActiveTab] = useState<'All' | 'Prepaid' | 'Postpaid'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  
  // Custom Action Modal State
  const [actionModal, setActionModal] = useState<{ type: string; siteName: string; siteId?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // View Charges State
  const [isEditingCharges, setIsEditingCharges] = useState(false);
  const [siteCharges, setSiteCharges] = useState([
    { id: 1, name: 'CT Scan', price: 1200 },
    { id: 2, name: 'MRI Scan', price: 2500 },
    { id: 3, name: 'X-Ray', price: 300 },
    { id: 4, name: 'Ultrasound', price: 600 }
  ]);

  const [newSite, setNewSite] = useState({
    name: '', siteNumber: '', contactPerson: '', email: '', phone: '', address: '', accountType: 'Postpaid', city: '', password: '', modality: 'X-Ray, CT, MRI', headerSpace: '4'
  });

  const filteredCentres = hospitals
    .filter(c => activeTab === 'All' || c.accountType === activeTab)
    .filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.siteNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Clean up dummy profiles (anything named NEW DIAGNOSTICS)
  useEffect(() => {
    hospitals.forEach(c => {
      if (c.name.includes('NEW DIAGNOSTICS')) {
        deleteHospital(c.id);
      }
    });
  }, []);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name || !newSite.siteNumber) {
      alert("Name and Site Number are required!");
      return;
    }
    
    if (editingSiteId) {
      updateHospital(editingSiteId, {
        name: newSite.name,
        siteNumber: newSite.siteNumber,
        contactPerson: newSite.contactPerson,
        email: newSite.email,
        phone: newSite.phone,
        address: newSite.address,
        accountType: newSite.accountType as 'Prepaid' | 'Postpaid'
      });
    } else {
      addHospital({
        id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: newSite.name,
        siteNumber: newSite.siteNumber,
        contactPerson: newSite.contactPerson || 'admin',
        email: newSite.email,
        phone: newSite.phone,
        address: newSite.address,
        status: 'Active',
        serviceTypes: newSite.modality.split(', '),
        accountType: newSite.accountType as 'Prepaid' | 'Postpaid',
        branchId: 'b1',
        createdAt: new Date().toISOString()
      } as any);
    }
    closeModal();
  };

  const openEditModal = (centre: any) => {
    setEditingSiteId(centre.id);
    setNewSite({
      name: centre.name,
      siteNumber: centre.siteNumber,
      contactPerson: centre.contactPerson || '',
      email: centre.email || '',
      phone: centre.phone || '',
      address: centre.address || '',
      accountType: centre.accountType,
      city: 'MYSURU',
      password: centre.name.split(' ')[0] + '@123',
      modality: centre.serviceTypes.join(', '),
      headerSpace: '4'
    });
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setEditingSiteId(null);
    setNewSite({ name: '', siteNumber: '', contactPerson: '', email: '', phone: '', address: '', accountType: 'Postpaid', city: '', password: '', modality: 'X-Ray, CT', headerSpace: '4' });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    updateCentre(id, { status: currentStatus === 'Active' ? 'Inactive' : 'Active' });
  };

  const handleFilter = (filterType: string) => {
    // Add real filters logic if needed
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteHospital(deletingId);
      setDeletingId(null);
    }
  };

  const deleteCentre = (id: string) => {
    setDeletingId(id);
  };

  const openAction = (type: string, siteName: string, siteId: string) => {
    setActionModal({ type, siteName, siteId });
    if (type === 'View Charges') {
      setIsEditingCharges(false);
    }
  };

  const togglePasswordVisibility = (siteId: string) => {
    setShowPasswords(prev => ({ ...prev, [siteId]: !prev[siteId] }));
  };

  // The huge rendering functions for modals
  const renderActionModalContent = () => {
    if (!actionModal) return null;
    const { type, siteName, siteId } = actionModal;

    switch (type) {
      case 'Assign Radiologist':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-xs text-slate-600 text-right">Site ID :</label>
              <Input value={siteId} readOnly className="h-8 text-xs bg-slate-50" />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-xs text-slate-600 text-right">Site Name :</label>
              <Input value={siteName} readOnly className="h-8 text-xs bg-slate-50" />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-xs text-slate-600 text-right">Select Radiologist :</label>
              <select className="h-8 text-xs border border-slate-200 rounded w-full outline-none focus:ring-1 focus:ring-[#00A8CC] px-2">
                <option value="">Select...</option>
                <option value="dr_sharma">Dr. Sharma</option>
                <option value="dr_patel">Dr. Patel</option>
              </select>
            </div>
          </div>
        );

      case 'DICOM Information':
        return (
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs font-mono text-slate-700 leading-relaxed overflow-y-auto h-24 shadow-inner">
              Port No : 1177<br/>
              IP Address : 192.168.1.227<br/>
              CT : 192.168.1.101 TRC AE : KINSPACS PORT : 115 (New)<br/>
              MRI : 192.168.1.25<br/>
              TRC Version : KCP
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Institute Name 1</label>
                <Input placeholder="Primary Name" className="h-8 text-xs border-slate-300 focus:border-[#00A8CC]" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Institute Name 2</label>
                <Input placeholder="Secondary Name" className="h-8 text-xs border-slate-300 focus:border-[#00A8CC]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] text-blue-600 block mb-1 font-bold uppercase tracking-wider">Calling AE Title</label>
                <Input placeholder="Calling AE Title" className="h-8 text-xs border-slate-300 focus:border-blue-400" />
              </div>
              <div>
                <label className="text-[10px] text-blue-600 block mb-1 font-bold uppercase tracking-wider">Called AE Title</label>
                <Input placeholder="Called AE Title" className="h-8 text-xs border-slate-300 focus:border-blue-400" />
              </div>
            </div>
          </div>
        );

      case 'Transaction History':
        return (
          <div className="flex flex-col h-[70vh] -mx-5 -mb-5 bg-slate-50">
            {/* Header Stats */}
            <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center text-xs font-bold shrink-0 shadow-sm z-20">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div> CREDITS <span className="text-emerald-600 ml-2">₹ 0</span></div>
                <div className="flex items-center gap-2 text-slate-600"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div> DEBITS <span className="text-rose-600 ml-2 text-base">₹ 9,80,800</span></div>
                <div className="flex items-center gap-2 text-slate-600"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div> TRANSACTIONS <span className="text-slate-800 ml-2">2960</span></div>
                <div className="flex items-center gap-2 text-slate-600"><div className="w-2 h-2 rounded-full bg-[#0D2461] shadow-sm shadow-blue-500/50"></div> CURRENT BALANCE <span className="text-[#0D2461] ml-2 text-base">₹ 0</span></div>
              </div>
              <div className="flex items-center gap-3">
                <Input type="date" className="h-8 text-xs w-36 border-slate-300" defaultValue="2026-06-08" />
                <span className="text-slate-400 text-xs">to</span>
                <Input type="date" className="h-8 text-xs w-36 border-slate-300" defaultValue="2026-09-08" />
                <Button size="sm" className="h-8 text-xs bg-[#0D2461] hover:bg-[#081840] shadow-sm">Search</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs border-slate-300">Export</Button>
              </div>
            </div>
            
            {/* Table */}
            <div className="flex-1 overflow-auto bg-slate-50/50 relative">
              <Table>
                <TableHeader className="bg-[#1E293B] sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="text-slate-200 font-bold py-3 text-[10px] text-center tracking-wider uppercase">Date & Time</TableHead>
                    <TableHead className="text-slate-200 font-bold py-3 text-[10px] tracking-wider uppercase">Description</TableHead>
                    <TableHead className="text-slate-200 font-bold py-3 text-[10px] text-center tracking-wider uppercase">Ref. No</TableHead>
                    <TableHead className="text-slate-200 font-bold py-3 text-[10px] text-center tracking-wider uppercase">Debit</TableHead>
                    <TableHead className="text-slate-200 font-bold py-3 text-[10px] text-center tracking-wider uppercase">Credit</TableHead>
                    <TableHead className="text-slate-200 font-bold py-3 text-[10px] text-center tracking-wider uppercase">Balance</TableHead>
                    <TableHead className="text-slate-200 font-bold py-3 text-[10px] text-center tracking-wider uppercase">Site Type</TableHead>
                    <TableHead className="text-slate-200 font-bold py-3 text-[10px] text-center tracking-wider uppercase">Added By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { date: '08 Sept 2026', time: '11:15 AM', desc: 'MRI - BRAIN PLAIN - MUBEEN TAJ 45Y F', debit: '₹ 280', type: 'Postpaid' },
                    { date: '08 Sept 2026', time: '11:10 AM', desc: 'CT - BRAIN PLAIN - SYEDA FASEEHA BAANU 56Y F', debit: '₹ 210', type: 'Postpaid' },
                    { date: '08 Sept 2026', time: '10:32 AM', desc: 'CT - BRAIN & FACE - GURU PRASADH 37Y M', debit: '₹ 350', type: 'Postpaid' },
                    { date: '08 Sept 2026', time: '10:10 AM', desc: 'CT - BRAIN FOLLOW UP - SHAHINA 55Y F', debit: '₹ 210', type: 'Postpaid' },
                    { date: '08 Sept 2026', time: '09:35 AM', desc: 'MRI - LUMBAR SPINE - MADU KUMAR 24Y M', debit: '₹ 330', type: 'Postpaid' },
                    { date: '08 Sept 2026', time: '08:54 AM', desc: 'CT - ABDOMEN & PELVIS PLAIN (M) - GOUSE AHAMED 3T', debit: '₹ 200', type: 'Postpaid' },
                    { date: '08 Sept 2026', time: '07:46 AM', desc: 'CT - THORAX - GOUSE AHAMED 3T', debit: '₹ 250', type: 'Postpaid' },
                    { date: '07 Sept 2026', time: '09:56 PM', desc: 'MRI - LUMBAR SPINE - SANAND 54 YRS M', debit: '₹ 330', type: 'Postpaid' },
                  ].map((row, i) => (
                    <TableRow key={i} className="border-b border-rose-100/40 hover:bg-white transition-colors bg-rose-50/20">
                      <TableCell className="py-3 px-4 text-[11px] text-center text-slate-700">
                        <div className="font-bold text-slate-800">{row.date}</div><div className="text-slate-500 font-medium">{row.time}</div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-[11px] text-rose-600 font-bold leading-relaxed">{row.desc}<br/><span className="text-slate-400 font-medium text-[10px] tracking-wide">Study Charge</span></TableCell>
                      <TableCell className="py-3 px-4 text-[11px] text-center text-slate-300 font-bold">-</TableCell>
                      <TableCell className="py-3 px-4 text-[12px] text-center text-rose-600 font-black">{row.debit}</TableCell>
                      <TableCell className="py-3 px-4 text-[11px] text-center text-slate-300 font-bold">-</TableCell>
                      <TableCell className="py-3 px-4 text-[12px] text-center text-[#0D2461] font-black">₹ 0</TableCell>
                      <TableCell className="py-3 px-4 text-[11px] text-center"><span className="px-2 py-1 border border-slate-200 bg-white shadow-sm rounded-md text-slate-600 font-bold uppercase tracking-wider text-[9px]">{row.type}</span></TableCell>
                      <TableCell className="py-3 px-4 text-[11px] text-center text-slate-300 font-bold">-</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case 'View Charges':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-[#0D2461]">Modality Pricing - {siteName}</h3>
              {isEditingCharges && (
                <Button size="sm" variant="ghost" onClick={() => setSiteCharges([...siteCharges, { id: Date.now(), name: 'New Modality', price: 0 }])} className="text-[#00A8CC] h-7 px-2 text-xs font-bold hover:bg-cyan-50">
                  <PlusCircle className="w-3 h-3 mr-1" /> Add Charge
                </Button>
              )}
            </div>
            <div className={`bg-slate-50 border border-slate-200 rounded-xl p-4 ${isEditingCharges ? 'space-y-3' : 'grid grid-cols-2 gap-4'}`}>
              {siteCharges.map(charge => (
                isEditingCharges ? (
                  <div key={charge.id} className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                    <Input 
                      value={charge.name} 
                      onChange={(e) => setSiteCharges(siteCharges.map(c => c.id === charge.id ? { ...c, name: e.target.value } : c))}
                      className="h-8 text-xs font-bold text-slate-700 w-1/2 border-slate-200 focus:border-[#00A8CC]"
                    />
                    <div className="flex items-center gap-2 w-1/2">
                      <span className="text-xs font-black text-slate-400">₹</span>
                      <Input 
                        type="number"
                        value={charge.price} 
                        onChange={(e) => setSiteCharges(siteCharges.map(c => c.id === charge.id ? { ...c, price: Number(e.target.value) } : c))}
                        className="h-8 text-xs font-black text-[#0D2461] border-slate-200 focus:border-[#00A8CC]"
                      />
                      <button onClick={() => setSiteCharges(siteCharges.filter(c => c.id !== charge.id))} className="text-rose-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded transition-colors" title="Remove">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={charge.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-100 hover:border-[#00A8CC]/30 transition-colors">
                    <span className="text-xs font-bold text-slate-600">{charge.name}</span>
                    <span className="font-black text-[#0D2461] text-sm">₹ {charge.price.toLocaleString()}</span>
                  </div>
                )
              ))}
              {siteCharges.length === 0 && !isEditingCharges && (
                 <div className="col-span-2 text-center text-slate-500 text-xs py-4">No charges configured.</div>
              )}
            </div>
            
            <div className="pt-2 border-t border-slate-100 mt-2">
              {isEditingCharges ? (
                <div className="flex gap-3 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setIsEditingCharges(false)} className="w-24 border-slate-300">Cancel</Button>
                  <Button size="sm" onClick={() => setIsEditingCharges(false)} className="w-32 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"><CheckCircle className="w-4 h-4 mr-2" /> Save</Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setIsEditingCharges(true)} className="w-full bg-[#00A8CC] text-white hover:bg-[#008ba8] shadow-md font-bold h-9"><Edit className="w-4 h-4 mr-2"/> Edit Charge Sheet</Button>
              )}
            </div>
          </div>
        );
        
      case 'Hide Details':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-[#0D2461] border-b pb-2 flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500"/> Privacy Settings</h3>
            <div className="flex justify-between items-center bg-indigo-50 p-3 rounded border border-indigo-100">
              <div>
                <div className="font-semibold text-sm text-[#0D2461]">Mask Patient PII</div>
                <div className="text-xs text-slate-500">Hide patient names and contact info for this site.</div>
              </div>
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500" defaultChecked />
            </div>
          </div>
        );
      case 'Radiologist Roster':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-[#0D2461] border-b pb-2">Shift Roster - {siteName}</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between p-3 bg-blue-50 text-blue-800 rounded shadow-sm border border-blue-100"><span>Morning (8AM - 2PM)</span><strong>Dr. Sharma</strong></div>
              <div className="flex justify-between p-3 bg-amber-50 text-amber-800 rounded shadow-sm border border-amber-100"><span>Evening (2PM - 8PM)</span><strong>Dr. Patel</strong></div>
              <div className="flex justify-between p-3 bg-indigo-50 text-indigo-800 rounded shadow-sm border border-indigo-100"><span>Night (8PM - 8AM)</span><strong>On Call</strong></div>
            </div>
          </div>
        );
      case 'Export Data':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-[#0D2461] border-b pb-2 flex items-center gap-2"><Download className="w-5 h-5 text-blue-500"/> Export Site Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">From</label>
                <Input type="date" className="h-9 text-xs border-slate-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">To</label>
                <Input type="date" className="h-9 text-xs border-slate-300" />
              </div>
            </div>
            <Button size="sm" className="w-full bg-[#0D2461] hover:bg-[#081840] text-white">Generate CSV</Button>
          </div>
        );
      case 'Scheduling':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-[#0D2461] border-b pb-2 flex items-center gap-2"><Calendar className="w-5 h-5 text-teal-500"/> TAT Scheduling</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded border border-slate-200">
                <span className="font-semibold text-slate-700">Routine TAT Limit</span>
                <select className="border-slate-200 rounded text-xs p-1.5 outline-none"><option>2 Hours</option><option>4 Hours</option><option>24 Hours</option></select>
              </div>
              <div className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded border border-slate-200">
                <span className="font-semibold text-slate-700">STAT TAT Limit</span>
                <select className="border-slate-200 rounded text-xs p-1.5 outline-none"><option>30 Mins</option><option>1 Hour</option></select>
              </div>
            </div>
          </div>
        );
      case 'Invoices':
        return (
          <div className="space-y-3">
            <h3 className="font-bold text-[#0D2461] border-b pb-2 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-rose-500"/> Generated Invoices</h3>
            {[
              { id: 'INV-26-08', amount: '₹ 45,000', status: 'Paid' },
              { id: 'INV-26-07', amount: '₹ 38,200', status: 'Paid' }
            ].map((inv, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded hover:bg-white shadow-sm cursor-pointer transition-colors">
                <div>
                  <div className="text-sm font-bold text-slate-800">{inv.id}</div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase">{inv.status}</div>
                </div>
                <div className="text-base font-black text-slate-700">{inv.amount}</div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Sites & Clinics</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage connected hospitals and diagnostic centers</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex p-1 bg-slate-50 rounded-lg border border-slate-100 shadow-inner">
            {['All', 'Prepaid', 'Postpaid'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-1.5 text-sm font-bold transition-all rounded-md ${
                  activeTab === tab 
                    ? 'bg-white text-[#0D2461] shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input 
              placeholder="Search sites or IDs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-[260px] h-10 text-sm bg-slate-50 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] transition-all shadow-inner"
            />
          </div>
          <Button onClick={() => { setEditingSiteId(null); setIsEditModalOpen(true); }} className="bg-[#0D2461] hover:bg-[#081840] text-white h-10 px-5 text-sm font-bold rounded-xl shadow-md shadow-blue-900/10">
            <PlusCircle className="w-4 h-4 mr-2" /> Add New Site
          </Button>
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">Site Profile</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase text-center w-24">Status</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Modalities</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Access & Contact</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">Command Hub</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCentres.map((centre, idx) => {
              const showPassword = showPasswords[centre.id] || false;
              const defaultPassword = centre.name.split(' ')[0] + '@123';
              
              return (
              <TableRow key={centre.id || idx} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-100 group">
                
                {/* 1. Site Profile */}
                <TableCell className="py-4 px-6 align-top">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D2461] to-[#00A8CC] flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                      {centre.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-[#0D2461] transition-colors">{centre.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded tracking-widest uppercase">{centre.siteNumber.replace('S-', 'ID-')}</span>
                        <div className="flex items-center text-[11px] text-slate-500 font-medium">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {centre.address || 'Mysore Region'}
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* 2. Status */}
                <TableCell className="py-4 px-4 text-center align-top">
                  <label className="relative inline-flex items-center justify-center cursor-pointer mt-1">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={centre.status === 'Active'}
                      onChange={() => handleToggleStatus(centre.id, centre.status)}
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00A8CC] shadow-inner"></div>
                  </label>
                  <div className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${centre.status === 'Active' ? 'text-[#00A8CC]' : 'text-slate-400'}`}>
                    {centre.status}
                  </div>
                </TableCell>

                {/* 3. Modalities */}
                <TableCell className="py-4 px-4 align-top">
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {centre.serviceTypes.map(mod => (
                      <span key={mod} className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm
                        ${mod === 'X-Ray' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                          mod === 'CT' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {mod}
                      </span>
                    ))}
                  </div>
                </TableCell>

                {/* 4. Access & Contact */}
                <TableCell className="py-4 px-4 align-top">
                  <div className="grid grid-cols-[1fr_1.5fr] gap-4">
                    {/* Access */}
                    <div className="space-y-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex items-center text-[11px]">
                        <UserCheck className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span className="font-bold text-slate-700 truncate w-24">{centre.contactPerson.toLowerCase()}</span>
                      </div>
                      <div className="flex items-center text-[11px]">
                        <Lock className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span className="font-mono text-slate-600 font-bold tracking-widest bg-white px-1.5 rounded border border-slate-200 w-24 truncate">
                          {showPassword ? defaultPassword : '••••••••'}
                        </span>
                        <button onClick={() => togglePasswordVisibility(centre.id)} className="ml-1.5 text-slate-400 hover:text-[#00A8CC]">
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {/* Contact */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center text-[11px] text-slate-600 font-medium">
                        <Mail className="w-3.5 h-3.5 mr-2 text-[#00A8CC]/70" /> {centre.email}
                      </div>
                      <div className="flex items-center text-[11px] text-slate-600 font-medium">
                        <Phone className="w-3.5 h-3.5 mr-2 text-[#00A8CC]/70" /> {centre.phone || '+91 9999999999'}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* 5. Command Hub (Actions) */}
                <TableCell className="py-4 px-6 align-top">
                  <div className="flex items-center justify-end h-full mt-1.5 gap-4">
                    
                    {/* Clinical Group */}
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => openAction('Assign Radiologist', centre.name, centre.siteNumber)} className="p-1.5 rounded-md hover:bg-white text-emerald-600 hover:shadow-sm transition-all" title="Assign Radiologist"><UserCheck className="w-4 h-4" /></button>
                      <button onClick={() => openAction('Radiologist Roster', centre.name, centre.id)} className="p-1.5 rounded-md hover:bg-white text-emerald-600 hover:shadow-sm transition-all" title="Shift Roster"><List className="w-4 h-4" /></button>
                      <button onClick={() => openAction('Scheduling', centre.name, centre.id)} className="p-1.5 rounded-md hover:bg-white text-emerald-600 hover:shadow-sm transition-all" title="Scheduling"><Calendar className="w-4 h-4" /></button>
                    </div>

                    {/* Financial Group */}
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => openAction('View Charges', centre.name, centre.id)} className="p-1.5 rounded-md hover:bg-white text-[#0D2461] hover:shadow-sm transition-all" title="Pricing Sheet"><CreditCard className="w-4 h-4" /></button>
                      <button onClick={() => openAction('Transaction History', centre.name, centre.id)} className="p-1.5 rounded-md hover:bg-white text-[#0D2461] hover:shadow-sm transition-all" title="Transaction Ledger"><Clock className="w-4 h-4" /></button>
                      <button onClick={() => openAction('DICOM Information', centre.name, centre.id)} className="p-1.5 rounded-md hover:bg-white text-[#0D2461] hover:shadow-sm transition-all" title="DICOM Nodes"><Server className="w-4 h-4" /></button>
                      <button onClick={() => openAction('Invoices', centre.name, centre.id)} className="p-1.5 rounded-md hover:bg-white text-[#0D2461] hover:shadow-sm transition-all" title="Generate Invoices"><FileSpreadsheet className="w-4 h-4" /></button>
                    </div>

                    {/* Settings Group */}
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => openAction('Hide Details', centre.name, centre.id)} className="p-1.5 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 hover:shadow-sm transition-all" title="Privacy Controls"><Shield className="w-4 h-4" /></button>
                      <button onClick={() => openEditModal(centre)} className="p-1.5 rounded-md hover:bg-white text-[#00A8CC] hover:shadow-sm transition-all" title="Edit Site Config"><Settings className="w-4 h-4" /></button>
                      <button onClick={() => deleteCentre(centre.id)} className="p-1.5 rounded-md hover:bg-white text-rose-500 hover:text-rose-700 hover:shadow-sm transition-all" title="Delete Site"><Trash2 className="w-4 h-4" /></button>
                    </div>

                  </div>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>

      {/* Massive Edit Site Modal & Action Modal remain exactly identical to keep functionality intact */}
      
      {/* Dynamic Action Modal Overlay (Assign Rad, DICOM, Transaction History, etc.) */}
      {actionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center z-[100] animate-in fade-in p-4 sm:p-6 overflow-y-auto">
          <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col animate-in zoom-in-95 my-auto ${actionModal.type === 'Transaction History' ? 'max-w-[1200px]' : 'max-w-md'}`}>
            <div className={`p-4 text-white flex justify-between items-center ${actionModal.type === 'Transaction History' ? 'bg-[#0D2461]' : 'bg-[#1E293B]'}`}>
              <h2 className="text-base font-bold tracking-wide">{actionModal.title || actionModal.type} {actionModal.type !== 'Transaction History' && `- ${actionModal.siteName}`}</h2>
              <button onClick={() => setActionModal(null)} className="text-white/70 hover:text-white transition-colors bg-white/10 p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {renderActionModalContent()}
              
              {actionModal.type !== 'Transaction History' && actionModal.type !== 'View Charges' && (
                <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => setActionModal(null)} className="w-24 border-slate-200 font-bold">Cancel</Button>
                  <Button size="sm" onClick={() => setActionModal(null)} className="w-24 bg-[#0D2461] hover:bg-[#081840] text-white font-bold shadow-md">Submit</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Massive Edit Site Modal */}
      {isEditModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center z-[100] animate-in fade-in p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col my-auto">
            <div className="bg-white border-b border-slate-100 py-3 px-5 text-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black text-[#0D2461] tracking-tight">{editingSiteId ? 'Edit Site Configuration' : 'Deploy New Site'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50/50 space-y-4">
              
              {/* Basic Information */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 tracking-wide mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#00A8CC]" /> Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Institute Name <span className="text-red-500">*</span></label>
                    <Input value={newSite.name} onChange={e => setNewSite({...newSite, name: e.target.value})} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">City <span className="text-red-500">*</span></label>
                    <Input value={newSite.city} onChange={e => setNewSite({...newSite, city: e.target.value})} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                    <Input value={newSite.email} onChange={e => setNewSite({...newSite, email: e.target.value})} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mobile No</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-sm rounded-l-md font-bold">+91</span>
                      <Input value={newSite.phone} onChange={e => setNewSite({...newSite, phone: e.target.value})} className="h-8 text-xs rounded-l-none border-slate-200 bg-slate-50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Username <span className="text-red-500">*</span></label>
                    <Input value={newSite.contactPerson} onChange={e => setNewSite({...newSite, contactPerson: e.target.value})} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Input type="password" value={newSite.password} onChange={e => setNewSite({...newSite, password: e.target.value})} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 bg-slate-50 pr-9" />
                      <EyeOff className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Modality</label>
                    <select className="w-full h-8 px-3 border border-slate-200 rounded-md text-xs bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC]">
                      <option>{newSite.modality}</option>
                      <option>X-ray</option>
                      <option>CT, MRI</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Header Space</label>
                    <Input value={newSite.headerSpace} onChange={e => setNewSite({...newSite, headerSpace: e.target.value})} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] bg-slate-50 w-1/2 text-center" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 tracking-wide mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" /> Permissions & Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4 text-xs text-slate-700 font-semibold">
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" /> <span className="group-hover:text-[#00A8CC] transition-colors">Global Header</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" defaultChecked /> <span className="group-hover:text-[#00A8CC] transition-colors">Emergency</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" defaultChecked /> <span className="group-hover:text-[#00A8CC] transition-colors">Roster</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" defaultChecked /> <span className="group-hover:text-[#00A8CC] transition-colors">View Images</span></label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" /> <span className="group-hover:text-[#00A8CC] transition-colors">Delete Study</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" defaultChecked /> <span className="group-hover:text-[#00A8CC] transition-colors">Share Study</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" /> <span className="group-hover:text-[#00A8CC] transition-colors">Template</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" /> <span className="group-hover:text-[#00A8CC] transition-colors">Enable Prepaid</span></label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" /> <span className="group-hover:text-[#00A8CC] transition-colors">Header PDF Only</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" /> <span className="group-hover:text-[#00A8CC] transition-colors">Share Web Link</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" /> <span className="group-hover:text-[#00A8CC] transition-colors">Demography Sync</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" /> <span className="group-hover:text-[#00A8CC] transition-colors">Billing Access</span></label>

                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" defaultChecked /> <span className="group-hover:text-[#00A8CC] transition-colors">Tx History</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" /> <span className="group-hover:text-[#00A8CC] transition-colors">Finalize Download</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group col-span-2"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC] focus:ring-[#00A8CC]" /> <span className="group-hover:text-[#00A8CC] transition-colors">Allow Studies Without Images</span></label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reports & Communication */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 tracking-wide mb-3 flex items-center gap-2"><Mail className="w-4 h-4 text-purple-500" /> Communications</h3>
                  <div className="flex flex-col gap-2 text-xs text-slate-700 font-semibold">
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC]" /> Key Images on Final Report</label>
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC]" /> Auto-dispatch Email Reports</label>
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00A8CC]" /> Append QR Code in PDF</label>
                  </div>
                </div>

                {/* File Uploads */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 tracking-wide mb-3 flex items-center gap-2"><Upload className="w-4 h-4 text-orange-500" /> Print Collaterals</h3>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-[#00A8CC]/5 hover:border-[#00A8CC]/30 transition-all cursor-pointer w-28 group">
                      <Upload className="w-5 h-5 text-slate-400 mb-1.5 group-hover:text-[#00A8CC] transition-colors" />
                      <span className="text-[10px] font-bold text-slate-600 group-hover:text-[#00A8CC]">Letterhead</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-[#00A8CC]/5 hover:border-[#00A8CC]/30 transition-all cursor-pointer w-28 group">
                      <Upload className="w-5 h-5 text-slate-400 mb-1.5 group-hover:text-[#00A8CC] transition-colors" />
                      <span className="text-[10px] font-bold text-slate-600 group-hover:text-[#00A8CC]">Footer Logo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-[#00A8CC]" /> 
                    <span className="text-xs font-bold text-slate-700">Attach Brochure to New Studies</span>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="bg-white py-3 px-5 border-t border-slate-100 flex justify-end gap-4 shrink-0 shadow-sm">
              <Button type="button" variant="outline" onClick={closeModal} className="w-32 border-slate-200 font-bold hover:bg-slate-50">Cancel</Button>
              <Button type="submit" onClick={handleCreateSubmit} className="w-40 bg-[#00A8CC] hover:bg-[#008ba8] text-white font-bold shadow-md shadow-[#00A8CC]/20">Save Configuration</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Delete Site"
        message="Are you sure you want to permanently delete this site? This action cannot be undone."
        itemName={hospitals.find(h => h.id === deletingId)?.name}
      />
    </div>
  );
}
