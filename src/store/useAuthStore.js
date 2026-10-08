import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      currentRole: null,
      selectedHospitalId: null,
      login: (user) =>
        set({
          isAuthenticated: true,
          user,
          currentRole: user.role,
          selectedHospitalId: user.hospitalId || null,
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          currentRole: null,
          selectedHospitalId: null,
        }),
      setRole: (role) => set({ currentRole: role }),
      setSelectedHospitalId: (hospitalId) =>
        set({ selectedHospitalId: hospitalId }),
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
    },
  ),
);
