import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMockDb } from '../../store/useMockDb';
import type { Branch } from '../../types';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { PlusCircle, Search, Eye, Settings, MapPin, X, Building2 } from 'lucide-react';

const EMPTY: Omit<Branch, 'id' | 'createdAt'> = {
  name: '', code: '', contactPerson: '', phone: '', email: '', address: '', status: 'Active',
};

export default function BranchesList() {
  const { branches, addBranch, updateBranch } = useMockDb();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewItem, setViewItem] = useState<Branch | null>(null);
  const [editItem, setEditItem] = useState<Branch | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<Branch, 'id' | 'createdAt'>>(EMPTY);

  const filtered = branches.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setAdding(true); };
  const openEdit = (b: Branch) => { setForm({ name: b.name, code: b.code, contactPerson: b.contactPerson, phone: b.phone, email: b.email, address: b.address, status: b.status }); setEditItem(b); };

  const handleSave = () => {
    if (adding) {
      addBranch({ ...form, id: 'b' + Date.now(), createdAt: new Date().toISOString() });
      setAdding(false);
    } else if (editItem) {
      updateBranch(editItem.id, form);
      setEditItem(null);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    updateBranch(id, { status: currentStatus === 'Active' ? 'Inactive' : 'Active' });
  };

  const closeModal = () => {
    setAdding(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Branches Management</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage organizational branches and regional hospitals</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input 
              placeholder="Search branches..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-[300px] h-10 text-sm bg-slate-50 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] transition-all shadow-inner"
            />
          </div>
          <Button onClick={openAdd} className="bg-[#0D2461] hover:bg-[#081840] text-white h-10 px-5 text-sm font-bold rounded-xl shadow-md shadow-blue-900/10">
            <PlusCircle className="w-4 h-4 mr-2" /> Add Branch
          </Button>
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">Branch Info</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase text-center w-24">Status</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Location & Contact</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">Command Hub</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(branch => (
              <TableRow key={branch.id} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-100 group">
                
                {/* 1. Branch Info */}
                <TableCell className="py-4 px-6 align-top w-1/3">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D2461] to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 uppercase">
                      {branch.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-[#0D2461] transition-colors">{branch.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded tracking-widest uppercase">CODE: {branch.code}</span>
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
                      checked={branch.status === 'Active'}
                      onChange={() => handleToggleStatus(branch.id, branch.status)}
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500 shadow-inner"></div>
                  </label>
                  <div className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${branch.status === 'Active' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {branch.status}
                  </div>
                </TableCell>

                {/* 3. Location & Contact */}
                <TableCell className="py-4 px-4 align-top w-1/3">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center bg-slate-50 px-2 py-1 rounded w-max border border-slate-100">
                      <MapPin className="w-3 h-3 mr-1.5 text-slate-400" /> {branch.address}
                    </span>
                    <div className="text-[11px] font-semibold text-slate-500 ml-1">
                      <span className="text-slate-400 font-normal">Contact:</span> {branch.contactPerson} ({branch.phone})
                    </div>
                  </div>
                </TableCell>

                {/* 4. Command Hub (Actions) */}
                <TableCell className="py-4 px-6 align-top">
                  <div className="flex items-center justify-end h-full mt-1.5 gap-4">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => setViewItem(branch)} className="p-1.5 rounded-md hover:bg-white text-indigo-600 hover:shadow-sm transition-all" title="View Branch"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(branch)} className="p-1.5 rounded-md hover:bg-white text-[#00A8CC] hover:shadow-sm transition-all" title="Edit Configuration"><Settings className="w-4 h-4" /></button>
                    </div>
                  </div>
                </TableCell>

              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-500 text-sm font-medium">No branches found matching your search.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Massive Edit / Add Dialog */}
      {(adding || editItem) && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center z-[100] animate-in fade-in p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95">
            <div className="bg-white border-b border-slate-100 py-3 px-5 text-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black text-[#0D2461] tracking-tight">{adding ? 'Create New Branch' : 'Edit Branch Details'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-[#00A8CC]"/> Branch Identity</label>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Branch Name</label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Branch Code</label>
                  <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                  <select className="w-full h-8 px-3 border border-slate-200 rounded-md text-xs bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-[#00A8CC]" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#00A8CC]"/> Contact Information</label>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact Person</label>
                  <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] bg-slate-50" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Physical Address</label>
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="h-8 text-xs border-slate-200 focus:border-[#00A8CC] bg-slate-50" />
                </div>
              </div>
            </div>

            <div className="bg-white py-3 px-5 border-t border-slate-100 flex justify-end gap-4 shrink-0 shadow-sm">
              <Button type="button" variant="outline" onClick={closeModal} className="w-32 border-slate-200 font-bold hover:bg-slate-50 text-xs h-9">Cancel</Button>
              <Button type="submit" onClick={handleSave} className="w-40 bg-[#0D2461] hover:bg-[#081840] text-white font-bold shadow-md shadow-[#0D2461]/20 text-xs h-9">{adding ? 'Create Branch' : 'Save Details'}</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom View Dialog */}
      {viewItem && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center z-[100] animate-in fade-in p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col my-auto animate-in zoom-in-95">
            <div className="bg-[#00A8CC] py-3 px-5 text-white flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black tracking-wide">Branch Profile</h2>
              <button onClick={() => setViewItem(null)} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 space-y-4">
              <div className="flex justify-center mb-2 mt-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00A8CC] to-cyan-700 flex items-center justify-center text-white font-black text-2xl shadow-lg uppercase">
                  {viewItem.name.charAt(0)}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3 text-sm">
                {[['Name', viewItem.name], ['Branch Code', viewItem.code], ['Contact Person', viewItem.contactPerson], ['Phone', viewItem.phone], ['Email', viewItem.email], ['Address', viewItem.address], ['Status', viewItem.status]].map(([k, v]) => (
                  <div key={k} className="flex border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <span className="w-32 font-bold text-slate-400 uppercase text-[10px] tracking-wider pt-1">{k}</span>
                    <span className="font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white py-3 px-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setViewItem(null)} className="font-bold border-slate-200 text-xs h-9">Close</Button>
              <Button onClick={() => { openEdit(viewItem!); setViewItem(null); }} className="bg-[#00A8CC] text-white font-bold hover:bg-[#008ba8] text-xs h-9">Edit Details</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
