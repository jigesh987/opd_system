import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import en, { type TranslationKeys } from "../i18n/en";
import hi from "../i18n/hi";
import gu from "../i18n/gu";
import type { DeptKey } from "../data/doctors";
import { setOnUnauthorizedCallback } from "../data/api";

export type Lang = "en" | "hi" | "gu";

const translations: Record<Lang, Record<TranslationKeys, string>> = { en, hi, gu };

export interface AuthUser { username: string; role: string; token: string; mobile: string; profileComplete: boolean; }

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKeys) => string;
  authUser: AuthUser | null;
  setAuthUser: (u: AuthUser | null) => void;
  logout: () => void;
  preselectedDept: DeptKey | null;
  setPreselectedDept: (d: DeptKey | null) => void;
  preselectedDoctor: string | null;
  setPreselectedDoctor: (d: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return false;
    const decodedJson = atob(payloadBase64);
    const payload = JSON.parse(decodedJson);
    if (payload.exp) {
      return Date.now() >= payload.exp * 1000;
    }
    return false;
  } catch {
    return false;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [preselectedDept, setPreselectedDept] = useState<DeptKey | null>(null);
  const [preselectedDoctor, setPreselectedDoctor] = useState<string | null>(null);

  // Restore auth from localStorage on load with token expiration check
  const [authUser, setAuthUserState] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("opd_token");
    const username = localStorage.getItem("opd_username");
    const role = localStorage.getItem("opd_role");
    const mobile = localStorage.getItem("opd_mobile") ?? "";
    const profileComplete = localStorage.getItem("opd_profile_complete") === "true";

    if (token && isTokenExpired(token)) {
      ["opd_token", "opd_username", "opd_role", "opd_mobile", "opd_profile_complete"]
        .forEach(k => localStorage.removeItem(k));
      return null;
    }

    return token && username && role ? { token, username, role, mobile, profileComplete } : null;
  });

  const setAuthUser = (u: AuthUser | null) => {
    setAuthUserState(u);
    if (u) {
      localStorage.setItem("opd_token", u.token);
      localStorage.setItem("opd_username", u.username);
      localStorage.setItem("opd_role", u.role);
      localStorage.setItem("opd_mobile", u.mobile);
      localStorage.setItem("opd_profile_complete", String(u.profileComplete));
    } else {
      ["opd_token", "opd_username", "opd_role", "opd_mobile", "opd_profile_complete"]
        .forEach(k => localStorage.removeItem(k));
    }
  };

  const logout = () => {
    setAuthUser(null);
  };

  useEffect(() => {
    // Register global 401 interceptor callback
    setOnUnauthorizedCallback(() => {
      setAuthUser(null);
    });
  }, []);

  const t = (key: TranslationKeys) => translations[lang][key] ?? key;

  return (
    <AppContext.Provider value={{ lang, setLang, t, authUser, setAuthUser, logout, preselectedDept, setPreselectedDept, preselectedDoctor, setPreselectedDoctor }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
