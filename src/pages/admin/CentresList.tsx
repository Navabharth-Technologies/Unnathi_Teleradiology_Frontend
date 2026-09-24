import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import type { Centre } from '../../types';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Search, Eye, Pencil } from 'lucide-react';

export default function CentresList() {
  type CentreForm = Omit<Centre, 'id' | 'createdAt'>;
  const { centers, branches, addCentre, updateCentre, modalities } = useMockDb();
  const ALL_SERVICES = modalities.map(m => m.name);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewItem, setViewItem] = useState<Centre | null>(null);
  const [editItem, setEditItem] = useState<Centre | null>(null);
  const [adding, setAdding] = useState(false);

  const EMPTY: CentreForm = { branchId: branches[0]?.id || '', siteNumber: '', name: '', contactPerson: '', phone: '', email: '', address: '', serviceTypes: [], accountType: 'Prepaid', status: 'Active' };
  const [form, setForm] = useState<CentreForm>(EMPTY);

  const filtered = centers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.siteNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'Unknown';

  const openAdd = () => { setForm(EMPTY); setAdding(true); };
  const openEdit = (c: Centre) => {
    setForm({ branchId: c.branchId, siteNumber: c.siteNumber, name: c.name, contactPerson: c.contactPerson, phone: c.phone, email: c.email, address: c.address, serviceTypes: c.serviceTypes, accountType: c.accountType, status: c.status });
    setEditItem(c);
  };

  const handleSave = () => {
    if (adding) { addCentre({ ...form, id: 'c' + Date.now(), createdAt: new Date().toISOString() }); setAdding(false); }
    else if (editItem) { updateCentre(editItem.id, form); setEditItem(null); }
  };

  const toggleService = (s: string) => {
    setForm(f => ({ ...f, serviceTypes: f.serviceTypes.includes(s as any) ? f.serviceTypes.filter(x => x !== s) : [...f.serviceTypes, s as any] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">centers</h1>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Centre</Button>
      </div>

      <div className="flex items-center space-x-2 bg-white p-4 rounded-lg shadow-sm">
        <Search className="text-slate-400" />
        <Input placeholder="Search centers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm border-0 focus-visible:ring-0 px-0" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site No</TableHead><TableHead>Centre Name</TableHead><TableHead>Branch</TableHead>
              <TableHead>Type</TableHead><TableHead>Services</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(centre => (
              <TableRow key={centre.id}>
                <TableCell className="font-medium">{centre.siteNumber}</TableCell>
                <TableCell>{centre.name}</TableCell>
                <TableCell>{getBranchName(centre.branchId)}</TableCell>
                <TableCell>{centre.accountType}</TableCell>
                <TableCell><div className="flex gap-1 flex-wrap">{centre.serviceTypes.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></TableCell>
                <TableCell><Badge variant={centre.status === 'Active' ? 'default' : 'secondary'}>{centre.status}</Badge></TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setViewItem(centre)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(centre)}><Pencil className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-6 text-slate-500">No centers found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={adding || !!editItem} onOpenChange={open => { if (!open) { setAdding(false); setEditItem(null); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{adding ? 'Add Centre' : 'Edit Centre'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Branch</label>
              <select className="w-full border rounded-md p-2 h-10" value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            {(['siteNumber', 'name', 'contactPerson', 'phone', 'email', 'address'] as const).map(key => (
              <div key={key} className="space-y-1">
                <label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <Input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-sm font-medium">Account Type</label>
              <select className="w-full border rounded-md p-2 h-10" value={form.accountType} onChange={e => setForm(f => ({ ...f, accountType: e.target.value as any }))}>
                <option>Prepaid</option><option>Postpaid</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <select className="w-full border rounded-md p-2 h-10" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Service Types</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SERVICES.map(s => (
                  <button key={s} type="button" onClick={() => toggleService(s)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.serviceTypes.includes(s as any) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600 hover:border-blue-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAdding(false); setEditItem(null); }}>Cancel</Button>
            <Button onClick={handleSave}>{adding ? 'Add Centre' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={open => !open && setViewItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Centre Details</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 py-4 text-sm">
              {[['Site No', viewItem.siteNumber], ['Name', viewItem.name], ['Branch', getBranchName(viewItem.branchId)], ['Contact', viewItem.contactPerson], ['Phone', viewItem.phone], ['Email', viewItem.email], ['Address', viewItem.address], ['Account Type', viewItem.accountType], ['Status', viewItem.status]].map(([k, v]) => (
                <div key={k} className="flex"><span className="w-36 font-medium text-slate-500">{k}</span><span>{v}</span></div>
              ))}
              <div className="flex"><span className="w-36 font-medium text-slate-500">Services</span><div className="flex gap-1 flex-wrap">{viewItem.serviceTypes.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
            <Button onClick={() => { openEdit(viewItem!); setViewItem(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
