import { useMockDb } from '../../store/useMockDb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function EmergencyStudies() {
  const { studies, patients } = useMockDb();
  const navigate = useNavigate();

  const emergencyStudies = studies.filter(s => s.priority === 'Emergency');
  
  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-xl mr-4 shadow-inner border border-red-200">
              <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Emergency / STAT Board</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Immediate attention required for critical cases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Alert Widget */}
      {emergencyStudies.length > 0 ? (
        <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-8 shadow-lg border border-red-500 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 p-5 rounded-2xl text-white backdrop-blur-md border border-white/30 shadow-inner">
                <AlertTriangle className="h-10 w-10 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-100 uppercase tracking-widest mb-1">Active STAT Cases</p>
                <div className="flex items-baseline space-x-3">
                  <p className="text-6xl font-black text-white">{emergencyStudies.length}</p>
                  <p className="text-lg font-bold text-red-100">Cases Pending</p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/studies')} className="bg-white text-red-600 hover:bg-red-50 h-12 px-6 text-sm font-black rounded-xl shadow-md border-0 uppercase tracking-wide">
              Manage All STAT <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl p-8 shadow-sm border border-emerald-500 relative overflow-hidden flex flex-col items-center justify-center text-center text-white h-48">
           <div className="bg-white/20 p-4 rounded-full mb-3 backdrop-blur-sm border border-white/30">
             <Clock className="h-8 w-8" />
           </div>
           <p className="text-xl font-black uppercase tracking-widest">No Emergency Cases</p>
           <p className="text-emerald-50 font-medium mt-1 text-sm">The STAT board is completely clear.</p>
        </div>
      )}

      {/* Premium Data Grid */}
      {emergencyStudies.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-rose-100">
          <div className="p-4 border-b border-rose-100 bg-rose-50/30">
            <h3 className="text-sm font-black text-rose-700 uppercase tracking-wider">Urgent Action Required</h3>
          </div>
          <Table>
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">Case No</TableHead>
                <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Patient</TableHead>
                <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Modality/Study</TableHead>
                <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Time Waiting</TableHead>
                <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Status</TableHead>
                <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emergencyStudies.map(study => (
                <TableRow key={study.id} className="hover:bg-rose-50/50 transition-colors border-b border-slate-100 group">
                  <TableCell className="py-4 px-6 font-black text-rose-700 text-sm">{study.caseNumber}</TableCell>
                  <TableCell className="py-4 px-4 font-bold text-slate-800 text-sm">{getPatientName(study.patientId)}</TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="font-bold text-slate-800 text-sm">{study.modality}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{study.studyDescription}</div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="flex items-center text-rose-600 font-bold text-sm bg-rose-50 px-2 py-1 rounded-md inline-flex border border-rose-100 shadow-sm">
                      <Clock className="mr-1.5 h-4 w-4" />
                      {formatDistanceToNow(new Date(study.createdAt))}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <span className="bg-red-100 text-red-800 border border-red-200 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm uppercase">
                      {study.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <Button size="sm" onClick={() => navigate('/studies')} className="bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-md shadow-slate-900/20">
                      Manage Case
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
