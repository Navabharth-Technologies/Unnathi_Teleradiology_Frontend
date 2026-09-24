import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Eye, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function RadiologistWorklist() {
  const { studies, patients, radiologists, hospitals } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // For demo purposes, default to the first radiologist or allow selecting
  const defaultRadId = radiologists.find(r => r.userId === user?.id || r.name === user?.name)?.id || radiologists[0]?.id;
  const [selectedRadId, setSelectedRadId] = useState<string>(defaultRadId);

  const currentRadiologist = radiologists.find(r => r.id === selectedRadId);

  const myStudies = studies
    .filter(s => s.assignedRadiologistId === selectedRadId)
    .filter(s => 
      s.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.modality.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Sort Emergency first, then newest
    .sort((a, b) => {
      if (a.priority === 'Emergency' && b.priority !== 'Emergency') return -1;
      if (b.priority === 'Emergency' && a.priority !== 'Emergency') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown';
  const getPatientUhid = (id: string) => patients.find(p => p.id === id)?.uhid || 'Unknown';
  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Unknown';

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Final': 
      case 'Verified': 
      case 'Dispatched':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Draft': 
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'Review': 
      case 'Pending':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Action Needed': 
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Unread':
      default: 
        return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">My Worklist</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Viewing assigned studies for {currentRadiologist?.name || 'Selected Radiologist'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input 
              placeholder="Search by case or modality..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-[300px] h-10 text-sm bg-slate-50 text-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] transition-all shadow-inner"
            />
          </div>
          {user?.role !== 'RADIOLOGIST' ? (
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">View As:</label>
              <select 
                className="bg-transparent border-0 text-sm font-black text-[#0D2461] focus:ring-0 cursor-pointer outline-none max-w-[200px]"
                value={selectedRadId}
                onChange={(e) => setSelectedRadId(e.target.value)}
              >
                {radiologists.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {r.registrationId || r.id} ({studies.filter(s => s.assignedRadiologistId === r.id).length})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">My Worklist</label>
              <div className="text-sm font-black text-[#0D2461] truncate max-w-[150px]">
                {currentRadiologist?.name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">Case No / Priority</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Patient / Hospital</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Modality / Study</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Date</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase text-center">Status</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myStudies.map(study => (
              <TableRow key={study.id} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-100 group">
                <TableCell className="py-4 px-6 align-top">
                  <div className="font-black text-slate-800 text-sm">{study.caseNumber}</div>
                  <div className="mt-1">
                    {study.priority === 'Emergency' ? (
                      <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">STAT</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">Routine</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4 align-top">
                  <div className="font-bold text-slate-800 text-sm uppercase">{getPatientName(study.patientId)}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-1">{getPatientUhid(study.patientId)}</div>
                  <div className="text-xs font-semibold text-slate-500">{getHospitalName(study.hospitalId)}</div>
                </TableCell>
                <TableCell className="py-4 px-4 align-top">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-slate-100 text-[#0D2461] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">{study.modality}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800">{study.bodyPart}</div>
                  <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{study.studyDescription}</div>
                </TableCell>
                <TableCell className="py-4 px-4 align-top text-xs font-semibold text-slate-600">
                  {format(new Date(study.studyDate), 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="py-4 px-4 align-top text-center">
                  <span className={`inline-block px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase border ${getStatusStyle(study.reportingStatus)}`}>
                    {study.reportingStatus}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 align-top">
                  <div className="flex items-center justify-end h-full">
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/viewer/${study.id}`)}
                      className="h-9 px-4 text-xs font-black rounded-lg border-slate-200 text-[#00A8CC] hover:text-white bg-cyan-50 hover:bg-[#00A8CC] transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      <Eye className="mr-2 h-3.5 w-3.5" /> Open Viewer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {myStudies.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center">
                    <Filter className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-sm font-bold">No assigned studies found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
