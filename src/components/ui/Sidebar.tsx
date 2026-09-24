import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, FileText, MonitorDot, Activity, Settings, BarChart3, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../app/store/useAuthStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'CENTER_ADMIN'] },
  { name: 'Patients', href: '/patients', icon: Users, roles: ['SUPER_ADMIN', 'CENTER_ADMIN', 'RECEPTIONIST'] },
  { name: 'Studies (RIS)', href: '/studies', icon: Activity, roles: ['SUPER_ADMIN', 'RADIOLOGIST', 'CENTER_ADMIN', 'RECEPTIONIST'] },
  { name: 'PACS Viewer', href: '/pacs', icon: MonitorDot, roles: ['SUPER_ADMIN', 'RADIOLOGIST', 'CENTER_ADMIN'] },
  { name: 'Reporting', href: '/reports', icon: FileText, roles: ['SUPER_ADMIN', 'RADIOLOGIST'] },
  { name: 'Verification', href: '/verification', icon: FileText, roles: ['SUPER_ADMIN', 'VERIFIER'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'CENTER_ADMIN'] },
  { name: 'Billing', href: '/billing', icon: CreditCard, roles: ['SUPER_ADMIN', 'CENTER_ADMIN', 'RECEPTIONIST'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'CENTER_ADMIN'] },
];

export const Sidebar = () => {
  const { user } = useAuthStore();

  const filteredNav = navigation.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex flex-col w-64 bg-white border-r h-full">
      <div className="flex items-center justify-center h-16 border-b px-4">
        <span className="text-xl font-bold text-teal-700 tracking-tight">K-PACS CLOUD</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {filteredNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs font-medium text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
