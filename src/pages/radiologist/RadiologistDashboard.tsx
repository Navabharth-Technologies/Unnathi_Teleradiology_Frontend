import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { FileSearch, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function RadiologistDashboard() {
  const { studies, radiologists } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Find the radiologist profile for the current user
  const currentRadiologist = radiologists.find(r => r.userId === user?.id || r.name === user?.name) || radiologists[0];

  const myStudies = studies.filter(s => s.assignedRadiologistId === currentRadiologist?.id);
  
  const pendingCount = myStudies.filter(s => ['Unread', 'Pending', 'Draft', 'Action Needed'].includes(s.reportingStatus)).length;
  const completedCount = myStudies.filter(s => s.reportingStatus === 'Final').length;
  const emergencyCount = myStudies.filter(s => s.priority === 'Emergency' && s.reportingStatus !== 'Final').length;

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Welcome, {currentRadiologist?.name}</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Overview of your assigned reporting queue</p>
          </div>
        </div>
        <Button onClick={() => navigate('/radiologist/worklist')} className="h-10 px-5 text-sm font-black rounded-xl bg-[#00A8CC] hover:bg-[#008ba8] text-white shadow-md shadow-cyan-500/20 tracking-wide">
          My Worklist <ArrowUpRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      {/* Premium Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending / Draft */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl inline-block">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending / Draft</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-slate-800 tracking-tight">{pendingCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* STAT / Emergency */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl inline-block">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">STAT / Emergency</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-rose-600 tracking-tight">{emergencyCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Today */}
        <div className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl inline-block">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Completed Today</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-emerald-600 tracking-tight">{completedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Up Priority List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col max-w-4xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black text-[#0D2461]">Next Up</h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Priority Sorted Queue</p>
        </div>
        <div className="p-2 flex-1">
          <div className="space-y-1">
            {myStudies
              .filter(s => ['Unread', 'Pending', 'Draft', 'Action Needed'].includes(s.reportingStatus))
              .sort((a, b) => (a.priority === 'Emergency' ? -1 : 1))
              .slice(0, 10)
              .map(study => (
                <div key={study.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      study.priority === 'Emergency' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <FileSearch className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-black text-slate-800">{study.caseNumber}</p>
                        {study.priority === 'Emergency' && (
                          <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">STAT</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">{study.modality}</span>
                        <span className="text-xs font-semibold text-slate-500 truncate max-w-[300px]">{study.studyDescription}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/viewer/${study.id}`)} 
                    variant="outline"
                    className="h-9 px-4 text-xs font-black rounded-lg border-slate-200 text-[#0D2461] hover:text-[#00A8CC] hover:border-[#00A8CC]/30 hover:bg-cyan-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    Open Viewer
                  </Button>
                </div>
            ))}
            {myStudies.filter(s => ['Unread', 'Pending', 'Draft', 'Action Needed'].includes(s.reportingStatus)).length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mb-3 text-emerald-400" />
                <p className="text-sm font-bold">Your queue is empty!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
