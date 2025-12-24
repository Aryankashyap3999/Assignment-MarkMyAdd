"use client";

import { create } from "zustand";
import { JWTPayload } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: Partial<JWTPayload> | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (token: string, user: Partial<JWTPayload>) => void;
  logout: () => void;
  checkAuth: () => void;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (token: string, user: Partial<JWTPayload>) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isHydrated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null, isAuthenticated: false, isHydrated: true });
  },

  checkAuth: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (token) {
        set({ token, user, isAuthenticated: true, isHydrated: true });
      } else {
        set({ token: null, user: null, isAuthenticated: false, isHydrated: true });
      }
    }
  },

  hydrate: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (token) {
        set({ token, user, isAuthenticated: true, isHydrated: true });
      } else {
        set({ token: null, user: null, isAuthenticated: false, isHydrated: true });
      }
    } else {
      set({ isHydrated: true });
    }
  },
}));
