import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("marvelo-theme") || "nord",
  setTheme: (theme) => {
    localStorage.setItem("marvelo-theme", theme);
    set({ theme });
  },
}));
