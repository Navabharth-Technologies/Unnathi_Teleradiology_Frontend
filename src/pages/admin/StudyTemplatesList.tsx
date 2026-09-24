import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { PlusCircle, Search, Edit2, Trash2, FileText, CheckCircle2, XCircle } from 'lucide-react';
import type { UtilityTemplate } from '../../types';

export default function StudyTemplatesList() {
  const { templates, deleteTemplate, hospitals } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const scopedTemplates = (templates || []).filter(t => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.role === 'SITE_ADMIN') {
       const hosp = hospitals.find(h => h.id === t.hospitalId);
       return hosp?.parentSiteId === user?.siteId;
    }
    return t.hospitalId === user?.hospitalId;
  });

  const filtered = scopedTemplates.filter(t => 
    t.modality.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.studyName.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Study Templates (Utilities)</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Configure default reporting templates for specific modalities and study names.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input 
              placeholder="Search by modality or study name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-[300px] h-10 text-sm bg-slate-50 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A8CC]/20"
            />
          </div>
          <Button onClick={() => navigate('/utilities/templates/new')} className="bg-[#0D2461] hover:bg-[#081840] text-white h-10 px-5 text-sm font-bold rounded-xl shadow-md">
            <PlusCircle className="w-4 h-4 mr-2" /> Add Template
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">Modality</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">Study Name</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">Price (₹)</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-center">Status</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(tpl => (
              <TableRow key={tpl.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <TableCell className="py-4 px-6 font-bold text-slate-800 text-sm">{tpl.modality}</TableCell>
                <TableCell className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase">{tpl.studyName}</TableCell>
                <TableCell className="py-4 px-6 text-right font-bold text-slate-900 text-sm">{tpl.price ? `₹${tpl.price.toLocaleString()}` : '-'}</TableCell>
                <TableCell className="py-4 px-6 text-center">
                  {tpl.isActive ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm uppercase">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm uppercase">
                      <XCircle className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/utilities/templates/${tpl.id}/edit`)}
                      className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteTemplate(tpl.id)}
                      className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-500 text-sm font-medium">
                  No templates configured yet. Click "Add Template" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
