export type Status = 'Active' | 'Inactive' | 'Blocked' | 'Trial' | 'Suspended' | 'Expired';

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
  name: string; // Organization Name
  code: string; // Organization Code
  organizationType?: string;
  legalName?: string;
  gstin?: string;
  pan?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string; // Address Line 1
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  timeZone?: string;
  dateFormat?: string;
  status: Status; // Status
  goLiveDate?: string;
  notes?: string;
  supportedModalities?: string[];
  settings?: SiteSettings;
  subscription?: SubscriptionSettings;
  reportingWorkflow?: ReportingWorkflow;
  branding?: BrandingSettings;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface SubscriptionSettings {
  plan: 'Trial' | 'Basic' | 'Standard' | 'Professional' | 'Enterprise';
  billingCycle: 'Monthly' | 'Quarterly' | 'Annual' | 'Custom';
  startDate: string;
  expiryDate: string;
  maxCentres: number;
  maxUsers: number;
  maxRadiologists: number;
  storageLimit: string;
  monthlyStudyLimit?: number | null;
  dicomRetention: '12 months' | '24 months' | '60 months' | 'Custom';
  reportRetention: string;
  priceModel: 'Flat subscription' | 'Per study' | 'Hybrid';
  perStudyRate?: number;
  taxPercent?: number;
  creditLimit?: number;
  gracePeriod?: number;
  autoSuspend: boolean;
}

export interface BrandingSettings {
  displayName: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  accentColor?: string;
  headerLogo?: string;
  reportHeaderText?: string;
  reportFooterText?: string;
  supportEmail?: string;
  supportPhone?: string;
  portalSubdomain?: string;
  customDomain?: string;
  emailSenderName?: string;
}

export interface ReportingWorkflow {
  assignmentMode: 'Manual' | 'Auto assignment' | 'Modality-based' | 'Subspecialty-based' | 'Round-robin';
  whoCanAssign: 'Organization Admin' | 'Reporting Coordinator' | 'Super Admin';
  casePriorities: string[];
  tatClockStart: 'DICOM receipt' | 'Study marked complete' | 'Assignment time';
  tatPauseRules: string[];
  radiologistAcceptance: boolean;
  reportingStatuses: string[];
  criticalFindingWorkflow: boolean;
  queryWorkflow: boolean;
  addendum: boolean;
  secondReadQa: boolean;
  autoLockFinalReport: boolean;
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
  pinCode?: string;
  status: Status;
  supportedModalities?: string[];
  
  dicomAeTitle?: string;
  dicomCallingAe?: string;
  dicomIp?: string;
  dicomPort?: string;
  
  uploadMethods?: string[];
  defaultReportingProvider?: string;
  defaultTatProfile?: string;
  reportBranding?: string;
  billingProfile?: string;
  
  verifierId?: string | null;
  settings?: SiteSettings;
  subscription?: SubscriptionSettings;
  reportingWorkflow?: ReportingWorkflow;
  branding?: BrandingSettings;
  modalityCommissions?: Record<string, number>;
  accountType?: AccountType;
  walletBalance?: number;
  paymentFrequency?: 'Daily' | 'Weekly' | 'Monthly';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export type Role = 'SUPER_ADMIN' | 'SITE_ADMIN' | 'HOSPITAL_ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'STAFF' | 'RADIOLOGIST' | 'DOCTOR' | 'PATIENT' | 'ACCOUNTANT' | 'VERIFIER';

export type UserStatus = 'Invite Pending' | 'Active' | 'Locked' | 'Disabled' | 'Inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  siteId?: string | null;
  hospitalId?: string | null;
  status: UserStatus | Status;
  loginMode?: 'Password' | 'OTP' | 'SSO';
  password?: string;
  mfaEnabled?: boolean;
  allowedCentres?: string[];
  lastLogin?: string;
  createdAt?: string;
}

export interface Radiologist {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  registrationId: string;
  qualification: string;
  subspecialties?: string[];
  modalities: string[];
  allowedOrganizations: string[];
  allowedCentres?: string[];
  signatureUrl: string;
  stampText?: string;
  availability: 'Online' | 'Offline' | 'On Leave' | 'Scheduled';
  maxConcurrentCases?: number;
  tatEligibility?: string;
  reportingRate?: number;
  assignedHospitals: string[]; // Keep for backward compatibility/quick access
  siteId?: string | null;
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
  studyUid?: string; // Newly added
  hospitalId: string;
  organizationId?: string; // Newly added (Source)
  modality: ServiceType;
  studyDescription: string;
  bodyPart: string;
  priority: Priority;
  studyDate: string;
  
  // Source
  referringPhysician?: string;
  technician?: string;
  uploadSource?: string;

  // Clinical
  clinicalHistory?: string;
  provisionalDiagnosis?: string;
  relevantNotes?: string;
  creatinineFlag?: boolean;
  pregnancyFlag?: boolean;
  additionalInfo?: string[];

  // Attachments
  attachments?: {
    type: 'Prescription' | 'Previous Report' | 'Images' | 'Lab Values' | 'Consent' | 'Other';
    url: string;
    name: string;
  }[];
  historyAttachment?: string; // legacy

  // Reporting
  assignedRadiologistId?: string;
  status: StudyStatus;
  reportingStatus: 'Unread' | 'Pending' | 'Draft' | 'Review' | 'Action Needed' | 'Final' | 'Verified' | 'Dispatched';
  assignedAt?: string;
  reportingStartTime?: string;
  draftTime?: string;
  finalizedAt?: string;
  tat: string;

  // Payments
  paymentStatus?: 'Unpaid' | 'Partial' | 'Paid';
  superAdminPaymentStatus?: 'Unpaid' | 'Paid';
  
  reportText?: string;
  historyText?: string;

  // PACS
  seriesCount?: number;
  instanceCount?: number;
  studySize?: string;
  storageLocation?: string;
  viewerUrl?: string;

  series?: {
    id: string;
    name: string;
    imageCount: number;
    previewUrl: string;
  }[];

  // Audit
  createdBy?: string;
  updatedBy?: string;
  auditIpDevice?: string;
  statusTransitions?: {
    status: string;
    timestamp: string;
    userId: string;
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
