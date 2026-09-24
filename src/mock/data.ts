export const mockStats = {
  totalCenters: 12,
  activeCenters: 10,
  totalStudies: 4521,
  studiesToday: 142,
  pendingReports: 34,
  pendingVerification: 18,
  criticalCases: 3,
  onlineMachines: 14,
  failedTransfers: 2,
};

export const studiesPerDayData = [
  { name: 'Mon', studies: 120 },
  { name: 'Tue', studies: 132 },
  { name: 'Wed', studies: 145 },
  { name: 'Thu', studies: 150 },
  { name: 'Fri', studies: 142 },
  { name: 'Sat', studies: 85 },
  { name: 'Sun', studies: 40 },
];

export const studiesByModalityData = [
  { name: 'MRI', value: 400 },
  { name: 'CT', value: 300 },
  { name: 'X-Ray', value: 600 },
  { name: 'USG', value: 200 },
  { name: 'PET', value: 50 },
];

export const mockRecentStudies = [
  { id: '1', patientName: 'Ravi Kumar', patientId: 'P-1001', center: 'City Scan Center', modality: 'MRI', date: '2026-09-01', radiologist: 'Dr. Sharma', status: 'Pending', priority: 'Routine' },
  { id: '2', patientName: 'Anita Desai', patientId: 'P-1002', center: 'Metro Diagnostics', modality: 'CT', date: '2026-09-01', radiologist: 'Dr. Gupta', status: 'Reading', priority: 'Urgent' },
  { id: '3', patientName: 'Vikram Singh', patientId: 'P-1003', center: 'City Scan Center', modality: 'X-Ray', date: '2026-09-01', radiologist: 'Unassigned', status: 'Received', priority: 'STAT' },
  { id: '4', patientName: 'Priya Patel', patientId: 'P-1004', center: 'Northside MRI', modality: 'MRI', date: '2026-09-01', radiologist: 'Dr. Sharma', status: 'Reported', priority: 'Routine' },
  { id: '5', patientName: 'Rahul Verma', patientId: 'P-1005', center: 'Metro Diagnostics', modality: 'USG', date: '2026-09-01', radiologist: 'Dr. Lee', status: 'Verified', priority: 'Routine' },
];

export const mockCenters = [
  { id: 'C-01', name: 'City Scan Center', code: 'CSC-DEL', location: 'Delhi', modalities: ['MRI', 'CT', 'X-Ray'], studiesToday: 45, status: 'Active' },
  { id: 'C-02', name: 'Metro Diagnostics', code: 'METRO-MUM', location: 'Mumbai', modalities: ['MRI', 'USG', 'PET'], studiesToday: 32, status: 'Active' },
  { id: 'C-03', name: 'Northside MRI', code: 'NMRI-BLR', location: 'Bangalore', modalities: ['MRI'], studiesToday: 28, status: 'Active' },
  { id: 'C-04', name: 'East End X-Ray', code: 'EEX-KOL', location: 'Kolkata', modalities: ['X-Ray', 'USG'], studiesToday: 15, status: 'Maintenance' },
  { id: 'C-05', name: 'Central Hospital PACS', code: 'CHP-HYD', location: 'Hyderabad', modalities: ['CT', 'X-Ray'], studiesToday: 22, status: 'Active' },
];
