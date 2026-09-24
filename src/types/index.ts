export type Status = 'Active' | 'Inactive';

export interface SiteSettings {
  username?: string;
  password?: string;
  headerSpace?: number;
  
  // Permissions & Settings
  globalHeaderSpace?: boolean;
  emergency?: boolean;
  border?: boolean;
  viewImages?: boolean;
  deleteStudy?: boolean;
  shareStudy?: boolean;
  template?: boolean;
  enablePrepaid?: boolean;
  headerOnlyOnPdf?: boolean;
  shareLinkNewStudy?: boolean;
  demographyAllPages?: boolean;
  billingPage?: boolean;
  transactionHistory?: boolean;
  downloadInFinalize?: boolean;
  allowStudiesWithoutImages?: boolean;
  
  // Reports & Communication
  keyImagesOnFinal?: boolean;
  sendReportByEmail?: boolean;
  qrInReport?: boolean;
  
  // File Uploads
  headerUrl?: string;
  footerUrl?: string;
  brochureForNewStudy?: boolean;
}

export interface Site {
  id: string;
  name: string;
  code: string;
  legalName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  status: Status;
  supportedModalities?: string[];
  settings?: SiteSettings;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export type ServiceType = 'CT' | 'MRI' | 'X-Ray' | 'CR' | 'DR' | 'Ultrasound' | 'Mammography' | 'PET' | 'PET-CT' | 'Other';
export type AccountType = 'Prepaid' | 'Postpaid';

export type OrganizationType = 'COMPANY_MANAGED' | 'UNNATHI_MANAGED';

export interface Hospital {
  id: string;
  name: string;
  code: string;
  organizationType: OrganizationType;

  parentSiteId?: string | null;
  adminOrganizationId?: string | null;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  status: Status;
  supportedModalities?: string[];
  verifierId?: string | null;
  settings?: SiteSettings;
  modalityCommissions?: Record<string, number>;
  accountType?: AccountType;
  walletBalance?: number;
  paymentFrequency?: 'Daily' | 'Weekly' | 'Monthly';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export type Role = 'SUPER_ADMIN' | 'SITE_ADMIN' | 'HOSPITAL_ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'STAFF' | 'RADIOLOGIST' | 'DOCTOR' | 'PATIENT' | 'ACCOUNTANT' | 'VERIFIER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  siteId?: string | null;

  hospitalId?: string | null;
  status: Status;
  lastLogin?: string;
  createdAt?: string;
}

export interface Radiologist {
  id: string;
  userId: string;
  name: string;
  registrationId: string;
  qualification?: string;
  specialization: string;
  availability: 'Available' | 'Unavailable';
  assignedHospitals: string[]; // Hospital IDs
  siteId?: string | null; // Null if global, otherwise belongs to a Teleradiology Site
  status: Status;
}

export type Gender = 'Male' | 'Female' | 'Other';

export interface Patient {
  id: string;
  uhid: string;
  name: string;
  dob: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  referringDoctor: string;
  hospitalId: string;
  registrationDate: string;
}

export type StudyStatus = 'New' | 'Active' | 'Unread' | 'Pending' | 'Draft' | 'Review' | 'Action Needed' | 'Final' | 'Cancelled';
export type Priority = 'Routine' | 'Urgent' | 'Emergency' | 'Follow Up';

export interface Study {
  id: string;
  patientId: string;
  caseNumber: string;
  accessionNumber: string;
  hospitalId: string;
  modality: ServiceType;
  studyDescription: string;
  bodyPart: string;
  priority: Priority;
  studyDate: string;
  clinicalHistory?: string;
  additionalInfo?: string[];
  referringPhysician?: string;
  assignedRadiologistId?: string;
  status: StudyStatus;
  reportingStatus: 'Unread' | 'Pending' | 'Draft' | 'Review' | 'Action Needed' | 'Final' | 'Verified' | 'Dispatched';
  paymentStatus?: 'Unpaid' | 'Partial' | 'Paid';
  superAdminPaymentStatus?: 'Unpaid' | 'Paid';
  reportText?: string;
  tat: string;
  assignedAt?: string;
  finalizedAt?: string;
  historyText?: string;
  historyAttachment?: string;
  series?: {
    id: string;
    name: string;
    imageCount: number;
    previewUrl: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  studyId: string;
  patientId: string;
  hospitalId: string;
  invoiceNumber: string;
  amount: number;
  status: 'Unpaid' | 'Partial' | 'Paid';
  date: string;
  dueDate: string;
}

export interface UtilityTemplate {
  id: string;
  hospitalId: string; // The hospital this template belongs to
  modality: string;
  studyName: string;
  price?: number;
  templateContent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModalityConfig {
  id: string;
  code: number | string;
  name: string;
  description: string;
}
