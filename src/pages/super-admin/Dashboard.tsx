import React from 'react';
import { mockStats } from '../../mock/data';
import { DashboardCharts } from '../../components/charts/DashboardCharts';
import { RecentStudiesTable } from '../../components/tables/RecentStudiesTable';
import { Building2, Activity, FileText, AlertTriangle, MonitorDot, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white rounded-xl border shadow-sm p-6 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-sm text-gray-500">{title}</h3>
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && <span className="text-sm font-medium text-green-600">{trend}</span>}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-2 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Super Admin Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: Just now</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Centers" value={mockStats.activeCenters} icon={Building2} color="bg-blue-500" trend="+2 this month" />
        <StatCard title="Today's Studies" value={mockStats.studiesToday} icon={Activity} color="bg-teal-500" trend="+14% vs yesterday" />
        <StatCard title="Pending Reports" value={mockStats.pendingReports} icon={FileText} color="bg-yellow-500" />
        <StatCard title="Critical Cases" value={mockStats.criticalCases} icon={AlertTriangle} color="bg-red-500" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
        <StatCard title="Total Studies" value={mockStats.totalStudies.toLocaleString()} icon={FileText} color="bg-indigo-500" />
        <StatCard title="Pending Verification" value={mockStats.pendingVerification} icon={AlertCircle} color="bg-orange-500" />
        <StatCard title="Online Machines" value={mockStats.onlineMachines} icon={MonitorDot} color="bg-emerald-500" />
        <StatCard title="Failed DICOM Transfers" value={mockStats.failedTransfers} icon={AlertCircle} color="bg-rose-500" />
      </div>

      <DashboardCharts />
      
      <RecentStudiesTable />
    </div>
  );
};

export default Dashboard;
