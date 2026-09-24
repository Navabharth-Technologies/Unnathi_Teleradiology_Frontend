import { useMockDb } from '../../store/useMockDb';
import { exportToCSV } from '../../utils/export';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Clock, AlertCircle, CheckCircle2, Search, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function TatMonitoring() {
  const { studies, hospitals, radiologists } = useMockDb();

  // Mock calculation - normally this compares current time vs createdAt and SLA limit based on priority
  const tatData = studies.map(s => {
    let tatStatus = 'Within SLA';
    if (s.tat.includes('Delayed') || parseInt(s.tat) > 24) tatStatus = 'Delayed';
    else if (s.priority === 'Emergency') tatStatus = 'Near SLA'; // naive mockup
    
    return {
      ...s,
      tatStatus
    };
  });

  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name;
  const getRadiologistName = (id?: string) => id ? radiologists.find(r => r.id === id)?.name : 'Unassigned';

  const getTatBadge = (status: string) => {
    switch (status) {
      case 'Delayed': return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm uppercase">Delayed</span>;
      case 'Near SLA': return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm uppercase">Near SLA</span>;
      default: return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm uppercase">Within SLA</span>;
    }
  }

  const handleExport = () => {
    const exportData = tatData.map(t => ({
      'Case ID': t.id,
      'Modality': t.modality,
      'Hospital': getHospitalName(t.siteId) || 'Unknown',
      'Assigned Radiologist': getRadiologistName(t.assignedTo),
      'Priority': t.priority,
      'Time Logged': t.tat,
      'SLA Status': t.tatStatus
    }));
    exportToCSV('sla_report.csv', exportData);
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">TAT Monitoring</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Track turnaround time performance across all active studies</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={handleExport} className="bg-[#0D2461] hover:bg-[#081840] text-white h-10 px-5 text-sm font-bold rounded-xl shadow-md shadow-[#0D2461]/20">
            <Download className="w-4 h-4 mr-2" /> Export SLA Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600 border border-emerald-100 shadow-inner">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Within SLA</p>
              <p className="text-3xl font-black text-[#0D2461]">{tatData.filter(t => t.tatStatus === 'Within SLA').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center space-x-4">
            <div className="bg-amber-50 p-4 rounded-xl text-amber-600 border border-amber-100 shadow-inner">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Near SLA Limit</p>
              <p className="text-3xl font-black text-[#0D2461]">{tatData.filter(t => t.tatStatus === 'Near SLA').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 shadow-md border border-red-500 relative overflow-hidden group hover:shadow-lg transition-all text-white">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-4 rounded-xl text-white backdrop-blur-sm border border-white/30 shadow-inner">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-100 uppercase tracking-widest mb-1">Delayed / Breached</p>
              <p className="text-3xl font-black text-white">{tatData.filter(t => t.tatStatus === 'Delayed').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-black text-[#0D2461] uppercase tracking-wider">TAT Worklist View</h3>
          <div className="relative group">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#00A8CC] transition-colors" />
            <Input 
              placeholder="Search by case number..." 
              className="pr-10 w-[260px] h-9 text-xs bg-white text-slate-900 border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00A8CC]/20 focus:border-[#00A8CC] transition-all shadow-inner"
            />
          </div>
        </div>
        <Table>
          <TableHeader className="bg-white">
            <TableRow>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase">Case / Modality</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Hospital</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Assigned Radiologist</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Priority</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-4 text-[11px] tracking-widest uppercase">Time Logged</TableHead>
              <TableHead className="text-slate-500 font-black py-4 px-6 text-[11px] tracking-widest uppercase text-right">SLA Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tatData.map(study => (
              <TableRow key={study.id} className="hover:bg-cyan-50/30 transition-colors border-b border-slate-100">
                <TableCell className="py-4 px-6">
                  <div className="font-bold text-slate-800 text-sm">{study.caseNumber}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{study.modality}</div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="text-sm font-semibold text-slate-700">{getHospitalName(study.hospitalId)}</div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="text-sm font-semibold text-slate-700">{getRadiologistName(study.assignedRadiologistId)}</div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <span className={`text-xs font-black uppercase tracking-wider ${study.priority === 'Emergency' ? 'text-red-600' : 'text-slate-500'}`}>
                    {study.priority}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex items-center text-sm font-semibold text-slate-700">
                    <Clock className="w-4 h-4 mr-1.5 text-slate-400" /> {study.tat}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  {getTatBadge(study.tatStatus)}
                </TableCell>
              </TableRow>
            ))}
            {tatData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500 text-sm font-medium">
                  No TAT records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
