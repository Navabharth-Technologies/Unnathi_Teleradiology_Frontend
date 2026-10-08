import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { type Role } from '../types';
import {
  LogOut, User as UserIcon, LayoutDashboard, Building2, Activity,
  Users, FileText, FileSearch, ShieldCheck, IndianRupee, FileCheck2,
  FileImage, ChevronRight, Bell, HeartPulse, Wrench, MonitorDot, Settings
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logoImg from '../assets/unnathi-logo-light.svg';
import { useMockDb } from '../store/useMockDb';
import { ParticleBackground } from '../components/ui/ParticleBackground';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsCleared, setNotificationsCleared] = useState(false);
  const { sites, hospitals, studies, patients } = useMockDb();

  // Generate real notifications based on data
  const derivedNotifications = !notificationsCleared ? studies
    .filter(s => s.priority === 'Emergency' || s.reportingStatus === 'New' || s.reportingStatus === 'Action Needed')
    .slice(0, 5)
    .map(s => {
      const patient = patients.find(p => p.id === s.patientId);
      const hospital = hospitals.find(h => h.id === s.hospitalId);
      return {
        id: s.id,
        title: s.priority === 'Emergency' ? `Emergency Study: ${s.modality}` : `New Study: ${s.bodyPart}`,
        message: `${patient?.name || 'Unknown Patient'} at ${hospital?.name || 'Unknown Hospital'}`,
        time: s.reportingStatus === 'Action Needed' ? 'Action Required' : 'Just now'
      };
    }) : [];

  const unreadCount = derivedNotifications.length;

  let currentLogo = logoImg;
  let siteName = 'Unnathi Teleradiology';
  
  if (user?.hospitalId) {
    const hospital = hospitals.find(h => h.id === user.hospitalId);
    if (hospital?.branding?.logo) {
      currentLogo = hospital.branding.logo;
    } else if (hospital?.parentSiteId) {
      const parentSite = sites.find(s => s.id === hospital.parentSiteId);
      if (parentSite?.branding?.logo) currentLogo = parentSite.branding.logo;
    }

    if (hospital?.branding?.displayName) {
      siteName = hospital.branding.displayName;
    } else if (hospital?.parentSiteId) {
      const parentSite = sites.find(s => s.id === hospital.parentSiteId);
      if (parentSite?.branding?.displayName) siteName = parentSite.branding.displayName;
    }
  } else if (user?.siteId) {
    const site = sites.find(s => s.id === user.siteId);
    if (site?.branding?.logo) currentLogo = site.branding.logo;
    if (site?.branding?.displayName) siteName = site.branding.displayName;
  }

  useEffect(() => {
    let faviconUrl = '/favicon.png?v=3';

    if (user?.hospitalId) {
      const hospital = hospitals.find(h => h.id === user.hospitalId);
      if (hospital?.branding?.favicon) {
        faviconUrl = hospital.branding.favicon;
      } else if (hospital?.parentSiteId) {
        const parentSite = sites.find(s => s.id === hospital.parentSiteId);
        if (parentSite?.branding?.favicon) faviconUrl = parentSite.branding.favicon;
      }
    } else if (user?.siteId) {
      const site = sites.find(s => s.id === user.siteId);
      if (site?.branding?.favicon) faviconUrl = site.branding.favicon;
    }

    document.title = siteName;
    const link: HTMLLinkElement = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  }, [user, sites, hospitals, siteName]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const getNavLinks = () => {
    switch (currentRole) {
      case 'SUPER_ADMIN': return [
        { type: 'header', label: 'Platform' },
        { label: 'Dashboard', path: '/unnathi/dashboard', icon: LayoutDashboard },
        { label: 'Teleradiology Companies', path: '/unnathi/sites', icon: Building2 },
        { label: 'Independent Hospitals', path: '/unnathi/hospitals?type=independent', icon: HeartPulse },
        { label: 'Company Hospitals', path: '/unnathi/hospitals?type=company', icon: Building2 },

        { type: 'header', label: 'Reporting Operations' },
        { label: 'Global Worklist', path: '/reporting', icon: FileSearch },
        { label: 'Radiologists', path: '/admin/radiologists', icon: Users },
        { label: 'Reporting Analytics', path: '/admin/analytics', icon: Activity },

        { type: 'header', label: 'Users & Access' },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Roles & Permissions', path: '/admin/roles', icon: ShieldCheck },

        { type: 'header', label: 'Commercial' },
        { label: 'Subscriptions & Plans', path: '/commercial/subscriptions', icon: FileCheck2 },
        { label: 'Billing & Invoices', path: '/finance/billing', icon: IndianRupee },
        { label: 'Organization Ledger', path: '/finance/ledger', icon: FileText },

        { type: 'header', label: 'Platform Management' },
        { label: 'Storage & Usage', path: '/platform/storage', icon: MonitorDot },
        { label: 'Audit Logs', path: '/platform/audit', icon: FileSearch },
        { label: 'System Settings', path: '/platform/settings', icon: Settings },
        { label: 'Utilities', path: '/utilities/templates', icon: Wrench },
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
    <div className="min-h-screen flex bg-[#F8FAFC] relative overflow-hidden font-sans">
      
      {/* ── Soft Clinical Ambient Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#F8FAFC]">
        <ParticleBackground />
        
        {/* Dynamic glowing orbs (Light theme) */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-blue-100/50 to-transparent blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-cyan-100/40 to-transparent blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ y: [0, 40, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[40%] w-[500px] h-[500px] bg-indigo-100/30 blur-[120px] rounded-full" 
        />

        {/* Floating Ambient Particles (Subtle for Workspace) */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`app-particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              background: ['#2563EB', '#19B5C5', '#10A878'][i % 3],
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.2 + 0.05
            }}
            animate={{
              y: [0, -100 - Math.random() * 100],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0, Math.random() * 0.3 + 0.1, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          />
        ))}

        {/* Animated Grid (Light theme) */}
        <motion.div 
          animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-[0.3]"
          style={{ 
            backgroundImage: `linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(1000px) rotateX(10deg) scale(1.1)',
            transformStyle: 'preserve-3d'
          }}
        />
      </div>

      {/* ── Premium Clinical Sidebar ────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
        className="w-[280px] flex flex-col shrink-0 bg-gradient-to-b from-[#102A43] to-[#0A1A2A] text-white shadow-[10px_0_30px_rgba(16,42,67,0.15)] z-30 relative group"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
        
        {/* Logo Area */}
        <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 border-b border-white/10 relative z-10">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring" }}>
            <img
              src={currentLogo}
              alt={siteName}
              className="w-48 object-contain"
              style={{ maxHeight: '50px' }}
            />
          </motion.div>
        </div>

        {/* Role indicator */}
        <div className="px-6 pt-6 pb-2 relative z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">
            Navigation
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6 relative z-10 custom-scrollbar">
          {navLinks.map((link, idx) => {
            if (link.type === 'header') {
              return (
                <div key={`header-${idx}`} className="px-4 pt-6 pb-2 mt-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]/80">
                    {link.label}
                  </div>
                </div>
              );
            }
            const Icon = link.icon!;
            const fullPath = location.pathname + location.search;
            const isActive = fullPath === link.path || location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                to={link.path!}
                className={cn(
                  'group flex items-center px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-300 relative overflow-hidden',
                  isActive 
                    ? 'text-white shadow-md' 
                    : 'text-[#CBD5E1] hover:text-white hover:bg-white/10'
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active" 
                    className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#19B5C5] opacity-90 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={cn(
                  'flex items-center justify-center mr-3 transition-colors duration-300 relative z-10',
                  isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'
                )}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1 relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 relative z-10">
          <div className="flex items-center space-x-3 p-2.5 rounded-xl transition-colors hover:bg-white/10 group cursor-pointer border border-transparent hover:border-white/10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/10 text-white shadow-inner border border-white/20 group-hover:bg-white/20 transition-colors">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] font-semibold text-[#94A3B8] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-20">
        
        {/* Bright Clean Header */}
        <header className="h-[76px] bg-white/90 backdrop-blur-xl shrink-0 flex items-center justify-between px-8 border-b border-[#E2E8F0] shadow-sm relative z-20">
          
          {/* Context / Role */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-1.5 rounded-full shadow-inner">
              <div className="w-2 h-2 rounded-full bg-[#10A878] shadow-[0_0_8px_rgba(16,168,120,0.5)]" />
              <span className="font-bold text-[11px] text-[#334155] uppercase tracking-widest">
                {currentRole.replace('_', ' ')}
              </span>
              
              {user?.role === 'SUPER_ADMIN' && currentRole !== 'SUPER_ADMIN' && (
                <button 
                  onClick={() => {
                    setRole('SUPER_ADMIN');
                    useAuthStore.getState().setSelectedHospitalId(null);
                    window.location.href = '/unnathi/hospitals';
                  }}
                  className="ml-2 text-[10px] bg-[#102A43] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider hover:bg-[#2563EB] transition-all shadow-sm"
                >
                  Return
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
            
            {/* Notification */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-full text-[#64748B] hover:text-[#102A43] hover:bg-[#F1F5F9] transition-all"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E76F51] border-2 border-white" />
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
                      <h3 className="font-black text-[#102A43] text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-[#19B5C5]/10 text-[#19B5C5] px-2 py-0.5 rounded-full">{unreadCount} New</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {derivedNotifications.length > 0 ? (
                        derivedNotifications.map(n => (
                          <div key={n.id} className="p-4 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors cursor-pointer group">
                            <p className="text-xs font-semibold text-[#334155] group-hover:text-[#102A43]">{n.title}</p>
                            <p className="text-[11px] text-[#64748B] mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-[#94A3B8] font-bold mt-1">{n.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-[#94A3B8]">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs font-semibold">No new notifications</p>
                        </div>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] text-center">
                        <button 
                          onClick={() => {
                            setNotificationsCleared(true);
                            setShowNotifications(false);
                          }}
                          className="text-[11px] font-black uppercase tracking-widest text-[#2563EB] hover:text-[#1D4ED8]"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Header Profile & Logout */}
            <div className="flex items-center space-x-4 pl-6 border-l border-[#E2E8F0]">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <p className="text-[13px] font-black text-[#102A43]">{user?.name}</p>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#19B5C5]">
                  Active
                </span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#102A43] to-[#2563EB] text-white font-black text-sm shadow-md border-2 border-white">
                {user?.name?.[0] || 'U'}
              </div>
              <button
                onClick={() => logout()}
                title="Logout"
                className="flex items-center gap-2 px-3 py-1.5 ml-2 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300 font-bold text-[13px] shadow-sm group"
              >
                <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Workspace */}
        <div className="flex-1 overflow-auto bg-transparent relative z-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full h-full">
            <div className="p-4 md:p-8 min-h-full">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
