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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Patients Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage patient records and demographics</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Name or UHID..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-9 w-[300px]"
            />
          </div>
          <Button onClick={() => navigate('/patients/new')} variant="default">
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </div>
      </div>

      {/* Data Grid */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">UHID</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Patient Name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Age / Gender</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Phone</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Reg. Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(patient => (
                <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors border-b border-border">
                  <TableCell className="py-3 font-medium text-foreground">{patient.uhid}</TableCell>
                  <TableCell className="py-3 font-medium text-primary">{patient.name}</TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {patient.age} • {patient.gender}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">{patient.phone || '-'}</TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {format(new Date(patient.registrationDate), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewItem(patient)} className="h-8 px-2 text-secondary hover:text-secondary-hover">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(patient)} className="h-8 px-2 text-primary hover:text-primary-hover">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No patients found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-lg shadow-level-3 border border-border flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30 rounded-t-lg">
              <h2 className="text-lg font-semibold text-primary">Edit Patient</h2>
              <button onClick={() => setEditItem(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Patient Name</label>
                <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Age</label>
                  <Input type="number" value={form.age || ''} onChange={e => setForm({ ...form, age: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Gender</label>
                  <select 
                    value={form.gender || ''} 
                    onChange={e => setForm({ ...form, gender: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                <Input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Address</label>
                <Input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/30 rounded-b-lg">
              <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-lg shadow-level-3 border border-border flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30 rounded-t-lg">
              <h2 className="text-lg font-semibold text-primary">Patient Details</h2>
              <button onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">UHID</p>
                  <p className="font-medium mt-1">{viewItem.uhid}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Name</p>
                  <p className="font-medium mt-1">{viewItem.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Age/Gender</p>
                  <p className="font-medium mt-1">{viewItem.age} / {viewItem.gender}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Phone</p>
                  <p className="font-medium mt-1">{viewItem.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Address</p>
                  <p className="font-medium mt-1">{viewItem.address || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Registration Date</p>
                  <p className="font-medium mt-1">{format(new Date(viewItem.registrationDate), 'PPP')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
