import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import type { Patient } from '../../types';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Plus, Search, Eye, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';

export default function PatientsList() {
  const { patients, updatePatient } = useMockDb();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewItem, setViewItem] = useState<Patient | null>(null);
  const [editItem, setEditItem] = useState<Patient | null>(null);
  const [form, setForm] = useState<Partial<Patient>>({});
  const { selectedHospitalId } = useAuthStore();
  const navigate = useNavigate();

  const filtered = patients.filter(p => {
    if (selectedHospitalId && p.hospitalId !== selectedHospitalId) return false;
    return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.uhid.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openEdit = (p: Patient) => { setForm({ ...p }); setEditItem(p); };

  const handleSave = () => {
    if (editItem) { updatePatient(editItem.id, form); setEditItem(null); }
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Patients</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage patient records and demographics</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by Name or UHID..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-9 w-[300px] h-10 rounded-xl bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20 text-sm font-semibold"
            />
          </div>
          <Button onClick={() => navigate('/patients/new')} className="h-10 px-5 text-sm font-black rounded-xl bg-[#0D2461] hover:bg-[#081840] text-white shadow-md shadow-[#0D2461]/20 tracking-wide">
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase">UHID</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Patient Name</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Age / Gender</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Phone</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-4 text-[10px] tracking-widest uppercase">Reg. Date</TableHead>
              <TableHead className="text-slate-400 font-black py-4 px-6 text-[10px] tracking-widest uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(patient => (
              <TableRow key={patient.id} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-50 group">
                <TableCell className="py-4 px-6 font-bold text-slate-800 text-sm">{patient.uhid}</TableCell>
                <TableCell className="py-4 px-4 font-black text-[#0D2461] text-sm">{patient.name}</TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{patient.age}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{patient.gender}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4 font-semibold text-slate-600 text-sm">{patient.phone || '-'}</TableCell>
                <TableCell className="py-4 px-4 font-semibold text-slate-600 text-sm">
                  {format(new Date(patient.registrationDate), 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center justify-end h-full gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => setViewItem(patient)} className="p-1.5 rounded-md hover:bg-slate-50 text-[#0D2461] hover:text-[#00A8CC] transition-all" title="View Patient"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(patient)} className="p-1.5 rounded-md hover:bg-slate-50 text-[#0D2461] hover:text-[#00A8CC] transition-all" title="Edit Patient"><Pencil className="w-4 h-4" /></button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Search className="h-8 w-8 mb-3 opacity-20" />
                    <p className="text-sm font-medium">No patients found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Custom Overlay Modals (Replacing buggy Shadcn Dialogs) */}
      
      {/* Edit Patient Overlay */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-[#0D2461] tracking-tight">Edit Patient</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">UHID: {editItem.uhid}</p>
              </div>
              <button onClick={() => setEditItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                {([['name', 'Full Name'], ['phone', 'Phone'], ['email', 'Email'], ['referringDoctor', 'Referring Doctor']] as const).map(([key, label]) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
                    <Input 
                      value={(form as any)[key] || ''} 
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} 
                      className="h-11 text-sm font-semibold bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20"
                    />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age</label>
                  <Input 
                    type="number" 
                    value={form.age || ''} 
                    onChange={e => setForm(f => ({ ...f, age: parseInt(e.target.value) }))} 
                    className="h-11 text-sm font-semibold bg-slate-50 border-slate-200 focus:border-[#00A8CC] focus:ring-[#00A8CC]/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                  <select 
                    className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm font-semibold bg-slate-50 focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20 outline-none" 
                    value={form.gender || ''} 
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value as any }))}
                  >
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-6 border-t border-slate-100 bg-slate-50/50 gap-3">
              <Button variant="outline" onClick={() => setEditItem(null)} className="h-11 px-6 rounded-xl font-bold border-slate-200">
                Cancel
              </Button>
              <Button onClick={handleSave} className="h-11 px-8 rounded-xl font-black bg-[#0D2461] hover:bg-[#081840] text-white shadow-md shadow-[#0D2461]/20">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Patient Overlay */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-[#0D2461] tracking-tight">Patient Details</h2>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {[
                  ['UHID', viewItem.uhid], ['Name', viewItem.name], ['DOB', viewItem.dob],
                  ['Age', String(viewItem.age)], ['Gender', viewItem.gender],
                  ['Phone', viewItem.phone], ['Email', viewItem.email || '-'],
                  ['Referring Doctor', viewItem.referringDoctor || 'Self'],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{k}</span>
                    <span className="text-sm font-black text-slate-800 mt-1">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end p-6 border-t border-slate-100 bg-slate-50/50 gap-3">
              <Button variant="outline" onClick={() => setViewItem(null)} className="h-11 px-6 rounded-xl font-bold border-slate-200">
                Close
              </Button>
              <Button onClick={() => { openEdit(viewItem); setViewItem(null); }} className="h-11 px-8 rounded-xl font-black bg-[#00A8CC] hover:bg-[#008ba8] text-white shadow-md shadow-cyan-500/20">
                Edit Patient
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
