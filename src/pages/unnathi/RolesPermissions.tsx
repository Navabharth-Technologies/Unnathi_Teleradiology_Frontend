import React from 'react';
import { Shield, Settings2, Plus, Search } from 'lucide-react';
import { useMockDb } from '../../store/useMockDb';

export default function RolesPermissions() {
  const { users } = useMockDb();

  // Extract unique roles from real-time user data
  const rolesMap = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let activeRoles = Object.entries(rolesMap).map(([role, count]) => ({
    name: role,
    type: 'System Built-in',
    users: count,
    status: 'Active'
  }));

  // Ensure SUPER_ADMIN always shows if no users exist
  if (activeRoles.length === 0) {
    activeRoles = [{ name: 'SUPER_ADMIN', type: 'System Built-in', users: 1, status: 'Active' }];
  }
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-unnathi-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0D2461]">Roles & Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system roles and access control lists</p>
        </div>
        <button className="bg-[#0D2461] hover:bg-[#0D2461]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Role
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search roles..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0D2461] focus:ring-1 focus:ring-[#0D2461]" />
          </div>
          <button className="text-[#0D2461] text-sm font-medium flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            <Settings2 className="w-4 h-4 mr-2" /> Filter
          </button>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Users</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {activeRoles.map(role => (
              <tr key={role.name} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap font-bold text-[#0D2461] flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-slate-400" /> {role.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{role.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-900">{role.users} Active Users</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{role.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit Permissions</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
