import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useMockDb } from '../../store/useMockDb';
import { useAuthStore } from '../../store/useAuthStore';
import { Building2, Activity, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { LiveStudyTrend } from '../../components/dashboard/LiveStudyTrend';

export default function AdminDashboard() {
  const { patients, studies, users, radiologists } = useMockDb();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Filter data for this specific hospital
  const hospitalPatients = patients.filter(p => p.hospitalId === user?.hospitalId);
  const hospitalStudies = studies.filter(s => s.hospitalId === user?.hospitalId);
  const hospitalUsers = users.filter(u => u.hospitalId === user?.hospitalId);
  
  // Find radiologists assigned to this hospital
  const hospitalRadiologists = radiologists.filter(r => r.assignedHospitals.includes(user?.hospitalId || ''));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Hospital Dashboard</h1>
      
      <LiveStudyTrend />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          onClick={() => navigate('/patients')}
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Patients</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{hospitalPatients.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Users className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-bold text-[#00A8CC]">
            Click to view <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          onClick={() => navigate('/studies')}
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Studies</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{hospitalStudies.length}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Activity className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-bold text-[#00A8CC]">
            Click to manage <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </div>
        </div>

        <div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          onClick={() => navigate('/admin/users')}
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Staff Members</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{hospitalUsers.length}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Users className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-bold text-[#00A8CC]">
            Click to manage <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </div>
        </div>

        <div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          onClick={() => navigate('/admin/radiologists')}
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Radiologists</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{hospitalRadiologists.length}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><FileText className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center text-xs font-bold text-[#00A8CC]">
            Click to manage <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
