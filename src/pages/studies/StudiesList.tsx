import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMockDb } from '../../store/useMockDb';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Search, Upload, PlusCircle, Eye, UserPlus, X, Share2, ClipboardList, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShareModal } from '../../components/modals/ShareModal';
import { AddHistoryModal } from '../../components/modals/AddHistoryModal';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';
import type { Study } from '../../types';

export default function StudiesList() {
  const { studies, patients, hospitals, radiologists, updateStudy } = useMockDb();
  const [searchTerm, setSearchTerm] = useState('');
  const [historyStudy, setHistoryStudy] = useState<Study | null>(null);
  const [sharingStudy, setSharingStudy] = useState<Study | null>(null);
  const navigate = useNavigate();
  const { currentRole, selectedHospitalId, user } = useAuthStore();

  const filtered = studies.filter(s => {
    if (selectedHospitalId && s.hospitalId !== selectedHospitalId) return false;
    
    const hospital = hospitals.find(h => h.id === s.hospitalId);

    // Allow Super Admin to see all studies
    if (user?.role === 'SUPER_ADMIN') {
      // no-op, sees everything
    }
    // Isolate independent hospitals from Site Admins
    if (user?.role === 'SITE_ADMIN') {
      const hospital = hospitals.find(h => h.id === s.hospitalId);
      if (hospital?.parentSiteId !== user.siteId) return false;
    }
    
    return s.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
           s.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown';
  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Unknown';

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Emergency': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Urgent': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Final': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Action Needed': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Study Worklist</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage and assign all incoming diagnostic studies</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input 
              placeholder="Search by case or accession..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-[300px] h-10 text-sm bg-slate-50 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] transition-all shadow-inner"
            />
          </div>
          {currentRole !== 'Accountant' && (
            <Button onClick={() => navigate('/studies/new')} className="bg-[#0D2461] hover:bg-[#081840] text-white h-10 px-5 text-sm font-bold rounded-xl shadow-md shadow-[#0D2461]/20">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Study
            </Button>
          )}
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">Case No</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Patient</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Hospital</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Modality/Study</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Priority</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Status</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Date</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">Command Hub</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(study => (
              <TableRow key={study.id} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-100">
                <TableCell className="py-4 px-6 font-bold text-slate-800 text-sm">{study.caseNumber}</TableCell>
                <TableCell className="py-4 px-4 font-semibold text-slate-700 text-sm">{getPatientName(study.patientId)}</TableCell>
                <TableCell className="py-4 px-4 text-sm text-slate-600 font-medium">{getHospitalName(study.hospitalId)}</TableCell>
                <TableCell className="py-4 px-4">
                  <div className="font-bold text-slate-800 text-sm">{study.modality}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{study.studyDescription}</div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <span className={`border px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm uppercase ${getPriorityColor(study.priority)}`}>
                    {study.priority}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <span className={`border px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm uppercase ${getStatusColor(study.status)}`}>
                    {study.status}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4 text-sm font-semibold text-slate-700">
                  {format(new Date(study.studyDate), 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="py-4 px-6 align-top">
                  <div className="flex items-center justify-end h-full gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => navigate(`/viewer/${study.id}`)} className="p-1.5 rounded-md hover:bg-white text-[#0D2461] hover:shadow-sm transition-all" title="View Viewer"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setHistoryStudy(study)} className={`p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all ${study.clinicalHistory ? 'text-emerald-600' : 'text-slate-400'}`} title="View/Edit History"><ClipboardList className="w-4 h-4" /></button>
                      <button onClick={() => setSharingStudy(study)} className="p-1.5 rounded-md hover:bg-white text-indigo-600 hover:shadow-sm transition-all" title="Share Study"><Share2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-slate-500 text-sm font-medium">
                  No studies found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddHistoryModal 
        isOpen={!!historyStudy}
        onClose={() => setHistoryStudy(null)}
        study={historyStudy}
        patient={historyStudy ? patients.find(p => p.id === historyStudy.patientId) : undefined}
        hospital={historyStudy ? hospitals.find(h => h.id === historyStudy.hospitalId) : undefined}
      />
      
      <ShareModal 
        isOpen={!!sharingStudy} 
        onClose={() => setSharingStudy(null)}
        study={sharingStudy}
        patient={patients.find(p => p.id === sharingStudy?.patientId)}
        hospital={hospitals.find(h => h.id === sharingStudy?.hospitalId)}
      />
    </div>
  );
}
