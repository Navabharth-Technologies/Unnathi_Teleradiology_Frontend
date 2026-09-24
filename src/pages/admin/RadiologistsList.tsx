import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import type { Radiologist } from '../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';
import { PlusCircle, Search, Eye, Settings, Stethoscope, MapPin, Activity, X, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';

type RadForm = Omit<Radiologist, 'id' | 'userId'> & { email?: string; password?: string };
const EMPTY: RadForm = { name: '', email: '', password: '', registrationId: '', qualification: '', specialization: '', availability: 'Available', assignedHospitals: [], status: 'Active' };

export default function RadiologistsList() {
  const { user } = useAuthStore();
  const { radiologists, hospitals, users, addUser, updateUser, addRadiologist, updateRadiologist, deleteRadiologist } = useMockDb();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewItem, setViewItem] = useState<Radiologist | null>(null);
  const [editItem, setEditItem] = useState<Radiologist | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<RadForm>(EMPTY);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = radiologists.filter(r => {
    const relatedUser = users.find(u => u.id === r.userId);
    const isIndependentRad = (r.assignedHospitals && r.assignedHospitals.some(hid => hospitals.find(h => h.id === hid)?.organizationType === 'UNNATHI_MANAGED')) || 
                             (relatedUser?.hospitalId && hospitals.find(h => h.id === relatedUser.hospitalId)?.organizationType === 'UNNATHI_MANAGED');
    
    // Scoping rules
    if (user?.hospitalId && !r.assignedHospitals?.includes(user.hospitalId)) return false;
    if (user?.role === 'SITE_ADMIN' && isIndependentRad) return false;
    if (user?.role === 'SUPER_ADMIN' && isIndependentRad) return false;

    // Search rules
    return (r.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
           (r.registrationId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
           (r.specialization?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  });

  const getCentreNames = (ids?: string[]) =>
    (ids || []).map(id => hospitals.find(h => h.id === id)?.name).filter(Boolean);

  const openAdd = () => { setForm(EMPTY); setAdding(true); };
  const openEdit = (r: Radiologist) => {
    const relatedUser = users.find(u => u.id === r.userId);
    setForm({ 
      name: r.name, 
      registrationId: r.registrationId, 
      qualification: r.qualification || '', 
      specialization: r.specialization, 
      availability: r.availability, 
      assignedHospitals: r.assignedHospitals || [], 
      status: r.status,
      email: relatedUser?.email || '',
      password: '' // Don't pre-fill password for security/mock db reasons, let them type to update
    });
    setEditItem(r);
  };

  const handleSave = () => {
    if (adding) {
      const newUserId = 'u' + Date.now();
      if (form.email && form.password) {
        addUser({
          id: newUserId,
          name: form.name,
          email: form.email,
          phone: '',
          role: 'RADIOLOGIST',
          siteId: user?.siteId || null,
          hospitalId: user?.hospitalId || null,
          status: 'Active',
          createdAt: new Date().toISOString()
        });
      }
      addRadiologist({ 
        name: form.name,
        registrationId: form.registrationId,
        qualification: form.qualification,
        specialization: form.specialization,
        availability: form.availability,
        assignedHospitals: form.assignedHospitals,
        status: form.status,
        id: 'r' + Date.now(), 
        userId: newUserId, 
        siteId: user?.siteId || null 
      }); 
      setAdding(false); 
    }
    else if (editItem) { 
      // Update User if email/password is provided
      const relatedUser = users.find(u => u.id === editItem.userId);
      if (relatedUser) {
        updateUser(relatedUser.id, {
          name: form.name,
          email: form.email || relatedUser.email,
        });
      }
      
      updateRadiologist(editItem.id, {
        name: form.name,
        registrationId: form.registrationId,
        qualification: form.qualification,
        specialization: form.specialization,
        availability: form.availability,
        assignedHospitals: form.assignedHospitals,
        status: form.status,
      }); 
      setEditItem(null); 
    }
  };

  const toggleCentre = (id: string) => {
    setForm(f => ({ ...f, assignedHospitals: f.assignedHospitals.includes(id) ? f.assignedHospitals.filter(x => x !== id) : [...f.assignedHospitals, id] }));
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    updateRadiologist(id, { status: currentStatus === 'Active' ? 'Inactive' : 'Active' });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteRadiologist(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Radiologist Roster</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage reporting doctors and assignments</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input 
              placeholder="Search doctors, ID or specialization..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-[300px] h-10 text-sm bg-slate-50 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] transition-all shadow-inner"
            />
          </div>
          <Button onClick={openAdd} className="bg-[#0D2461] hover:bg-[#081840] text-white h-10 px-5 text-sm font-bold rounded-xl shadow-md shadow-blue-900/10">
            <PlusCircle className="w-4 h-4 mr-2" /> Add Radiologist
          </Button>
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">Radiologist Profile</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase text-center w-24">Status</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Clinical Details</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Assigned Sites</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">Command Hub</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((rad) => (
              <TableRow key={rad.id} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-100 group">
                
                {/* 1. Profile */}
                <TableCell className="py-4 px-6 align-top w-1/4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D2461] to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 uppercase">
                      {rad.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-[#0D2461] transition-colors">{rad.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded tracking-widest uppercase">REG: {rad.registrationId}</span>
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
                      checked={rad.status === 'Active'}
                      onChange={() => handleToggleStatus(rad.id, rad.status)}
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500 shadow-inner"></div>
                  </label>
                  <div className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${rad.status === 'Active' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {rad.status}
                  </div>
                </TableCell>

                {/* 3. Clinical Details */}
                <TableCell className="py-4 px-4 align-top w-1/4">
                  <div className="space-y-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm inline-flex items-center bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                      <Stethoscope className="w-3 h-3 mr-1.5 opacity-70" />
                      {rad.specialization}
                    </span>
                    <div className="flex items-center text-[11px] font-bold mt-1">
                      {rad.availability === 'Available' ? (
                        <span className="text-emerald-600 flex items-center"><Activity className="w-3 h-3 mr-1" /> Available for reporting</span>
                      ) : (
                        <span className="text-amber-500 flex items-center"><Activity className="w-3 h-3 mr-1" /> {rad.availability}</span>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* 4. Assigned Sites */}
                <TableCell className="py-4 px-4 align-top">
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {getCentreNames(rad.assignedHospitals || []).length > 0 ? (
                      getCentreNames(rad.assignedHospitals || []).slice(0, 3).map((siteName, idx) => (
                        <span key={idx} className="flex items-center px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 shadow-sm">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {siteName}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium italic">No sites assigned</span>
                    )}
                    {getCentreNames(rad.assignedHospitals || []).length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500 shadow-sm">
                        +{getCentreNames(rad.assignedHospitals || []).length - 3} more
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 5. Command Hub (Actions) */}
                <TableCell className="py-4 px-6 align-top">
                  <div className="flex items-center justify-end h-full mt-1.5 gap-4">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => setViewItem(rad)} className="p-1.5 rounded-md hover:bg-white text-indigo-600 hover:shadow-sm transition-all" title="View Profile"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(rad)} className="p-1.5 rounded-md hover:bg-white text-[#00A8CC] hover:shadow-sm transition-all" title="Edit Configuration"><Settings className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(rad.id)} className="p-1.5 rounded-md hover:bg-white text-red-500 hover:shadow-sm transition-all" title="Delete Radiologist"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-500 text-sm font-medium">No radiologists found matching your search.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Massive Edit / Add Dialog */}
      {(adding || editItem) && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center z-[100] animate-in fade-in p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95">
            <div className="bg-white border-b border-slate-100 py-3 px-5 text-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black text-[#0D2461] tracking-tight">{adding ? 'Onboard Radiologist' : 'Edit Radiologist Details'}</h2>
              <button onClick={() => { setAdding(false); setEditItem(null); }} className="text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
                {(['name', 'registrationId', 'qualification', 'specialization'] as const).map(key => (
                  <div key={key} className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <Input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 bg-slate-50" />
                  </div>
                ))}
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email (Login ID)</label>
                  <Input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="doctor@example.com" className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{adding ? 'Password' : 'New Password (Optional)'}</label>
                  <Input type="password" value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 bg-slate-50" />
                </div>

                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Availability</label>
                  <select className="w-full h-8 px-3 border border-slate-200 rounded-md text-xs bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC]" value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value as any }))}>
                    <option>Available</option>
                    <option>On Leave</option>
                    <option>Busy</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00A8CC]" /> Site Assignments
                </label>
                <div className="flex flex-wrap gap-2">
                  {hospitals.map(c => {
                    const isSelected = form.assignedHospitals.includes(c.id);
                    return (
                      <button 
                        key={c.id} 
                        type="button" 
                        onClick={() => toggleCentre(c.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm border ${
                          isSelected 
                            ? 'bg-[#0D2461] text-white border-[#0D2461] ring-2 ring-[#0D2461]/20' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-[#00A8CC] hover:text-[#00A8CC]'
                        }`}
                      >
                        {c.name}
                      </button>
                    )
                  })}
                  {hospitals.length === 0 && <span className="text-sm text-slate-400">No hospitals available to assign.</span>}
                </div>
              </div>
            </div>

            <div className="bg-white py-3 px-5 border-t border-slate-100 flex justify-end gap-4 shrink-0 shadow-sm">
              <Button type="button" variant="outline" onClick={() => { setAdding(false); setEditItem(null); }} className="w-32 border-slate-200 font-bold hover:bg-slate-50">Cancel</Button>
              <Button type="submit" onClick={handleSave} className="w-40 bg-[#0D2461] hover:bg-[#081840] text-white font-bold shadow-md shadow-[#0D2461]/20">{adding ? 'Onboard Doctor' : 'Save Details'}</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom View Dialog */}
      {viewItem && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center z-[100] animate-in fade-in p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col my-auto animate-in zoom-in-95">
            <div className="bg-indigo-600 p-5 text-white flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black tracking-wide">Doctor Profile</h2>
              <button onClick={() => setViewItem(null)} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50 space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-800 flex items-center justify-center text-white font-black text-3xl shadow-lg uppercase">
                  {viewItem.name.replace('Dr. ', '').charAt(0)}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3 text-sm">
                {[['Name', viewItem.name], ['Registration ID', viewItem.registrationId], ['Specialization', viewItem.specialization], ['Availability', viewItem.availability], ['Status', viewItem.status]].map(([k, v]) => (
                  <div key={k} className="flex border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <span className="w-32 font-bold text-slate-400 uppercase text-[10px] tracking-wider pt-1">{k}</span>
                    <span className="font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">Assigned Hospitals</span>
                <div className="flex flex-wrap gap-2">
                  {getCentreNames(viewItem.assignedHospitals).map((name, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600">
                      {name}
                    </span>
                  ))}
                  {(viewItem.assignedHospitals?.length || 0) === 0 && <span className="text-xs text-slate-400 font-medium">None assigned</span>}
                </div>
              </div>
            </div>
            <div className="bg-white p-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setViewItem(null)} className="font-bold border-slate-200">Close</Button>
              <Button onClick={() => { openEdit(viewItem!); setViewItem(null); }} className="bg-indigo-600 text-white font-bold hover:bg-indigo-700">Edit Details</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Delete Radiologist"
        message="Are you sure you want to delete this radiologist? This action cannot be undone."
        itemName={radiologists.find(r => r.id === deletingId)?.name}
      />
    </div>
  );
}
