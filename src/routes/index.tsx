import { createHashRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import BranchesList from '../pages/admin/BranchesList';
import CentresList from '../pages/admin/CentresList';
import UsersList from '../pages/admin/UsersList';
import RadiologistsList from '../pages/admin/RadiologistsList';
import PatientsList from '../pages/patients/PatientsList';
import AddPatient from '../pages/patients/AddPatient';
import StudiesList from '../pages/studies/StudiesList';
import AddStudy from '../pages/studies/AddStudy';
import DicomReceive from '../pages/staff/DicomReceive';
import EmergencyStudies from '../pages/studies/EmergencyStudies';
import StaffDashboard from '../pages/staff/StaffDashboard';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import TatMonitoring from '../pages/manager/TatMonitoring';
import RadiologistDashboard from '../pages/radiologist/RadiologistDashboard';
import RadiologistWorklist from '../pages/radiologist/RadiologistWorklist';
import ViewerShell from '../pages/viewer/ViewerShell';
import VerificationWorklist from '../pages/verifier/VerificationWorklist';
import ReportPreview from '../pages/verifier/ReportPreview';
import AccountantDashboard from '../pages/accountant/AccountantDashboard';
import InvoicesList from '../pages/accountant/InvoicesList';
import AnalyticsDashboard from '../pages/admin/AnalyticsDashboard';
import ReportsGenerator from '../pages/admin/ReportsGenerator';
import SiteList from '../pages/admin/SiteList';
import Utilities from '../pages/admin/Utilities';
import StudyTemplatesList from '../pages/admin/StudyTemplatesList';
import TemplateEditor from '../pages/admin/TemplateEditor';
import ModalityList from '../pages/admin/ModalityList';
import FinanceBilling from '../pages/accountant/FinanceBilling';
import SiteLedger from '../pages/accountant/SiteLedger';
import AdvancedReporting from '../pages/radiologist/AdvancedReporting';
import RoleRoute from '../components/auth/RoleRoute';
import UnnathiDashboard from '../pages/unnathi/UnnathiDashboard';
import SitesList from '../pages/unnathi/SitesList';

import HospitalsList from '../pages/unnathi/HospitalsList';
import GlobalBilling from '../pages/unnathi/GlobalBilling';

export const router = createHashRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: '',
        element: <Navigate to="/login" replace />,
      }
    ],
  },
  {
    path: '/viewer/:id',
    element: <ViewerShell />, // Standalone full-screen layout
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        element: <RoleRoute allowedRoles={['SUPER_ADMIN', 'SITE_ADMIN']} />,
        children: [
          { path: 'unnathi/dashboard', element: <UnnathiDashboard /> },
          { path: 'unnathi/sites', element: <SitesList /> },

          { path: 'unnathi/hospitals', element: <HospitalsList /> },
          { path: 'unnathi/billing', element: <GlobalBilling /> },
        ]
      },
      {
        path: 'admin/dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'admin/analytics',
        element: <AnalyticsDashboard />,
      },
      {
        path: 'admin/reports',
        element: <ReportsGenerator />,
      },
      {
        path: 'admin/utilities',
        element: <Utilities />,
      },
      {
        path: 'utilities/modality',
        element: <ModalityList />,
      },
      {
        path: 'utilities/templates',
        element: <StudyTemplatesList />,
      },
      {
        path: 'utilities/templates/new',
        element: <TemplateEditor />,
      },
      {
        path: 'utilities/templates/:id/edit',
        element: <TemplateEditor />,
      },
      {
        path: 'admin/branches',
        element: <BranchesList />,
      },

      {
        path: 'admin/users',
        element: <UsersList />,
      },
      {
        path: 'admin/radiologists',
        element: <RadiologistsList />,
      },
      {
        path: 'patients',
        element: <PatientsList />,
      },
      {
        path: 'patients/new',
        element: <AddPatient />,
      },
      {
        path: 'studies',
        element: <StudiesList />,
      },
      {
        path: 'studies/new',
        element: <AddStudy />,
      },
      {
        path: 'dicom-receive',
        element: <DicomReceive />,
      },
      {
        path: 'studies/emergency',
        element: <EmergencyStudies />,
      },
      {
        path: 'manager/dashboard',
        element: <ManagerDashboard />,
      },
      {
        path: 'manager/tat',
        element: <TatMonitoring />,
      },
      {
        path: 'staff/dashboard',
        element: <StaffDashboard />,
      },
      {
        path: 'accountant/dashboard',
        element: <AccountantDashboard />,
      },
      {
        path: 'accountant/invoices',
        element: <InvoicesList />,
      },
      {
        path: 'radiologist/dashboard',
        element: <RadiologistDashboard />,
      },
      {
        path: 'radiologist/worklist',
        element: <RadiologistWorklist />,
      },
      {
        path: 'verification',
        element: <VerificationWorklist />,
      },
      {
        path: 'verification/:id/preview',
        element: <ReportPreview />,
      },
      {
        path: 'admin/sites',
        element: <SiteList />,
      },
      {
        path: 'admin/utilities',
        element: <Utilities />,
      },
      {
        path: 'finance/billing',
        element: <FinanceBilling />,
      },
      {
        path: 'finance/ledger',
        element: <SiteLedger />,
      },
      {
        path: 'reporting',
        element: <AdvancedReporting />,
      },
    ],
  },
]);
