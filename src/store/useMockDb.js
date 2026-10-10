import { create } from "zustand";
import axios from "axios";
const API_URL = "http://localhost:5000/api";

const mockSites = [];

const mockHospitals = [];

const mockUsers = [];

const mockRadiologists = [];

const mockPatients = [];

const mockStudies = [];

const mockInvoices = [];

const mockTemplates = [];

const mockModalities = [
  { id: "m1", code: 5, name: "X-ray", description: "X-Ray" },
  { id: "m2", code: 1, name: "CT", description: "Computed tomography" },
  { id: "m3", code: 2, name: "MRI", description: "Magnetic Resonance Imaging" },
  { id: "m4", code: 7, name: "MAMMO", description: "MAMMO" },
  { id: "m5", code: 8, name: "US", description: "Ultrasound" },
  { id: "m6", code: 11, name: "XA", description: "X-Ray Angiography" },
  { id: "m7", code: 10, name: "RF", description: "Radio Fluoroscopy" },
  { id: "m8", code: 13, name: "DX", description: "Digital X-Ray" },
  { id: "m9", code: 16, name: "ECG", description: "Electrocardiogram" },
];

import { persist } from "zustand/middleware";

export const useMockDb = create()(
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
      customRoles: [],
      fetchData: async () => {
        try {
          const [
            sitesRes,
            hospitalsRes,
            usersRes,
            patientsRes,
            studiesRes,
            radiologistsRes,
          ] = await Promise.all([
            axios.get(`${API_URL}/sites`).catch(() => null),
            axios.get(`${API_URL}/hospitals`).catch(() => null),
            axios.get(`${API_URL}/users`).catch(() => null),
            axios.get(`${API_URL}/patients`).catch(() => null),
            axios.get(`${API_URL}/studies`).catch(() => null),
            axios.get(`${API_URL}/radiologists`).catch(() => null),
          ]);
          set((state) => ({
            sites: sitesRes ? sitesRes.data : state.sites,
            hospitals: hospitalsRes ? hospitalsRes.data : state.hospitals,
            users: usersRes ? usersRes.data : state.users,
            patients: patientsRes ? patientsRes.data : state.patients,
            studies: studiesRes ? studiesRes.data : state.studies,
            radiologists: radiologistsRes
              ? radiologistsRes.data
              : state.radiologists,
          }));
        } catch (error) {
          console.error("Error fetching data from API:", error);
        }
      },

      addCustomRole: (role) =>
        set((state) => ({ customRoles: [...state.customRoles, role] })),
      updateCustomRole: (id, data) =>
        set((state) => ({
          customRoles: state.customRoles.map((r) =>
            r.id === id ? { ...r, ...data } : r,
          ),
        })),
      deleteCustomRole: (id) =>
        set((state) => ({
          customRoles: state.customRoles.filter((r) => r.id !== id),
        })),

      addSite: async (company) => {
        await axios.post(`${API_URL}/sites`, company).catch(console.error);
        set((state) => ({ sites: [...state.sites, company] }));
      },
      updateSite: async (id, data) => {
        await axios.put(`${API_URL}/sites/${id}`, data).catch(console.error);
        set((state) => ({
          sites: state.sites.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },
      deleteCompany: async (id) => {
        await axios.delete(`${API_URL}/sites/${id}`).catch(console.error);
        set((state) => ({ sites: state.sites.filter((c) => c.id !== id) }));
      },
      addHospital: async (hospital) => {
        await axios.post(`${API_URL}/hospitals`, hospital).catch(console.error);
        set((state) => ({ hospitals: [...state.hospitals, hospital] }));
      },
      updateHospital: async (id, data) => {
        await axios
          .put(`${API_URL}/hospitals/${id}`, data)
          .catch(console.error);
        set((state) => ({
          hospitals: state.hospitals.map((h) =>
            h.id === id ? { ...h, ...data } : h,
          ),
        }));
      },
      deleteHospital: async (id) => {
        await axios.delete(`${API_URL}/hospitals/${id}`).catch(console.error);
        set((state) => ({
          hospitals: state.hospitals.filter((h) => h.id !== id),
        }));
      },
      addUser: async (user) => {
        await axios.post(`${API_URL}/users`, user).catch(console.error);
        set((state) => ({ users: [...state.users, user] }));
      },
      updateUser: async (id, data) => {
        await axios.put(`${API_URL}/users/${id}`, data).catch(console.error);
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }));
      },
      deleteUser: async (id) => {
        await axios.delete(`${API_URL}/users/${id}`).catch(console.error);
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      },
      addRadiologist: async (rad) => {
        await axios.post(`${API_URL}/radiologists`, rad).catch(console.error);
        set((state) => ({ radiologists: [...state.radiologists, rad] }));
      },
      updateRadiologist: async (id, data) => {
        await axios
          .put(`${API_URL}/radiologists/${id}`, data)
          .catch(console.error);
        set((state) => ({
          radiologists: state.radiologists.map((r) =>
            r.id === id ? { ...r, ...data } : r,
          ),
        }));
      },
      deleteRadiologist: async (id) => {
        await axios
          .delete(`${API_URL}/radiologists/${id}`)
          .catch(console.error);
        set((state) => ({
          radiologists: state.radiologists.filter((r) => r.id !== id),
        }));
      },
      addPatient: async (patient) => {
        await axios.post(`${API_URL}/patients`, patient).catch(console.error);
        set((state) => ({ patients: [...state.patients, patient] }));
      },
      updatePatient: async (id, data) => {
        await axios.put(`${API_URL}/patients/${id}`, data).catch(console.error);
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, ...data } : p,
          ),
        }));
      },
      addStudy: async (study) => {
        await axios.post(`${API_URL}/studies`, study).catch(console.error);
        set((state) => ({ studies: [...state.studies, study] }));
      },
      updateStudy: async (id, data) => {
        await axios.put(`${API_URL}/studies/${id}`, data).catch(console.error);
        set((state) => ({
          studies: state.studies.map((s) =>
            s.id === id ? { ...s, ...data } : s,
          ),
        }));
      },
      addInvoice: (invoice) =>
        set((state) => ({ invoices: [...state.invoices, invoice] })),
      updateInvoice: (id, data) =>
        set((state) => ({
          invoices: state.invoices.map((i) =>
            i.id === id ? { ...i, ...data } : i,
          ),
        })),
      addTemplate: (template) =>
        set((state) => ({ templates: [...state.templates, template] })),
      updateTemplate: (id, data) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      addModality: (modality) =>
        set((state) => ({ modalities: [...state.modalities, modality] })),
      updateModality: (id, data) =>
        set((state) => ({
          modalities: state.modalities.map((m) =>
            m.id === id ? { ...m, ...data } : m,
          ),
        })),
      deleteModality: (id) =>
        set((state) => ({
          modalities: state.modalities.filter((m) => m.id !== id),
        })),
    }),
    {
      name: "unnathi-mock-db-v15", // Bumped version to completely clear cached local data
    },
  ),
);
