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

// Function to recover previous localStorage state if current version is empty
const getRecoveredState = () => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const current = localStorage.getItem("unnathi-mock-db-v15");
    if (current) {
      const parsed = JSON.parse(current);
      if (
        (parsed?.state?.sites && parsed.state.sites.length > 0) ||
        (parsed?.state?.hospitals && parsed.state.hospitals.length > 0)
      ) {
        return parsed.state;
      }
    }
    // Check previous storage keys
    const previousKeys = [
      "unnathi-mock-db-v14",
      "unnathi-mock-db-v13",
      "unnathi-mock-db-v12",
      "unnathi-mock-db-v11",
      "unnathi-mock-db-v10",
      "unnathi-mock-db-v9",
      "unnathi-mock-db-v8",
    ];
    for (const key of previousKeys) {
      const prev = localStorage.getItem(key);
      if (prev) {
        const parsed = JSON.parse(prev);
        if (
          (parsed?.state?.sites && parsed.state.sites.length > 0) ||
          (parsed?.state?.hospitals && parsed.state.hospitals.length > 0)
        ) {
          console.log(`Recovered state from ${key}:`, parsed.state);
          return parsed.state;
        }
      }
    }
  } catch (e) {
    console.error("Error reading localStorage backups:", e);
  }
  return null;
};

const recovered = getRecoveredState();

export const useMockDb = create()(
  persist(
    (set, get) => ({
      sites: recovered?.sites?.length ? recovered.sites : mockSites,
      hospitals: recovered?.hospitals?.length ? recovered.hospitals : mockHospitals,
      users: recovered?.users?.length ? recovered.users : mockUsers,
      radiologists: recovered?.radiologists?.length ? recovered.radiologists : mockRadiologists,
      patients: recovered?.patients?.length ? recovered.patients : mockPatients,
      studies: recovered?.studies?.length ? recovered.studies : mockStudies,
      invoices: recovered?.invoices?.length ? recovered.invoices : mockInvoices,
      templates: recovered?.templates?.length ? recovered.templates : mockTemplates,
      modalities: recovered?.modalities?.length ? recovered.modalities : mockModalities,
      customRoles: recovered?.customRoles?.length ? recovered.customRoles : [],
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

          // Helper to merge remote data with local data without erasing local records
          const mergeCollections = (remoteList, localList, entityRoute) => {
            if (remoteList && remoteList.length > 0) {
              const remoteMap = new Map(remoteList.map((item) => [item.id, item]));
              // If local has items not in remote, keep them and push to server
              localList.forEach((localItem) => {
                if (localItem?.id && !remoteMap.has(localItem.id)) {
                  remoteMap.set(localItem.id, localItem);
                  if (entityRoute) {
                    axios.post(`${API_URL}/${entityRoute}`, localItem).catch(console.error);
                  }
                }
              });
              return Array.from(remoteMap.values());
            } else if (localList && localList.length > 0) {
              // Remote is empty but local has items -> sync local items to remote database!
              if (entityRoute) {
                localList.forEach((item) => {
                  axios.post(`${API_URL}/${entityRoute}`, item).catch(console.error);
                });
              }
              return localList;
            }
            return remoteList || localList || [];
          };

          set(() => ({
            sites: mergeCollections(sitesRes?.data, currentState.sites, "sites"),
            hospitals: mergeCollections(hospitalsRes?.data, currentState.hospitals, "hospitals"),
            users: mergeCollections(usersRes?.data, currentState.users, "users"),
            patients: mergeCollections(patientsRes?.data, currentState.patients, "patients"),
            studies: mergeCollections(studiesRes?.data, currentState.studies, "studies"),
            radiologists: mergeCollections(radiologistsRes?.data, currentState.radiologists, "radiologists"),
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
      name: "unnathi-mock-db-v15",
    },
  ),
);
