import React from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, IndianRupee, Activity, Users } from 'lucide-react';

const revenueData = [
  { name: 'Jan', revenue: 400000, expenses: 240000 },
  { name: 'Feb', revenue: 300000, expenses: 139800 },
  { name: 'Mar', revenue: 200000, expenses: 980000 },
  { name: 'Apr', revenue: 278000, expenses: 390800 },
  { name: 'May', revenue: 189000, expenses: 480000 },
  { name: 'Jun', revenue: 239000, expenses: 380000 },
  { name: 'Jul', revenue: 349000, expenses: 430000 },
];

const TATData = [
  { name: 'Mon', hours: 4.2 },
  { name: 'Tue', hours: 3.8 },
  { name: 'Wed', hours: 4.5 },
  { name: 'Thu', hours: 5.1 },
  { name: 'Fri', hours: 3.9 },
  { name: 'Sat', hours: 2.5 },
  { name: 'Sun', hours: 2.1 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: any) => (
  <div className="bg-white rounded-xl border shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'} flex items-center`}>
        <TrendingUp className={`w-4 h-4 mr-1 ${!trendUp && 'rotate-180'}`} />
        {trend}
      </span>
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

const Analytics = () => {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Center Analytics</h1>
        <div className="flex gap-2">
          <select className="border border-gray-300 rounded-md p-2 text-sm focus:ring-teal-500 bg-white shadow-sm">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="₹24,50,000" icon={IndianRupee} trend="+12.5%" trendUp={true} />
        <StatCard title="Study Volume" value="1,432" icon={Activity} trend="+5.2%" trendUp={true} />
        <StatCard title="New Patients" value="892" icon={Users} trend="-2.4%" trendUp={false} />
        <StatCard title="Avg Turnaround (TAT)" value="3.8 hrs" icon={TrendingUp} trend="-15%" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TAT Chart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Turnaround Time (TAT)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TATData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
