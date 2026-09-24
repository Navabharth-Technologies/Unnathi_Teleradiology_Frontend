import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, FileSearch, AlertCircle, FileImage, ArrowRight, Activity, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const { studies, patients } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const scopedStudies = studies.filter(s => user?.role === 'SUPER_ADMIN' ? true : s.hospitalId === user?.hospitalId);
  const scopedPatients = patients.filter(p => user?.role === 'SUPER_ADMIN' ? true : p.hospitalId === user?.hospitalId);

  const todayStudies = scopedStudies.filter(s => new Date(s.studyDate).toDateString() === new Date().toDateString()).length;
  const newStudies = scopedStudies.filter(s => s.status === 'New' || s.reportingStatus === 'Unread').length;
  const emergencyStudies = scopedStudies.filter(s => s.priority === 'Emergency').length;

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Staff Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Daily operations and patient registration</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => navigate('/patients/new')} className="h-10 px-5 text-sm font-bold rounded-xl border-slate-200">
            + Add Patient
          </Button>
          <Button variant="outline" onClick={() => navigate('/studies/new')} className="h-10 px-5 text-sm font-bold rounded-xl border-slate-200">
            + Register Study
          </Button>
        </div>
      </div>

      {/* Primary Action Banner */}
      <div className="bg-gradient-to-r from-[#0D2461] to-[#00A8CC] rounded-2xl p-8 shadow-lg border border-[#00A8CC]/20 relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="bg-white/10 p-5 rounded-2xl text-white backdrop-blur-md border border-white/20 shadow-inner">
              <FileImage className="h-10 w-10" />
            </div>
            <div>
              <p className="text-sm font-bold text-cyan-100 uppercase tracking-widest mb-1">Primary Workflow</p>
              <h2 className="text-3xl font-black text-white mb-1">DICOM Receive</h2>
              <p className="text-cyan-50 text-sm font-medium">Push images from modality — patient & study auto-registered from DICOM headers</p>
            </div>
          </div>
          <Button
            className="bg-white text-[#0D2461] hover:bg-slate-50 h-12 px-6 text-sm font-black rounded-xl shadow-md border-0 uppercase tracking-wide"
            onClick={() => navigate('/dicom-receive')}
          >
            Open DICOM Receive <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Premium Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Studies</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{todayStudies}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><FileSearch className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Patients</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{scopedPatients.length}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Users className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">New / Unassigned</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{newStudies}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Activity className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 shadow-md border border-red-500 relative overflow-hidden group hover:shadow-lg transition-all text-white">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-red-100 uppercase tracking-widest mb-1">Emergency</p>
              <h3 className="text-3xl font-black text-white">{emergencyStudies}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl text-white backdrop-blur-sm"><AlertCircle className="w-5 h-5" /></div>
          </div>
        </div>
      </div>

      {/* Premium List Component */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-black text-[#0D2461]">Recent Action Needed</h3>
          <p className="text-xs font-medium text-slate-400">Cases requiring immediate attention or assignment</p>
        </div>
        <div className="p-0 overflow-y-auto max-h-[400px] flex-1">
          {studies.filter(s => s.status === 'New' || s.priority === 'Emergency').slice(0, 5).map((study, idx, arr) => (
            <div key={study.id} className={`flex justify-between items-center p-5 hover:bg-slate-50 transition-colors ${idx !== arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-slate-100 rounded-xl text-slate-500 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{study.caseNumber} <span className="text-slate-400 font-medium">({study.modality})</span></p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
                      Status: {study.status}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${study.priority === 'Emergency' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                      Priority: {study.priority}
                    </span>
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate(`/viewer/${study.id}`)} className="bg-[#0D2461] hover:bg-[#081840] text-white font-bold shadow-md shadow-[#0D2461]/20">
                Open Viewer
              </Button>
            </div>
          ))}
          {studies.filter(s => s.status === 'New' || s.priority === 'Emergency').length === 0 && (
            <div className="p-10 text-center text-slate-500 font-medium">No immediate actions needed.</div>
          )}
        </div>
      </div>

    </div>
  );
}
