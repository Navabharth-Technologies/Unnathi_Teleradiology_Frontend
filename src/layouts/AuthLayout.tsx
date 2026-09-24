import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

import { useMockDb } from '../store/useMockDb';

export default function AuthLayout() {
  const { isAuthenticated, currentRole, user } = useAuthStore();
  const { hospitals } = useMockDb();

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    switch (currentRole) {
      case 'SUPER_ADMIN':
      case 'SITE_ADMIN':
      case 'CENTER_ADMIN':
        return <Navigate to="/unnathi/dashboard" replace />;
      case 'HOSPITAL_ADMIN':
        const hospital = hospitals.find(h => h.id === user?.hospitalId);
        if (hospital?.organizationType === 'COMPANY_MANAGED') {
          return <Navigate to="/studies" replace />;
        }
        return <Navigate to="/admin/dashboard" replace />;
      case 'MANAGER':
        return <Navigate to="/manager/dashboard" replace />;
      case 'STAFF':
      case 'TECHNICIAN':
        return <Navigate to="/staff/dashboard" replace />;
      case 'ACCOUNTANT':
        return <Navigate to="/accountant/dashboard" replace />;
      case 'RADIOLOGIST':
        return <Navigate to="/radiologist/dashboard" replace />;
      case 'VERIFIER':
        return <Navigate to="/verification" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Outlet />
    </div>
  );
}
