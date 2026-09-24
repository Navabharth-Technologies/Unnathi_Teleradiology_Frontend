import { create } from 'zustand';
import type { User, Role } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  currentRole: Role | null;
  selectedHospitalId: string | null;
  login: (user: User) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  setSelectedHospitalId: (hospitalId: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  currentRole: null,
  selectedHospitalId: null,
  login: (user) => set({ 
    isAuthenticated: true, 
    user, 
    currentRole: user.role,
    selectedHospitalId: user.hospitalId || null 
  }),
  logout: () => set({ 
    isAuthenticated: false, 
    user: null, 
    currentRole: null,
    selectedHospitalId: null
  }),
  setRole: (role) => set({ currentRole: role }),
  setSelectedHospitalId: (hospitalId) => set({ selectedHospitalId: hospitalId }),
}));
