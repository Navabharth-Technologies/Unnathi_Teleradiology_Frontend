import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { FileSearch, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function RadiologistDashboard() {
  const { studies, radiologists } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const currentRadiologist = radiologists.find(r => r.userId === user?.id || r.name === user?.name) || radiologists[0];

  const myStudies = studies.filter(s => s.assignedRadiologistId === currentRadiologist?.id);
  
  const pendingCount = myStudies.filter(s => ['Unread', 'Pending', 'Draft', 'Action Needed'].includes(s.reportingStatus)).length;
  const completedCount = myStudies.filter(s => s.reportingStatus === 'Final').length;
  const emergencyCount = myStudies.filter(s => s.priority === 'Emergency' && s.reportingStatus !== 'Final').length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black text-[#10263D] tracking-tight">Welcome, {currentRadiologist?.name}</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Overview of your assigned reporting queue</p>
        </div>
        <button onClick={() => navigate('/radiologist/worklist')} className="h-10 px-5 bg-gradient-to-r from-[#176B73] to-[#10263D] text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center">
          My Worklist <ArrowUpRight className="ml-2 w-4 h-4" />
        </button>
      </motion.div>

      {/* Widgets */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-slate-50 rounded-full blur-xl group-hover:bg-amber-50 transition-colors duration-500" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Pending / Draft</p>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-500 border border-amber-100/50"><Clock className="w-5 h-5" /></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black text-[#10263D] tracking-tight mb-1">{pendingCount}</h3>
            <p className="text-[11px] text-amber-600 font-bold uppercase tracking-widest">Needs attention</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-slate-50 rounded-full blur-xl group-hover:bg-rose-50 transition-colors duration-500" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">STAT / Emergency</p>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 border border-rose-100/50"><AlertTriangle className="w-5 h-5" /></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black text-rose-600 tracking-tight mb-1">{emergencyCount}</h3>
            <p className="text-[11px] text-rose-600 font-bold uppercase tracking-widest">High priority tasks</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl border border-emerald-400/20 flex flex-col justify-between shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <p className="text-[11px] font-black text-emerald-100 uppercase tracking-widest">Completed Today</p>
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white shadow-inner"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black text-white tracking-tight mb-1">{completedCount}</h3>
            <p className="text-[11px] text-white/90 font-bold uppercase tracking-widest">Finalized reports</p>
          </div>
        </div>
      </motion.div>

      {/* Next Up Priority List */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden max-w-4xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black text-[#10263D]">Next Up</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Priority Sorted Queue</p>
        </div>
        <div className="divide-y divide-slate-100">
          {myStudies
            .filter(s => ['Unread', 'Pending', 'Draft', 'Action Needed'].includes(s.reportingStatus))
            .sort((a, b) => (a.priority === 'Emergency' ? -1 : 1))
            .slice(0, 10)
            .map(study => (
              <div key={study.id} className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                    study.priority === 'Emergency' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-black text-[#10263D]">{study.caseNumber}</p>
                      {study.priority === 'Emergency' && (
                        <span className="bg-rose-50 text-rose-600 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-rose-100">STAT</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-widest border border-slate-200">{study.modality}</span>
                      <span className="text-xs font-semibold text-slate-500 truncate max-w-[300px]">{study.studyDescription}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/viewer/${study.id}`)} 
                  className="h-9 px-4 text-xs font-bold text-[#176B73] bg-teal-50 border border-teal-100 rounded-lg hover:bg-[#176B73] hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                >
                  Open Viewer
                </button>
              </div>
          ))}
          {myStudies.filter(s => ['Unread', 'Pending', 'Draft', 'Action Needed'].includes(s.reportingStatus)).length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mb-4 text-emerald-400 opacity-50" />
              <p className="text-sm font-bold">Your queue is empty!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
