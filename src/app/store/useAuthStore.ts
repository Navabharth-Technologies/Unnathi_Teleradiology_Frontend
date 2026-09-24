import { create } from 'zustand';

export type Role = 'SUPER_ADMIN' | 'RADIOLOGIST' | 'VERIFIER' | 'RECEPTION';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  hospitalId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
