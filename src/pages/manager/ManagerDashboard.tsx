import { useState } from 'react';
import { useMockDb } from '../../store/useMockDb';
import { exportToCSV } from '../../utils/export';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, Activity, FileCheck2, AlertTriangle, Calendar, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function ManagerDashboard() {
  const { studies, radiologists } = useMockDb();

  const pendingCount = studies.filter(s => s.reportingStatus === 'Pending').length;
  const delayedCount = studies.filter(s => s.tat.includes('Delayed') || parseInt(s.tat) > 24).length; // naive mock check
  const activeCount = studies.filter(s => s.status === 'Active' || s.status === 'Assigned').length;

  const mockTatData = [
    { name: 'Within SLA', count: 145 },
    { name: 'Near SLA', count: 23 },
    { name: 'Delayed', count: delayedCount || 5 },
  ];
  const barColors = ['#00A8CC', '#f59e0b', '#ef4444'];

  const handleExport = () => {
    const exportData = studies.map(s => ({
      'Study ID': s.id,
      'Patient Name': s.patientName,
      'Modality': s.modality,
      'Site': s.siteName,
      'Status': s.status,
      'Reporting Status': s.reportingStatus,
      'TAT Status': s.tat,
      'Priority': s.priority,
      'Assigned To': s.assignedTo || 'Unassigned',
      'Date': new Date(s.createdAt).toLocaleDateString()
    }));
    exportToCSV('manager_report.csv', exportData);
  };

  return (
    <div className="space-y-6 animate-unnathi-fade-in relative max-w-[1600px] mx-auto">
      
      {/* Modern Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-black text-[#0D2461] tracking-tight">Manager Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Operational overview and radiologist workload</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <Input type="date" className="h-8 text-xs w-36 border-0 bg-transparent focus-visible:ring-0 shadow-none font-bold text-slate-600" defaultValue="2026-08-01" />
            <span className="text-slate-300 font-medium text-xs">to</span>
            <Input type="date" className="h-8 text-xs w-36 border-0 bg-transparent focus-visible:ring-0 shadow-none font-bold text-slate-600" defaultValue="2026-09-08" />
          </div>
          <Button onClick={handleExport} className="bg-[#0D2461] hover:bg-[#081840] text-white h-10 px-5 text-sm font-bold rounded-xl shadow-md shadow-[#0D2461]/20">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Premium Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Studies</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{pendingCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Clock className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Workflow</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{activeCount}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Activity className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Radiologists On Duty</p>
              <h3 className="text-3xl font-black text-[#0D2461]">{radiologists.filter(r => r.availability === 'Available').length}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><FileCheck2 className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 shadow-md border border-red-500 relative overflow-hidden group hover:shadow-lg transition-all text-white">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-red-100 uppercase tracking-widest mb-1">Delayed Cases</p>
              <h3 className="text-3xl font-black text-white">{delayedCount}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl text-white backdrop-blur-sm"><AlertTriangle className="w-5 h-5" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Rounded Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-black text-[#0D2461]">TAT Overview</h3>
              <p className="text-xs font-medium text-slate-400">Cases grouped by Turnaround Time SLA</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTatData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }} 
                />
                <Bar dataKey="count" name="Total Cases" radius={[8, 8, 0, 0]}>
                  {mockTatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Premium List Component */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-black text-[#0D2461]">Radiologist Workload</h3>
            <p className="text-xs font-medium text-slate-400">Current case assignment distribution</p>
          </div>
          <div className="p-0 overflow-y-auto max-h-[300px] flex-1">
            {radiologists.map((rad, idx) => {
              const assignedCount = studies.filter(s => s.assignedRadiologistId === rad.id).length;
              return (
                <div key={rad.id} className={`flex justify-between items-center p-4 hover:bg-slate-50 transition-colors ${idx !== radiologists.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D2461] to-[#00A8CC] flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 uppercase">
                      {rad.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{rad.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-wide">{rad.specialization}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide ${rad.availability === 'Available' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                          {rad.availability}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-[#0D2461] leading-none">{assignedCount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Assigned</p>
                  </div>
                </div>
              )
            })}
            {radiologists.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">No radiologists found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
