import { create } from 'zustand';
import type { Site, Hospital, User, Radiologist, Patient, Study, Invoice, UtilityTemplate, ModalityConfig } from '../types';

interface MockDbState {
  sites: Site[];

  hospitals: Hospital[];
  users: User[];
  radiologists: Radiologist[];
  patients: Patient[];
  studies: Study[];
  invoices: Invoice[];
  templates: UtilityTemplate[];
  modalities: ModalityConfig[];
  
  // Actions
  addSite: (company: Site) => void;
  updateSite: (id: string, data: Partial<Site>) => void;
  deleteCompany: (id: string) => void;
  

  
  addHospital: (hospital: Hospital) => void;
  updateHospital: (id: string, data: Partial<Hospital>) => void;
  deleteHospital: (id: string) => void;
  
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addRadiologist: (rad: Radiologist) => void;
  updateRadiologist: (id: string, data: Partial<Radiologist>) => void;
  
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  
  modalities: ModalityConfig[];
  
  // Actions
  addSite: (company: Site) => void;
  updateSite: (id: string, data: Partial<Site>) => void;
  deleteCompany: (id: string) => void;
  

  
  addHospital: (hospital: Hospital) => void;
  updateHospital: (id: string, data: Partial<Hospital>) => void;
  deleteHospital: (id: string) => void;
  
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addRadiologist: (rad: Radiologist) => void;
  updateRadiologist: (id: string, data: Partial<Radiologist>) => void;
  deleteRadiologist: (id: string) => void;
  
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  
  addStudy: (study: Study) => void;
  updateStudy: (id: string, data: Partial<Study>) => void;

  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  
  addTemplate: (template: UtilityTemplate) => void;
  updateTemplate: (id: string, data: Partial<UtilityTemplate>) => void;
  deleteTemplate: (id: string) => void;

  addModality: (modality: ModalityConfig) => void;
  updateModality: (id: string, data: Partial<ModalityConfig>) => void;
  deleteModality: (id: string) => void;
}

const mockSites: Site[] = [];



const mockHospitals: Hospital[] = [];

const mockUsers: User[] = [
  { id: 'u1', name: 'Unnathi Super Admin', email: 'admin@unnathi.com', phone: '000', role: 'SUPER_ADMIN', status: 'Active' }
];

const mockRadiologists: Radiologist[] = [];

const mockPatients: Patient[] = [];

const mockStudies: Study[] = [];

const mockInvoices: Invoice[] = [];

const mockTemplates: UtilityTemplate[] = [];

const mockModalities: ModalityConfig[] = [
  { id: 'm1', code: 5, name: 'X-ray', description: 'X-Ray' },
  { id: 'm2', code: 1, name: 'CT', description: 'Computed tomography' },
  { id: 'm3', code: 2, name: 'MRI', description: 'Magnetic Resonance Imaging' },
  { id: 'm4', code: 7, name: 'MAMMO', description: 'MAMMO' },
  { id: 'm5', code: 8, name: 'US', description: 'Ultrasound' },
  { id: 'm6', code: 11, name: 'XA', description: 'X-Ray Angiography' },
  { id: 'm7', code: 10, name: 'RF', description: 'Radio Fluoroscopy' },
  { id: 'm8', code: 13, name: 'DX', description: 'Digital X-Ray' },
  { id: 'm9', code: 16, name: 'ECG', description: 'Electrocardiogram' },
];

import { persist } from 'zustand/middleware';

export const useMockDb = create<MockDbState>()(
  persist(
    (set) => ({
      sites: mockSites,

      hospitals: mockHospitals,
      users: mockUsers,
      radiologists: mockRadiologists,
      patients: mockPatients,
      studies: mockStudies,
      invoices: mockInvoices,
      templates: mockTemplates,
      modalities: mockModalities,
      
      addSite: (company) => set((state) => ({ sites: [...state.sites, company] })),
      updateSite: (id, data) => set((state) => ({ sites: state.sites.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteCompany: (id) => set((state) => ({ sites: state.sites.filter(c => c.id !== id) })),
      
      addHospital: (hospital) => set((state) => ({ hospitals: [...state.hospitals, hospital] })),
      updateHospital: (id, data) => set((state) => ({ hospitals: state.hospitals.map(h => h.id === id ? { ...h, ...data } : h) })),
      deleteHospital: (id) => set((state) => ({ hospitals: state.hospitals.filter(h => h.id !== id) })),
      
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, data) => set((state) => ({ users: state.users.map(u => u.id === id ? { ...u, ...data } : u) })),
      deleteUser: (id) => set((state) => ({ users: state.users.filter(u => u.id !== id) })),
      
      addRadiologist: (rad) => set((state) => ({ radiologists: [...state.radiologists, rad] })),
      updateRadiologist: (id, data) => set((state) => ({ radiologists: state.radiologists.map(r => r.id === id ? { ...r, ...data } : r) })),
      deleteRadiologist: (id) => set((state) => ({ radiologists: state.radiologists.filter(r => r.id !== id) })),
      
      addPatient: (patient) => set((state) => ({ patients: [...state.patients, patient] })),
      updatePatient: (id, data) => set((state) => ({ patients: state.patients.map(p => p.id === id ? { ...p, ...data } : p) })),
      
      addStudy: (study) => set((state) => ({ studies: [...state.studies, study] })),
      updateStudy: (id, data) => set((state) => ({ studies: state.studies.map(s => s.id === id ? { ...s, ...data } : s) })),

      addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
      updateInvoice: (id, data) => set((state) => ({ invoices: state.invoices.map(i => i.id === id ? { ...i, ...data } : i) })),
      
      addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
      updateTemplate: (id, data) => set((state) => ({ templates: state.templates.map(t => t.id === id ? { ...t, ...data } : t) })),
      deleteTemplate: (id) => set((state) => ({ templates: state.templates.filter(t => t.id !== id) })),

      addModality: (modality) => set((state) => ({ modalities: [...state.modalities, modality] })),
      updateModality: (id, data) => set((state) => ({
        modalities: state.modalities.map(m => m.id === id ? { ...m, ...data } : m)
      })),
      deleteModality: (id) => set((state) => ({ modalities: state.modalities.filter(m => m.id !== id) }))
    }),
    {
      name: 'unnathi-mock-db-v9', // Bumped version to clear all data
    }
  )
);
