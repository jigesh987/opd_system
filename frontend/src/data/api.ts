const BASE = "http://localhost:8080/api";

export class ApiError extends Error {
  status: number;
  isNetworkError: boolean;

  constructor(message: string, status = 0, isNetworkError = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

let onUnauthorizedCb: (() => void) | null = null;

export function setOnUnauthorizedCallback(cb: (() => void) | null) {
  onUnauthorizedCb = cb;
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem("opd_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...authHeader(), ...(options.headers ?? {}) },
      ...options,
    });
  } catch {
    throw new ApiError("Unable to connect to OPD server. Please check your network or server status.", 0, true);
  }

  if (res.status === 401) {
    if (onUnauthorizedCb) {
      onUnauthorizedCb();
    }
    const errData = await res.json().catch(() => ({}));
    throw new ApiError(errData.error ?? "Session expired. Please log in again.", 401);
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new ApiError(errData.error ?? `Request failed with status ${res.status}`, res.status);
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthResponse { token: string; username: string; role: string; mobile: string; profileComplete: boolean; }

export interface ProfileData {
  firstName: string; middleName: string; lastName: string;
  age: string | number; dateOfBirth: string;
  gender: string; maritalStatus: string;
  email: string; address: string; district: string; state: string;
}

export interface ProfileResponse extends ProfileData {
  displayUsername: string;
  mobile: string;
  profileComplete: boolean;
  completionPercent: number;
}

export interface DoctorApi {
  id: number;
  name: string;
  department: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  cabinNo?: string;
  rating?: number;
  opdDays?: string;
  availableSlots?: string;
  active?: boolean;
}

export interface DashboardResponseApi {
  totalDoctors: number;
  totalAppointments: number;
  todayAppointments: number;
  totalPatients: number;
  followUpsDue: number;
  chatbotRequests: number;
  departmentWise: { department: string; count: number }[];
  languageUsage: { language: string; count: number }[];
}

export const api = {
  login: (mobile: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ mobile, password }) }),

  register: (mobile: string, password: string, displayUsername: string) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ mobile, password, displayUsername }) }),

  saveProfile: (data: Partial<ProfileData>) =>
    request<ProfileResponse>("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),

  getProfile: () =>
    request<ProfileResponse>("/auth/profile"),

  // ── Appointments ────────────────────────────────────────────────────────────
  bookAppointment: (data: object) =>
    request<{ id: string }>("/appointments", { method: "POST", body: JSON.stringify(data) }),

  /** Returns only the logged-in patient's appointments (JWT required) */
  getMyAppointments: () =>
    request<object[]>("/appointments/mine"),

  lookupAppointments: (mobile: string) =>
    request<object[]>(`/appointments/lookup?mobile=${mobile}`),

  getAllAppointments: () =>
    request<object[]>("/appointments"),

  // ── Follow-ups ──────────────────────────────────────────────────────────────
  lookupFollowUps: (query: string) =>
    request<object[]>(`/followups/lookup?query=${encodeURIComponent(query)}`),

  sendReminder: (id: number) =>
    request<object>(`/followups/${id}/remind`, { method: "POST" }),

  // ── Chatbot ─────────────────────────────────────────────────────────────────
  chatSuggest: (data: object) =>
    request<{ suggestedDepartment: string; reasoning: string; emergency: boolean; disclaimer: string }>(
      "/chatbot/suggest", { method: "POST", body: JSON.stringify(data) }
    ),

  // ── Dashboard ───────────────────────────────────────────────────────────────
  getDashboard: () =>
    request<DashboardResponseApi>("/dashboard"),

  // ── Doctors ─────────────────────────────────────────────────────────────────
  getDoctors: () =>
    request<DoctorApi[]>("/doctors"),

  getDoctorsByDept: (department: string) =>
    request<DoctorApi[]>(
      `/doctors/by-department?department=${encodeURIComponent(department)}`
    ),

  getAdminDoctors: () =>
    request<DoctorApi[]>("/admin/doctors"),

  addDoctor: (data: Partial<DoctorApi>) =>
    request<DoctorApi>("/admin/doctors", { method: "POST", body: JSON.stringify(data) }),

  updateDoctor: (id: number, data: Partial<DoctorApi>) =>
    request<DoctorApi>(`/admin/doctors/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  toggleDoctorStatus: (id: number, active?: boolean) =>
    request<DoctorApi>(`/admin/doctors/${id}/status${active !== undefined ? `?active=${active}` : ""}`, { method: "PATCH" }),

  // ── Mobile Change ────────────────────────────────────────────────────────────

  /**
   * Step 1: Verify current password + request OTP to new mobile.
   * Backend sends (logs in DEV) a 6-digit OTP to the new mobile number.
   */
  requestMobileChange: (newMobile: string, currentPassword: string) =>
    request<{ message: string }>("/auth/mobile/change-request", {
      method: "POST",
      body: JSON.stringify({ newMobile, currentPassword }),
    }),

  /**
   * Step 2: Submit the OTP to confirm the mobile change.
   * On success backend returns sessionInvalidated=true → frontend must logout.
   */
  verifyMobileChangeOtp: (newMobile: string, otp: string) =>
    request<{ message: string; newMobile: string; sessionInvalidated: string }>(
      "/auth/mobile/verify-otp",
      { method: "POST", body: JSON.stringify({ newMobile, otp }) }
    ),
};

