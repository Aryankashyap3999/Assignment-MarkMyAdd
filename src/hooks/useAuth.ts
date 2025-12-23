"use client";

import { create } from "zustand";
import { JWTPayload } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: Partial<JWTPayload> | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: Partial<JWTPayload>) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token: string, user: Partial<JWTPayload>) => {
    localStorage.setItem("token", token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        set({ token, isAuthenticated: true });
      }
    }
  },
}));
