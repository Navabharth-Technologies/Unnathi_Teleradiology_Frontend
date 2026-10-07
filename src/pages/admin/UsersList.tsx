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
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ALL_ROLES = ['Super Admin', 'Site Admin', 'Hospital Admin', 'Manager', 'Staff', 'Accountant', 'Radiologist', 'Verifier'] as const;

type UserForm = { name: string; email: string; phone: string; role: string; hospitalId?: string; siteId?: string; status: 'Active' | 'Inactive'; };
const EMPTY: UserForm = { name: '', email: '', phone: '', role: 'Staff', status: 'Active' };

export default function UsersList() {
  const { users, sites, hospitals, customRoles, addUser, updateUser, deleteUser, addRadiologist } = useMockDb();
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewItem, setViewItem] = useState<User | null>(null);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [resetItem, setResetItem] = useState<User | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<UserForm>(EMPTY);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const baseAllowedRoles = currentUser?.role === 'SUPER_ADMIN'
    ? ['Super Admin', 'Site Admin', 'Hospital Admin', 'Radiologist']
    : ALL_ROLES.filter(r => !['Super Admin', 'Site Admin'].includes(r));
    
  // Add active custom roles to the dropdown
  const activeCustomRoles = (customRoles || []).filter(r => r.status === 'Active').map(r => r.name);
  const allowedRoles = [...baseAllowedRoles, ...activeCustomRoles];

  const allowedHospitals = currentUser?.role === 'SUPER_ADMIN'
    ? hospitals
    : currentUser?.role === 'SITE_ADMIN'
      ? hospitals.filter(h => h.parentSiteId === currentUser.siteId)
      : hospitals.filter(h => h.id === currentUser?.hospitalId);

  const visibleUsers = users.filter(u => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      const isIndependent = u.hospitalId && hospitals.find(h => h.id === u.hospitalId)?.organizationType === 'UNNATHI_MANAGED';
      if (isIndependent) return false;
      return ['SUPER_ADMIN', 'SITE_ADMIN', 'HOSPITAL_ADMIN', 'RADIOLOGIST'].includes(u.role);
    }
    if (currentUser?.role === 'SITE_ADMIN') {
      return allowedHospitals.some(h => h.id === u.hospitalId) || u.siteId === currentUser.siteId;
    }
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
      
      if (form.role === "RADIOLOGIST" || form.role === "Radiologist") {
        addRadiologist({
          id: "rad" + Date.now(),
          userId: newUserId,
          name: form.name,
          registrationId: "REG-" + Math.floor(1000 + Math.random() * 9000),
          qualification: "MD/DNB",
          subspecialties: [],
          modalities: ["CT", "MRI", "X-Ray"],
          allowedOrganizations: [],
          allowedCentres: [],
          signatureUrl: "placeholder_signature",
          stampText: "Consultant Radiologist",
          availability: "Online",
          maxConcurrentCases: 10,
          tatEligibility: "Routine",
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

  const handleDelete = (id: string) => setDeletingId(id);
  const confirmDelete = () => { if (deletingId) { deleteUser(deletingId); setDeletingId(null); } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#10263D] tracking-tight font-heading">User Management</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Manage system access, roles, and privileges</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users or roles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[260px]"
            />
          </div>
          <Button onClick={openAdd}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F8FAFC] border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">User Profile</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Role & Access</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Contact</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group">
                  <TableCell className="py-5 px-4 align-top">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0 uppercase shadow-blue-500/20">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-[#10263D] text-sm group-hover:text-blue-600 transition-colors">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">UID: {user.id.toUpperCase()}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-5 px-4 text-center align-top">
                    <div className="flex flex-col items-center gap-1.5">
                      <label className="relative inline-flex items-center cursor-pointer hover:scale-105 transition-transform">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={user.status === "Active"}
                          onChange={() => handleToggleStatus(user.id, user.status)}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-500 shadow-inner"></div>
                      </label>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {user.status}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-5 px-4 align-top">
                    <div className="space-y-2">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        <Shield className="w-3 h-3 mr-1.5 text-blue-500" />
                        {user.role.replace("_", " ")}
                      </div>
                      <div className="flex items-center text-[11px] font-semibold text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 mr-1.5 text-slate-400" />
                        {getLocation(user)}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-5 px-4 align-top">
                    <div className="space-y-2">
                      <div className="flex items-center text-xs font-semibold text-slate-600">
                        <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-xs font-semibold text-slate-600">
                        <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-5 px-4 align-top text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setViewItem(user)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors" onClick={() => openEdit(user)}>
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" onClick={() => setResetItem(user)}>
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* View Modal */}
      {viewItem && createPortal(
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card w-full max-w-md rounded-lg shadow-level-3 border border-border">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30 rounded-t-lg">
              <h2 className="text-lg font-semibold text-primary">User Details</h2>
              <button onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xl">
                  {viewItem.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{viewItem.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewItem.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <p className="text-sm font-medium">{viewItem.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm font-medium">{viewItem.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Location Access</label>
                  <p className="text-sm font-medium">{getLocation(viewItem)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <p className={`text-sm font-medium ${viewItem.status === 'Active' ? 'text-success' : 'text-muted-foreground'}`}>
                    {viewItem.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit / Add Modal */}
      {(adding || editItem) && createPortal(
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card w-full max-w-md rounded-lg shadow-level-3 border border-border flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30 rounded-t-lg">
              <h2 className="text-lg font-semibold text-primary">{adding ? 'Add New User' : 'Edit User Settings'}</h2>
              <button onClick={() => { setAdding(false); setEditItem(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Dr. Rajesh Kumar" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="e.g. doctor@hospital.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Role</label>
                  <select 
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm font-medium outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
                    value={form.role.charAt(0).toUpperCase() + form.role.slice(1).toLowerCase().replace('_', ' ')} 
                    onChange={e => setForm({...form, role: e.target.value})}
                  >
                    {allowedRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Organization Access</label>
                <select 
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm font-medium outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
                  value={form.hospitalId || 'GLOBAL'} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'GLOBAL') {
                      setForm({...form, hospitalId: undefined, siteId: undefined});
                    } else {
                      setForm({...form, hospitalId: val, siteId: undefined});
                    }
                  }}
                  disabled={currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'SITE_ADMIN'}
                >
                  {currentUser?.role === 'SUPER_ADMIN' && <option value="GLOBAL">Global Access</option>}
                  {allowedHospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/30 rounded-b-lg">
              <Button variant="outline" onClick={() => { setAdding(false); setEditItem(null); }}>Cancel</Button>
              <Button onClick={handleSave}>{adding ? 'Create User' : 'Save Changes'}</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Password Reset Modal */}
      {resetItem && createPortal(
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card w-full max-w-sm rounded-lg shadow-level-3 border border-border">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30 rounded-t-lg">
              <h2 className="text-lg font-semibold text-primary">Reset Password</h2>
              <button onClick={() => setResetItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-foreground mb-4">A password reset link will be sent to <strong>{resetItem.email}</strong>. The user will be required to set a new password on their next login.</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setResetItem(null)}>Cancel</Button>
                <Button onClick={() => setResetItem(null)}>Send Reset Link</Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDeleteModal 
        isOpen={!!deletingId}
        title="Delete User"
        description="Are you sure you want to remove this user from the system? This action cannot be undone and will revoke all access immediately."
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </motion.div>
  );
}
