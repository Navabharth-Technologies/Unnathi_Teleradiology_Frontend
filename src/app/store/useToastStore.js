import { create } from "zustand";

export const useToastStore = create((set) => ({
  message: null,
  type: "info",
  showToast: (message, type = "success") => {
    set({ message, type });
    setTimeout(() => {
      set({ message: null });
    }, 3000);
  },
  hideToast: () => set({ message: null }),
}));
