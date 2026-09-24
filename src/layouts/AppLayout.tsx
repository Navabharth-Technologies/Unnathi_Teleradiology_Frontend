import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { type Role } from '../types';
import {
  LogOut, User as UserIcon, LayoutDashboard, Building2, Activity,
  Users, FileText, FileSearch, ShieldCheck, IndianRupee, FileCheck2,
  FileImage, ChevronRight, Bell, HeartPulse, Wrench
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logoImg from '../assets/unnathi-logo-light.svg';
import { useMockDb } from '../store/useMockDb';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ROLES: Role[] = [
  'SUPER_ADMIN', 'SITE_ADMIN', 'CENTER_ADMIN', 'HOSPITAL_ADMIN',
  'MANAGER', 'STAFF', 'ACCOUNTANT', 'RADIOLOGIST', 'VERIFIER', 'TECHNICIAN', 'DOCTOR'
];

const ROLE_BADGE: Partial<Record<Role, { bg: string; text: string }>> = {
  'SUPER_ADMIN':  { bg: 'bg-purple-100',  text: 'text-purple-700' },
  'HOSPITAL_ADMIN': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'MANAGER':      { bg: 'bg-blue-100',    text: 'text-blue-700' },
  'STAFF':        { bg: 'bg-teal-100',    text: 'text-teal-700' },
  'ACCOUNTANT':   { bg: 'bg-amber-100',   text: 'text-amber-700' },
  'RADIOLOGIST':  { bg: 'bg-indigo-100',  text: 'text-indigo-700' },
  'VERIFIER':     { bg: 'bg-green-100',   text: 'text-green-700' },
};


export default function AppLayout() {
  const { isAuthenticated, currentRole, user, setRole, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const getNavLinks = () => {
    switch (currentRole) {
      case 'SUPER_ADMIN': return [
        { label: 'Unnathi Dashboard', path: '/unnathi/dashboard', icon: LayoutDashboard },
        { label: 'Sites', path: '/unnathi/sites', icon: Building2 },
        { label: 'Hospitals',         path: '/unnathi/hospitals', icon: HeartPulse },
        { label: 'Global Reporting',  path: '/reporting',         icon: FileSearch },
        { label: 'Global Billing',    path: '/unnathi/billing', icon: IndianRupee },
        { label: 'Site Ledger',       path: '/finance/ledger', icon: FileText },
        { label: 'Finance Billing',   path: '/finance/billing', icon: IndianRupee },
        { label: 'Global Users',      path: '/admin/users',       icon: Users },
        { label: 'Radiologists',      path: '/admin/radiologists',icon: Users },
        { label: 'Utilities',         path: '/utilities/templates', icon: Wrench },
      ];
      case 'SITE_ADMIN': return [
        { label: 'Company Dashboard', path: '/unnathi/dashboard', icon: LayoutDashboard },
        { label: 'Global Reporting', path: '/reporting',         icon: FileText },
        { label: 'Hospitals',        path: '/unnathi/hospitals', icon: HeartPulse },
        { label: 'Billing & Accounts', path: '/unnathi/billing', icon: IndianRupee },
        { label: 'Site Ledger',       path: '/finance/ledger', icon: FileText },
        { label: 'Invoices',   path: '/finance/billing', icon: IndianRupee },
        { label: 'Studies',          path: '/studies',           icon: FileSearch },
        { label: 'Users',            path: '/admin/users',       icon: Users },
        { label: 'Radiologists',     path: '/admin/radiologists',icon: Users },
        { label: 'Utilities',        path: '/utilities/templates', icon: Wrench },
      ];

      case 'HOSPITAL_ADMIN': {
        const hospital = useMockDb.getState().hospitals.find(h => h.id === user?.hospitalId);
        if (hospital?.organizationType === 'COMPANY_MANAGED') {
          return [
            { label: 'DICOM Receive', path: '/dicom-receive', icon: FileImage },
            { label: 'Studies Dashboard', path: '/studies', icon: FileSearch },
          ];
        }
        return [
          { label: 'Dashboard',    path: '/admin/dashboard',   icon: LayoutDashboard },
          { label: 'Analytics',    path: '/admin/analytics',   icon: Activity },
          { label: 'Studies',      path: '/studies',           icon: FileSearch },
          { label: 'Reports',      path: '/admin/reports',     icon: FileText },
          { label: 'Users',        path: '/admin/users',       icon: Users },
          { label: 'Utilities',    path: '/utilities/templates', icon: Wrench },
        ];
      }
      case 'MANAGER': return [
        { label: 'Dashboard',      path: '/manager/dashboard', icon: LayoutDashboard },
        { label: 'TAT Monitoring', path: '/manager/tat',       icon: FileSearch },
        { label: 'Emergency',      path: '/studies/emergency', icon: ShieldCheck },
        { label: 'Studies',        path: '/studies',           icon: FileSearch },
        { label: 'Radiologists',   path: '/admin/radiologists',icon: FileText },
      ];
      case 'STAFF': return [
        { label: 'Dashboard',    path: '/staff/dashboard', icon: LayoutDashboard },
        { label: 'DICOM Receive',path: '/dicom-receive',   icon: FileImage },
        { label: 'Patients',     path: '/patients',        icon: Users },
        { label: 'Studies',      path: '/studies',         icon: FileSearch },
        { label: 'Emergency',    path: '/studies/emergency',icon: ShieldCheck },
      ];
      case 'ACCOUNTANT': return [
        { label: 'Dashboard', path: '/accountant/dashboard', icon: LayoutDashboard },
        { label: 'Billing',   path: '/finance/billing',      icon: IndianRupee },
        { label: 'Site Ledger', path: '/finance/ledger',     icon: FileText },
        { label: 'Invoices',  path: '/accountant/invoices',  icon: IndianRupee },
      ];
      case 'RADIOLOGIST': return [
        { label: 'Dashboard',   path: '/radiologist/dashboard', icon: LayoutDashboard },
        { label: 'Reporting',   path: '/reporting',             icon: FileSearch },
        { label: 'My Worklist', path: '/radiologist/worklist',  icon: FileSearch },
      ];
      case 'VERIFIER': return [
        { label: 'Verification', path: '/verification', icon: FileCheck2 },
      ];
      default: return [];
    }
  };

  const navLinks = getNavLinks();
  const badge = ROLE_BADGE[currentRole as Role] || { bg: 'bg-slate-100', text: 'text-slate-700' };

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f4f9' }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className="w-64 flex flex-col shrink-0 shadow-2xl animate-unnathi-slide"
        style={{
          background: 'linear-gradient(175deg, #0D2461 0%, #081840 55%, #061230 100%)',
          borderRight: '1px solid rgba(0,168,204,0.15)',
        }}
      >
        {/* Logo Area */}
        <div
          className="flex flex-col items-center justify-center pt-6 pb-5 px-4"
          style={{ borderBottom: '1px solid rgba(0,168,204,0.2)' }}
        >
          <img
            src={logoImg}
            alt="Unnathi Teleradiology"
            className="w-44 object-contain animate-float"
          />
        </div>

        {/* Role indicator */}
        <div className="px-4 pt-4 pb-2">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3 px-1"
            style={{ color: 'rgba(0,168,204,0.7)', letterSpacing: '0.15em' }}>
            Navigation
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4 stagger-children">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'nav-item-hover group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-unnathi-fade-in',
                  isActive ? 'nav-item-active' : 'text-slate-300/80'
                )}
              >
                <span className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-lg mr-3 transition-all duration-200',
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10'
                )}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">{link.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-cyan-400 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer — User Info */}
        <div
          className="p-4"
          style={{ borderTop: '1px solid rgba(0,168,204,0.15)' }}
        >
          <div className="flex items-center space-x-3 p-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #00A8CC, #0D2461)' }}>
              <UserIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="h-16 bg-white shrink-0 flex items-center justify-between px-6"
          style={{ borderBottom: '1px solid #e8edf5', boxShadow: '0 1px 8px rgba(13,36,97,0.06)' }}>

          {/* Page title / breadcrumb */}
          <div className="flex items-center space-x-2">
            <div
              className="h-8 w-1 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #00A8CC, #0D2461)' }}
            />
            <span className="font-bold text-lg flex items-center gap-3" style={{ color: '#0D2461' }}>
              {currentRole}
              
              {user?.role === 'SUPER_ADMIN' && currentRole !== 'SUPER_ADMIN' && (
                <button 
                  onClick={() => {
                    setRole('SUPER_ADMIN');
                    useAuthStore.getState().setSelectedHospitalId(null);
                    window.location.href = '/unnathi/hospitals';
                  }}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold hover:bg-purple-200 transition-colors"
                >
                  Return to Super Admin
                </button>
              )}
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3">

            {/* Bell notification */}
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-[#00A8CC] hover:bg-[#00A8CC]/10 transition-all duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>


            {/* User avatar */}
            <div className="flex items-center space-x-2 pl-3"
              style={{ borderLeft: '1px solid #e8edf5' }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #00A8CC 0%, #0D2461 100%)' }}
              >
                {user?.name?.[0] || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold" style={{ color: '#0D2461' }}>{user?.name}</p>
                <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-full', badge.bg, badge.text)}>
                  {currentRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
