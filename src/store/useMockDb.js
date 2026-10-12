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

// Clear any stale dummy or duplicate localStorage from previous sessions
if (typeof window !== "undefined" && window.localStorage) {
  try {
    for (let i = 0; i <= 20; i++) {
      window.localStorage.removeItem(`unnathi-mock-db-v${i}`);
    }
    window.localStorage.removeItem("unnathi-mock-db");
  } catch (e) {
    console.warn("Could not clean old localStorage:", e);
  }
}

// Clean production baseline matching real database
const initialSites = [
  {
    id: "comp_1791789153649",
    name: "KR_Hospital",
    code: "KRH01",
    legalName: "KR",
    contactPerson: "Admin",
    email: "kr@unnathi.com",
    phone: "7418529630",
    address: "Mysore",
    city: "Mysore",
    state: "Karnataka",
    country: "India",
    status: "Trial",
    walletBalance: 0,
    settings: {
      adminFullName: "Admin",
      adminEmail: "kr@unnathi.com",
      adminMobile: "",
      adminRole: "SITE_ADMIN",
      loginMode: "Password",
      temporaryPassword: "123",
      mfaEnabled: true,
      allowedCentres: "All Centres",
      accountStatus: "Invite Pending",
      emergency: true,
      border: true,
    },
  },
];

const initialHospitals = [
  {
    id: "hosp_1791789300962",
    name: "Suyog",
    code: "SUY01",
    organizationType: "UNNATHI_MANAGED",
    parentSiteId: null,
    accountType: "Postpaid",
    status: "Active",
    city: "Mysore",
    state: "Karnataka",
    email: "suyog@unnathi.com",
    phone: "7418529630",
    modalityCommissions: { CT: 50, MRI: 100 },
  },
  {
    id: "hosp_1791789809438",
    name: "Abc",
    code: "ABC01",
    organizationType: "COMPANY_MANAGED",
    parentSiteId: "comp_1791789153649",
    accountType: "Prepaid",
    walletBalance: 100,
    status: "Active",
    email: "abc@unnathi.com",
    modalityCommissions: { CT: 40, MRI: 26 },
  },
];

const initialUsers = [
  {
    id: "u_admin",
    name: "Super Admin",
    email: "admin@unnathi.com",
    role: "SUPER_ADMIN",
    status: "Active",
    password: "123",
  },
  {
    id: "u_1791789153651",
    name: "Admin",
    email: "kr@unnathi.com",
    phone: "7418529630",
    role: "SITE_ADMIN",
    siteId: "comp_1791789153649",
    status: "Active",
    password: "123",
    loginMode: "Password",
    mfaEnabled: true,
  },
  {
    id: "u_1791789301569",
    name: "Admin",
    email: "suyog@unnathi.com",
    phone: "7418529630",
    role: "HOSPITAL_ADMIN",
    hospitalId: "hosp_1791789300962",
    status: "Invite Pending",
    password: "123",
    loginMode: "Password",
  },
  {
    id: "u_1791789809995",
    name: "Admin",
    email: "abc@unnathi.com",
    role: "HOSPITAL_ADMIN",
    hospitalId: "hosp_1791789809438",
    status: "Active",
    password: "123",
    loginMode: "Password",
  },
  {
    id: "u1791790045060989",
    name: "Namith",
    email: "namith@gmail.com",
    role: "RADIOLOGIST",
    siteId: "comp_1791789153649",
    status: "Active",
  },
];

const initialRadiologists = [
  {
    id: "r1791790045062340",
    userId: "u1791790045060989",
    name: "Namith",
    availability: "Online",
    assignedHospitals: [],
    status: "Active",
  },
];

const initialPatients = [
  {
    id: "p1791790075869",
    uhid: "20953",
    name: "JOYTHI DEVI 46Y/F",
    age: 46,
    gender: "Female",
    hospitalId: "hosp_1791789809438",
    registrationDate: "2026-10-12T07:27:55.870Z",
  },
];

const initialStudies = [
  {
    id: "st1791790075870",
    patientId: "p1791790075869",
    caseNumber: "CAS-DICOM-75870",
    accessionNumber: "ACC-1791790072641",
    hospitalId: "hosp_1791789809438",
    modality: "CT",
    studyDescription: "CT KUB",
    bodyPart: "ABDOMEN",
    priority: "Routine",
    studyDate: "2026-08-06T00:00:00.000Z",
    assignedRadiologistId: "r1791790045062340",
    status: "Final",
    reportingStatus: "Verified",
    paymentStatus: "Unpaid",
    superAdminPaymentStatus: "Pending",
    tat: "24h",
    createdAt: "2026-10-12T07:27:55.870Z",
    updatedAt: "2026-10-12T07:27:55.870Z",
  },
];

export const useMockDb = create()(
  persist(
    (set, get) => ({
      sites: initialSites,
      hospitals: initialHospitals,
      users: initialUsers,
      radiologists: initialRadiologists,
      patients: initialPatients,
      studies: initialStudies,
      invoices: [],
      templates: [],
      modalities: mockModalities,
      customRoles: [],
      walletTransactions: [],
      postpaidSettlements: [],

      fetchData: async () => {
        try {
          const [
            sitesRes,
            hospitalsRes,
            usersRes,
            patientsRes,
            studiesRes,
            radiologistsRes,
            invoicesRes,
            templatesRes,
            modalitiesRes,
            rolesRes,
            walletTxRes,
            postpaidRes,
          ] = await Promise.all([
            axios.get(`${API_URL}/sites`).catch(() => null),
            axios.get(`${API_URL}/hospitals`).catch(() => null),
            axios.get(`${API_URL}/users`).catch(() => null),
            axios.get(`${API_URL}/patients`).catch(() => null),
            axios.get(`${API_URL}/studies`).catch(() => null),
            axios.get(`${API_URL}/radiologists`).catch(() => null),
            axios.get(`${API_URL}/invoices`).catch(() => null),
            axios.get(`${API_URL}/templates`).catch(() => null),
            axios.get(`${API_URL}/modalities`).catch(() => null),
            axios.get(`${API_URL}/customroles`).catch(() => null),
            axios.get(`${API_URL}/wallet-transactions`).catch(() => null),
            axios.get(`${API_URL}/postpaid-settlements`).catch(() => null),
          ]);

          const currentState = get();

          // Authoritative sync: Remote DB data takes complete precedence when available
          const syncCollection = (remoteData, currentData) => {
            if (Array.isArray(remoteData) && remoteData.length > 0) {
              return remoteData;
            }
            return currentData || [];
          };

          set(() => ({
            sites: syncCollection(sitesRes?.data, currentState.sites),
            hospitals: syncCollection(hospitalsRes?.data, currentState.hospitals),
            users: syncCollection(usersRes?.data, currentState.users),
            patients: syncCollection(patientsRes?.data, currentState.patients),
            studies: syncCollection(studiesRes?.data, currentState.studies),
            radiologists: syncCollection(radiologistsRes?.data, currentState.radiologists),
            invoices: invoicesRes?.data?.length ? invoicesRes.data : currentState.invoices,
            templates: templatesRes?.data?.length ? templatesRes.data : currentState.templates,
            modalities: modalitiesRes?.data?.length ? modalitiesRes.data : currentState.modalities,
            customRoles: rolesRes?.data?.length ? rolesRes.data : currentState.customRoles,
            walletTransactions: walletTxRes?.data?.length ? walletTxRes.data : currentState.walletTransactions,
            postpaidSettlements: postpaidRes?.data?.length ? postpaidRes.data : currentState.postpaidSettlements,
          }));
        } catch (error) {
          console.error("Error fetching data from API:", error);
        }
      },

      addCustomRole: async (role) => {
        try {
          await axios.post(`${API_URL}/customroles`, role).catch(console.error);
        } catch (e) {}
        set((state) => ({ customRoles: [...state.customRoles.filter((r) => r.id !== role.id), role] }));
      },
      updateCustomRole: async (id, data) => {
        try {
          await axios.put(`${API_URL}/customroles/${id}`, data).catch(console.error);
        } catch (e) {}
        set((state) => ({
          customRoles: state.customRoles.map((r) =>
            r.id === id ? { ...r, ...data } : r,
          ),
        }));
      },
      deleteCustomRole: async (id) => {
        try {
          await axios.delete(`${API_URL}/customroles/${id}`).catch(console.error);
        } catch (e) {}
        set((state) => ({
          customRoles: state.customRoles.filter((r) => r.id !== id),
        }));
      },

      addSite: async (company) => {
        try {
          await axios.post(`${API_URL}/sites`, company);
        } catch (e) {
          console.error("API error adding site:", e);
        }
        set((state) => ({
          sites: [...state.sites.filter((c) => c.id !== company.id), company],
        }));
      },
      updateSite: async (id, data) => {
        try {
          await axios.put(`${API_URL}/sites/${id}`, data);
        } catch (e) {
          console.error("API error updating site:", e);
        }
        set((state) => ({
          sites: state.sites.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },
      deleteCompany: async (id) => {
        try {
          await axios.delete(`${API_URL}/sites/${id}`);
        } catch (e) {
          console.error("API error deleting site:", e);
        }
        set((state) => ({ sites: state.sites.filter((c) => c.id !== id) }));
      },

      addHospital: async (hospital) => {
        try {
          await axios.post(`${API_URL}/hospitals`, hospital);
        } catch (e) {
          console.error("API error adding hospital:", e);
        }
        set((state) => ({
          hospitals: [...state.hospitals.filter((h) => h.id !== hospital.id), hospital],
        }));
      },
      updateHospital: async (id, data) => {
        try {
          await axios.put(`${API_URL}/hospitals/${id}`, data);
        } catch (e) {
          console.error("API error updating hospital:", e);
        }
        set((state) => ({
          hospitals: state.hospitals.map((h) =>
            h.id === id ? { ...h, ...data } : h,
          ),
        }));
      },
      deleteHospital: async (id) => {
        try {
          await axios.delete(`${API_URL}/hospitals/${id}`);
        } catch (e) {
          console.error("API error deleting hospital:", e);
        }
        set((state) => ({
          hospitals: state.hospitals.filter((h) => h.id !== id),
        }));
      },

      addUser: async (user) => {
        try {
          await axios.post(`${API_URL}/users`, user);
        } catch (e) {
          console.error("API error adding user:", e);
        }
        set((state) => ({
          users: [...state.users.filter((u) => u.id !== user.id), user],
        }));
      },
      updateUser: async (id, data) => {
        try {
          await axios.put(`${API_URL}/users/${id}`, data);
        } catch (e) {
          console.error("API error updating user:", e);
        }
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }));
      },
      deleteUser: async (id) => {
        try {
          await axios.delete(`${API_URL}/users/${id}`);
        } catch (e) {
          console.error("API error deleting user:", e);
        }
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      },

      addRadiologist: async (rad) => {
        try {
          await axios.post(`${API_URL}/radiologists`, rad);
        } catch (e) {
          console.error("API error adding radiologist:", e);
        }
        set((state) => ({
          radiologists: [...state.radiologists.filter((r) => r.id !== rad.id), rad],
        }));
      },
      updateRadiologist: async (id, data) => {
        try {
          await axios.put(`${API_URL}/radiologists/${id}`, data);
        } catch (e) {
          console.error("API error updating radiologist:", e);
        }
        set((state) => ({
          radiologists: state.radiologists.map((r) =>
            r.id === id ? { ...r, ...data } : r,
          ),
        }));
      },
      deleteRadiologist: async (id) => {
        try {
          await axios.delete(`${API_URL}/radiologists/${id}`);
        } catch (e) {
          console.error("API error deleting radiologist:", e);
        }
        set((state) => ({
          radiologists: state.radiologists.filter((r) => r.id !== id),
        }));
      },

      addPatient: async (patient) => {
        try {
          await axios.post(`${API_URL}/patients`, patient);
        } catch (e) {
          console.error("API error adding patient:", e);
        }
        set((state) => ({
          patients: [...state.patients.filter((p) => p.id !== patient.id), patient],
        }));
      },
      updatePatient: async (id, data) => {
        try {
          await axios.put(`${API_URL}/patients/${id}`, data);
        } catch (e) {
          console.error("API error updating patient:", e);
        }
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, ...data } : p,
          ),
        }));
      },

      addStudy: async (study) => {
        try {
          await axios.post(`${API_URL}/studies`, study);
        } catch (e) {
          console.error("API error adding study:", e);
        }
        set((state) => ({
          studies: [...state.studies.filter((s) => s.id !== study.id), study],
        }));
      },
      updateStudy: async (id, data) => {
        try {
          await axios.put(`${API_URL}/studies/${id}`, data);
        } catch (e) {
          console.error("API error updating study:", e);
        }
        set((state) => ({
          studies: state.studies.map((s) =>
            s.id === id ? { ...s, ...data } : s,
          ),
        }));
      },

      addInvoice: async (invoice) => {
        try {
          await axios.post(`${API_URL}/invoices`, invoice).catch(console.error);
        } catch (e) {}
        set((state) => ({
          invoices: [...state.invoices.filter((i) => i.id !== invoice.id), invoice],
        }));
      },
      updateInvoice: async (id, data) => {
        try {
          await axios.put(`${API_URL}/invoices/${id}`, data).catch(console.error);
        } catch (e) {}
        set((state) => ({
          invoices: state.invoices.map((i) =>
            i.id === id ? { ...i, ...data } : i,
          ),
        }));
      },

      addTemplate: async (template) => {
        try {
          await axios.post(`${API_URL}/templates`, template).catch(console.error);
        } catch (e) {}
        set((state) => ({
          templates: [...state.templates.filter((t) => t.id !== template.id), template],
        }));
      },
      updateTemplate: async (id, data) => {
        try {
          await axios.put(`${API_URL}/templates/${id}`, data).catch(console.error);
        } catch (e) {}
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
        }));
      },
      deleteTemplate: async (id) => {
        try {
          await axios.delete(`${API_URL}/templates/${id}`).catch(console.error);
        } catch (e) {}
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      addModality: async (modality) => {
        try {
          await axios.post(`${API_URL}/modalities`, modality).catch(console.error);
        } catch (e) {}
        set((state) => ({
          modalities: [...state.modalities.filter((m) => m.id !== modality.id), modality],
        }));
      },
      updateModality: async (id, data) => {
        try {
          await axios.put(`${API_URL}/modalities/${id}`, data).catch(console.error);
        } catch (e) {}
        set((state) => ({
          modalities: state.modalities.map((m) =>
            m.id === id ? { ...m, ...data } : m,
          ),
        }));
      },
      deleteModality: async (id) => {
        try {
          await axios.delete(`${API_URL}/modalities/${id}`).catch(console.error);
        } catch (e) {}
        set((state) => ({
          modalities: state.modalities.filter((m) => m.id !== id),
        }));
      },

      addWalletTransaction: async (tx) => {
        try {
          await axios.post(`${API_URL}/wallet-transactions`, tx).catch(console.error);
        } catch (e) {}
        set((state) => ({
          walletTransactions: [tx, ...(state.walletTransactions || [])],
        }));
      },

      addPostpaidSettlement: async (settlement) => {
        try {
          await axios.post(`${API_URL}/postpaid-settlements`, settlement).catch(console.error);
        } catch (e) {}
        set((state) => ({
          postpaidSettlements: [settlement, ...(state.postpaidSettlements || [])],
        }));
      },

      updatePostpaidSettlement: async (id, data) => {
        try {
          await axios.put(`${API_URL}/postpaid-settlements/${id}`, data).catch(console.error);
        } catch (e) {}
        set((state) => ({
          postpaidSettlements: state.postpaidSettlements.map((s) =>
            s.id === id ? { ...s, ...data } : s,
          ),
        }));
      },
    }),
    {
      name: "unnathi-clean-db-v1",
    },
  ),
);
