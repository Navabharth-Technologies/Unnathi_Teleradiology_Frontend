import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMockDb } from '../../store/useMockDb';
import type { User, Role } from '../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';
import { PlusCircle, Search, Eye, Settings, Shield, Mail, Phone, MapPin, Key, X, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';

const ALL_ROLES = ['Super Admin', 'Site Admin', 'Hospital Admin', 'Manager', 'Staff', 'Accountant', 'Radiologist', 'Verifier'] as const;

type UserForm = { name: string; email: string; phone: string; role: string; hospitalId?: string; siteId?: string; status: 'Active' | 'Inactive'; };
const EMPTY: UserForm = { name: '', email: '', phone: '', role: 'Staff', status: 'Active' };

export default function UsersList() {
  const { users, sites, hospitals, addUser, updateUser, deleteUser, addRadiologist } = useMockDb();
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewItem, setViewItem] = useState<User | null>(null);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [resetItem, setResetItem] = useState<User | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<UserForm>(EMPTY);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Determine allowed roles for dropdown
  const allowedRoles = currentUser?.role === 'SUPER_ADMIN'
    ? ['Super Admin', 'Site Admin', 'Hospital Admin', 'Radiologist']
    : ALL_ROLES.filter(r => !['Super Admin', 'Site Admin'].includes(r));

  // Determine allowed hospitals
  const allowedHospitals = currentUser?.role === 'SUPER_ADMIN'
    ? hospitals
    : currentUser?.role === 'SITE_ADMIN'
      ? hospitals.filter(h => h.parentSiteId === currentUser.siteId)
      : hospitals.filter(h => h.id === currentUser?.hospitalId);

  // Filter users based on logged-in role
  const visibleUsers = users.filter(u => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      // Hide users explicitly attached to an independent hospital
      const isIndependent = u.hospitalId && hospitals.find(h => h.id === u.hospitalId)?.organizationType === 'UNNATHI_MANAGED';
      if (isIndependent) return false;
      
      // Super admin only sees roles they create/manage (top level admins and global roles)
      return ['SUPER_ADMIN', 'SITE_ADMIN', 'HOSPITAL_ADMIN', 'RADIOLOGIST'].includes(u.role);
    }
    if (currentUser?.role === 'SITE_ADMIN') {
      return allowedHospitals.some(h => h.id === u.hospitalId) || u.siteId === currentUser.siteId;
    }
    // Any hospital-specific role (HOSPITAL_ADMIN, MANAGER) should only see users inside their hospital
    if (currentUser?.hospitalId) {
      return u.hospitalId === currentUser.hospitalId;
    }
    return false;
  });

  const filtered = visibleUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLocation = (u: User) => {
    if (u.hospitalId) return hospitals.find(h => h.id === u.hospitalId)?.name || '';
    if (u.siteId) return sites.find(c => c.id === u.siteId)?.name || '';
    return 'Global Access';
  };

  const openAdd = () => { 
    setForm({ 
      name: '', email: '', phone: '', role: 'STAFF', status: 'Active',
      hospitalId: currentUser?.role === 'HOSPITAL_ADMIN' ? currentUser.hospitalId || undefined : undefined,
      siteId: undefined
    }); 
    setAdding(true); 
  };
  const openEdit = (u: User) => {
    setForm({ name: u.name, email: u.email, phone: u.phone, role: u.role, status: u.status, hospitalId: u.hospitalId || undefined, siteId: u.siteId || undefined });
    setEditItem(u);
  };

  const handleSave = () => {
    if (adding) {
      const newUserId = "u" + Date.now();
      const normalizedRole = form.role.toUpperCase().replace(" ", "_") as Role;
      
      const payload: any = { ...form, role: normalizedRole, id: newUserId };
      if (!payload.hospitalId && !payload.siteId && currentUser?.role === "SITE_ADMIN") {
        payload.siteId = currentUser?.siteId;
      }
      
      addUser(payload as User);
      
      // If the created user is a Radiologist, auto-create their radiologist profile
      if (form.role === "RADIOLOGIST" || form.role === "Radiologist") {
        addRadiologist({
          id: "rad" + Date.now(),
          userId: newUserId,
          name: form.name,
          registrationId: "REG-" + Math.floor(1000 + Math.random() * 9000),
          specialization: "General Radiology",
          availability: "Available",
          assignedHospitals: [],
          siteId: currentUser?.siteId || null,
          status: "Active"
        });
      }
      
      setAdding(false);
    } else if (editItem) {
      const normalizedRole = form.role.toUpperCase().replace(" ", "_") as Role;
      updateUser(editItem.id, { ...form, role: normalizedRole } as Partial<User>);
      setEditItem(null);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    updateUser(id, { status: currentStatus === "Active" ? "Inactive" : "Active" });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteUser(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">User Management</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage system access, roles, and privileges</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input 
              placeholder="Search users or roles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-[260px] h-10 text-sm bg-slate-50 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] transition-all shadow-inner"
            />
          </div>
          <Button onClick={openAdd} className="bg-[#0D2461] hover:bg-[#081840] text-white h-10 px-5 text-sm font-bold rounded-xl shadow-md shadow-blue-900/10">
            <PlusCircle className="w-4 h-4 mr-2" /> Add New User
          </Button>
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">User Profile</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase text-center w-24">Status</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Role & Access</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Contact</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">Command Hub</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-100 group">
                
                {/* 1. User Profile */}
                <TableCell className="py-4 px-6 align-top w-1/4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D2461] to-[#00A8CC] flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-[#0D2461] transition-colors">{user.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded tracking-widest uppercase">UID: {user.id.toUpperCase()}</span>
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
                      checked={user.status === "Active"}
                      onChange={() => handleToggleStatus(user.id, user.status)}
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00A8CC] shadow-inner"></div>
                  </label>
                  <div className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${user.status === 'Active' ? 'text-[#00A8CC]' : 'text-slate-400'}`}>
                    {user.status}
                  </div>
                </TableCell>

                {/* 3. Role & Access */}
                <TableCell className="py-4 px-4 align-top w-1/4">
                  <div className="space-y-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm inline-flex items-center
                      ${user.role === 'Super Admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 
                        user.role === 'Manager' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                        'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      <Shield className="w-3 h-3 mr-1.5 opacity-70" />
                      {user.role}
                    </span>
                    <div className="flex items-center text-[11px] text-slate-500 font-medium mt-1">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {getLocation(user)}
                    </div>
                  </div>
                </TableCell>

                {/* 4. Contact */}
                <TableCell className="py-4 px-4 align-top">
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center text-[11px] text-slate-600 font-medium">
                      <Mail className="w-3.5 h-3.5 mr-2 text-[#00A8CC]/70" /> {user.email}
                    </div>
                    <div className="flex items-center text-[11px] text-slate-600 font-medium">
                      <Phone className="w-3.5 h-3.5 mr-2 text-[#00A8CC]/70" /> {user.phone || 'N/A'}
                    </div>
                  </div>
                </TableCell>

                {/* 5. Command Hub (Actions) */}
                <TableCell className="py-4 px-6 align-top">
                  <div className="flex items-center justify-end h-full mt-1.5 gap-4">
                    
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => setViewItem(user)} className="p-1.5 rounded-md hover:bg-white text-emerald-600 hover:shadow-sm transition-all" title="View Profile"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setResetItem(user)} className="p-1.5 rounded-md hover:bg-white text-amber-600 hover:shadow-sm transition-all" title="Reset Password"><Key className="w-4 h-4" /></button>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-md hover:bg-white text-[#00A8CC] hover:shadow-sm transition-all" title="Edit Configuration"><Settings className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-md hover:bg-white text-rose-600 hover:shadow-sm transition-all" title="Delete User"><Trash2 className="w-4 h-4" /></button>
                    </div>

                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-500 text-sm font-medium">No users found matching your search.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Custom Add/Edit Dialog */}
      {adding || editItem ? createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center z-[100] animate-in fade-in p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="bg-white border-b border-slate-100 p-5 text-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black text-[#0D2461] tracking-tight">{adding ? 'Register New User' : 'Edit User Configuration'}</h2>
              <button onClick={() => { setAdding(false); setEditItem(null); }} className="text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 gap-6">
                {(['name', 'email', 'phone'] as const).map(key => (
                  <div key={key} className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{key}</label>
                    <Input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="h-9 text-sm border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 bg-slate-50" />
                  </div>
                ))}
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <Input type="password" placeholder="Set password" defaultValue="password123" className="h-9 text-sm border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 bg-slate-50" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role <span className="text-red-500">*</span></label>
                  <select className="w-full h-9 px-3 border border-slate-200 rounded-md text-sm bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC]" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {allowedRoles.map(r => <option key={r} value={r.toUpperCase().replace(" ", "_")}>{r}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Organization Assignment</label>
                  <select 
                    className="w-full h-9 px-3 border border-slate-200 rounded-md text-sm bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] disabled:opacity-50 disabled:bg-slate-100" 
                    value={form.siteId ? "SITE_" + form.siteId : form.hospitalId ? "HOSP_" + form.hospitalId : ''} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val.startsWith("SITE_")) {
                        setForm(f => ({ ...f, siteId: val.replace("SITE_", ""), hospitalId: undefined }));
                      } else if (val.startsWith("HOSP_")) {
                        setForm(f => ({ ...f, hospitalId: val.replace("HOSP_", ""), siteId: undefined }));
                      } else {
                        setForm(f => ({ ...f, hospitalId: undefined, siteId: undefined }));
                      }
                    }}
                    disabled={currentUser?.role === 'HOSPITAL_ADMIN'}
                  >
                    {currentUser?.role !== 'HOSPITAL_ADMIN' && <option value="">-- Select Assignment --</option>}
                    {currentUser?.role === 'SUPER_ADMIN' && sites.map(s => <option key={`site-${s.id}`} value={`SITE_${s.id}`}>🏢 Site: {s.name}</option>)}
                    {currentUser?.role === 'SITE_ADMIN' && <option value={`SITE_${currentUser.siteId}`}>🏢 Site: {sites.find(s=>s.id === currentUser.siteId)?.name}</option>}
                    {currentUser?.role === 'HOSPITAL_ADMIN' && <option value={`HOSP_${currentUser.hospitalId}`}>🏥 Hospital: {hospitals.find(h => h.id === currentUser.hospitalId)?.name || 'My Hospital'}</option>}
                    {currentUser?.role !== 'HOSPITAL_ADMIN' && currentUser?.role !== 'SITE_ADMIN' && allowedHospitals.map(b => <option key={`hosp-${b.id}`} value={`HOSP_${b.id}`}>🏥 Hospital: {b.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Account Status</label>
                  <select className="w-full h-9 px-3 border border-slate-200 rounded-md text-sm bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC]" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'Active' | 'Inactive' }))}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 border-t border-slate-100 flex justify-end gap-4 shrink-0 shadow-sm">
              <Button type="button" variant="outline" onClick={() => { setAdding(false); setEditItem(null); }} className="w-32 border-slate-200 font-bold hover:bg-slate-50">Cancel</Button>
              <Button type="submit" onClick={handleSave} className="w-40 bg-[#00A8CC] hover:bg-[#008ba8] text-white font-bold shadow-md shadow-[#00A8CC]/20">{adding ? 'Register User' : 'Save Changes'}</Button>
            </div>
          </div>
        </div>
      , document.body) : null}

      {/* Custom View Dialog */}
      {viewItem ? createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="bg-[#0D2461] p-5 text-white flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black tracking-wide">User Profile</h2>
              <button onClick={() => setViewItem(null)} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50 space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0D2461] to-[#00A8CC] flex items-center justify-center text-white font-black text-3xl shadow-lg uppercase">
                  {viewItem.name.charAt(0)}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3 text-sm">
                {[['Name', viewItem.name], ['Email', viewItem.email], ['Phone', viewItem.phone], ['Role', viewItem.role], ['Location', getLocation(viewItem)], ['Status', viewItem.status]].map(([k, v]) => (
                  <div key={k} className="flex border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <span className="w-32 font-bold text-slate-400 uppercase text-[10px] tracking-wider pt-1">{k}</span>
                    <span className="font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setViewItem(null)} className="font-bold border-slate-200">Close</Button>
              <Button onClick={() => { openEdit(viewItem!); setViewItem(null); }} className="bg-[#00A8CC] text-white font-bold hover:bg-[#008ba8]">Edit User</Button>
            </div>
          </div>
        </div>
      , document.body) : null}

      {/* Password Reset Dialog */}
      {resetItem ? createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="bg-amber-500 p-5 text-white flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black tracking-wide flex items-center"><Key className="w-5 h-5 mr-2" /> Reset Password</h2>
              <button onClick={() => setResetItem(null)} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50 text-center space-y-4">
              <p className="text-sm text-slate-600 font-medium">Are you sure you want to reset the password for <strong>{resetItem.name}</strong>?</p>
              <p className="text-xs text-slate-500">A password reset link will be sent to <strong>{resetItem.email}</strong>.</p>
            </div>
            <div className="bg-white p-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setResetItem(null)} className="font-bold border-slate-200">Cancel</Button>
              <Button onClick={() => setResetItem(null)} className="bg-amber-500 text-white font-bold hover:bg-amber-600">Send Reset Link</Button>
            </div>
          </div>
        </div>
      , document.body) : null}

      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        itemName={users.find(u => u.id === deletingId)?.name}
      />
    </div>
  );
}
