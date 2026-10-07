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
      <div className="flex justify-between items-center bg-card p-5 rounded-lg shadow-sm border border-border">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <div className="bg-destructive/10 p-2 rounded-md mr-4 border border-destructive/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary tracking-tight">Emergency / STAT Board</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Immediate attention required for critical cases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Alert Widget */}
      {emergencyStudies.length > 0 ? (
        <div className="bg-card rounded-lg p-6 shadow-sm border-l-4 border-l-destructive border border-border relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-destructive/10 p-4 rounded-md text-destructive border border-destructive/20">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Active STAT Cases</p>
                <div className="flex items-baseline space-x-3">
                  <p className="text-5xl font-bold text-primary">{emergencyStudies.length}</p>
                  <p className="text-sm font-semibold text-destructive">Cases Pending</p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/studies')} className="bg-destructive hover:bg-destructive-hover text-destructive-foreground h-10 px-5 text-sm font-semibold rounded-md shadow-sm transition-colors">
              Manage STAT Cases <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg p-8 shadow-sm border-l-4 border-l-success border border-border flex flex-col items-center justify-center text-center h-48">
           <div className="bg-success/10 p-4 rounded-full mb-3 border border-success/20 text-success">
             <Clock className="h-8 w-8" />
           </div>
           <p className="text-lg font-bold text-primary uppercase tracking-wider">No Emergency Cases</p>
           <p className="text-slate-500 font-medium mt-1 text-sm">The STAT board is currently clear.</p>
        </div>
      )}

      {/* Premium Data Grid */}
      {emergencyStudies.length > 0 && (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="p-4 border-b border-border bg-slate-50/50">
            <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider">Urgent Action Required</h3>
          </div>
          <Table>
            <TableHeader className="bg-slate-50 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-slate-500 font-semibold py-3 px-5 text-[11px] tracking-wider uppercase">Case No</TableHead>
                <TableHead className="text-slate-500 font-semibold py-3 px-4 text-[11px] tracking-wider uppercase">Patient</TableHead>
                <TableHead className="text-slate-500 font-semibold py-3 px-4 text-[11px] tracking-wider uppercase">Modality/Study</TableHead>
                <TableHead className="text-slate-500 font-semibold py-3 px-4 text-[11px] tracking-wider uppercase">Time Waiting</TableHead>
                <TableHead className="text-slate-500 font-semibold py-3 px-4 text-[11px] tracking-wider uppercase">Status</TableHead>
                <TableHead className="text-slate-500 font-semibold py-3 px-5 text-[11px] tracking-wider uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emergencyStudies.map(study => (
                <TableRow key={study.id} className="hover:bg-slate-50 transition-colors border-b border-border group">
                  <TableCell className="py-3.5 px-5 font-semibold text-destructive text-sm">{study.caseNumber}</TableCell>
                  <TableCell className="py-3.5 px-4 font-medium text-slate-700 text-sm">{getPatientName(study.patientId)}</TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 text-sm">{study.modality}</div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">{study.studyDescription}</div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center text-destructive font-semibold text-sm bg-destructive/10 px-2 py-0.5 rounded inline-flex border border-destructive/20 shadow-sm">
                      <Clock className="mr-1.5 h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(study.createdAt))}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className="bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase">
                      {study.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-5 text-right">
                    <Button size="sm" onClick={() => navigate('/studies')} className="bg-primary hover:bg-primary-hover text-white font-semibold shadow-sm">
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
