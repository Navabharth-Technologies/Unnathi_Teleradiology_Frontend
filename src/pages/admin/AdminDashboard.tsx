import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Building2, Activity, Users, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LiveStudyTrend } from '../../components/dashboard/LiveStudyTrend';

export default function AdminDashboard() {
  const { patients, studies, users, radiologists, hospitals } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Filter data for this specific hospital
  const hospitalPatients = patients.filter(p => p.hospitalId === user?.hospitalId);
  const hospitalStudies = studies.filter(s => s.hospitalId === user?.hospitalId);
  const hospitalUsers = users.filter(u => u.hospitalId === user?.hospitalId);
  
  // Find radiologists assigned to this hospital
  const hospitalRadiologists = radiologists.filter(r => r.assignedHospitals.includes(user?.hospitalId || ''));

  return (
    <div className="space-y-6 animate-unnathi-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          Hospital Dashboard
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1 pl-7">
          Overview of hospital operations and performance metrics
        </p>
      </div>
      
      <LiveStudyTrend />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        <div 
          className="bg-card rounded-lg p-5 border border-border relative overflow-hidden shadow-sm"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Wallet Balance</p>
              <h3 className={`text-2xl font-bold ${((user?.hospitalId ? hospitals.find(h => h.id === user.hospitalId)?.walletBalance : 0) || 0) < 0 ? 'text-destructive' : 'text-success'}`}>
                ₹ {(user?.hospitalId ? hospitals.find(h => h.id === user.hospitalId)?.walletBalance : 0) || 0}
              </h3>
            </div>
            <div className="p-2.5 bg-success/10 rounded-md text-success">
              <span className="font-bold text-lg">₹</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-semibold text-slate-500">Available Funds</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (user?.hospitalId) {
                  const currentBalance = hospitals.find(h => h.id === user.hospitalId)?.walletBalance || 0;
                  useMockDb.getState().updateHospital(user.hospitalId, { walletBalance: currentBalance + 5000 });
                }
              }}
              className="px-2 py-1 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              + Add Funds
            </button>
          </div>
        </div>

        <div 
          className="bg-card rounded-lg p-5 border border-border relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/patients')}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Patients</p>
              <h3 className="text-2xl font-bold text-primary">{hospitalPatients.length}</h3>
            </div>
            <div className="p-2.5 bg-info/10 rounded-md text-info"><Users className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-semibold text-info mt-4">
            Manage Patients <ChevronRight className="w-4 h-4 ml-1 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-1 transition-all" />
          </div>
        </div>
        
        <div 
          className="bg-card rounded-lg p-5 border border-border relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/studies')}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Studies</p>
              <h3 className="text-2xl font-bold text-primary">{hospitalStudies.length}</h3>
            </div>
            <div className="p-2.5 bg-success/10 rounded-md text-success"><Activity className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-semibold text-success mt-4">
            Manage Studies <ChevronRight className="w-4 h-4 ml-1 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-1 transition-all" />
          </div>
        </div>

        <div 
          className="bg-card rounded-lg p-5 border border-border relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/admin/users')}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Staff Members</p>
              <h3 className="text-2xl font-bold text-primary">{hospitalUsers.length}</h3>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-md text-primary"><Users className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-semibold text-primary mt-4">
            Manage Staff <ChevronRight className="w-4 h-4 ml-1 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-1 transition-all" />
          </div>
        </div>

        <div 
          className="bg-card rounded-lg p-5 border border-border relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/admin/radiologists')}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Radiologists</p>
              <h3 className="text-2xl font-bold text-primary">{hospitalRadiologists.length}</h3>
            </div>
            <div className="p-2.5 bg-warning/10 rounded-md text-warning"><FileText className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-semibold text-warning mt-4">
            Manage Radiologists <ChevronRight className="w-4 h-4 ml-1 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}
