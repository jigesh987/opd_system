import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { DEPARTMENTS, TIME_SLOTS } from "../data/doctors";
import { api, type ProfileResponse, type DoctorApi } from "../data/api";

interface FormState {
  dept: string;
  doctor: string;
  date: string;
  slot: string;
}

const EMPTY: FormState = { dept: "", doctor: "", date: "", slot: "" };

function today() {
  return new Date().toISOString().split("T")[0];
}

interface Confirmed {
  id: string;
  patientName: string;
  doctor: string;
  dept: string;
  date: string;
  slot: string;
}

export default function BookAppointment() {
  const { t, preselectedDept, setPreselectedDept, preselectedDoctor, setPreselectedDoctor, authUser } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Load full profile to display in the "Booking As" card
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Backend doctors for selected dept
  const [backendDoctors, setBackendDoctors] = useState<DoctorApi[]>([]);

  useEffect(() => {
    api.getProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    if (preselectedDept) setForm((f) => ({ ...f, dept: preselectedDept, doctor: "" }));
  }, [preselectedDept]);

  useEffect(() => {
    if (preselectedDoctor) setForm((f) => ({ ...f, doctor: preselectedDoctor }));
  }, [preselectedDoctor]);

  const DEPT_NAME_MAP: Record<string, string> = {
    dept_general: "General Medicine",
    dept_derma: "Dermatology",
    dept_ortho: "Orthopedics",
    dept_gynec: "Gynecology",
    dept_pedia: "Pediatrics",
    dept_ent: "ENT",
    dept_ophthal: "Ophthalmology",
    dept_dental: "Dentistry",
    dept_emergency: "Emergency",
  };

  useEffect(() => {
    if (!form.dept) { setBackendDoctors([]); return; }
    const deptName = DEPT_NAME_MAP[form.dept] ?? t(form.dept as any);
    api.getDoctorsByDept(deptName)
      .then(setBackendDoctors)
      .catch(() => setBackendDoctors([]));
  }, [form.dept]);

  // Fallback to static doctors if backend unavailable
  const staticDoctors = DEPARTMENTS.find((d) => d.key === form.dept)?.doctors ?? [];
  const doctors = backendDoctors.length > 0
    ? backendDoctors.map((d) => ({ id: d.id.toString(), name: d.name, slots: d.availableSlots ? d.availableSlots.split(",") : TIME_SLOTS }))
    : staticDoctors.map((d) => ({ id: d.id, name: d.name, slots: d.slots }));

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.dept) e.dept = t("required");
    if (!form.doctor) e.doctor = t("required");
    if (!form.date || form.date <= today()) e.date = t("invalidDate");
    if (!form.slot) e.slot = t("required");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const payload = {
        department: t(form.dept as any),
        doctor: form.doctor,
        appointmentDate: form.date,
        timeSlot: form.slot,
      };
      const result = await api.bookAppointment(payload);
      const patientName = profile
        ? [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ") || authUser?.username
        : authUser?.username ?? "";
      setConfirmed({
        id: (result as any).id,
        patientName: patientName ?? "",
        doctor: form.doctor,
        dept: form.dept,
        date: form.date,
        slot: form.slot,
      });
      setPreselectedDept(null);
      setPreselectedDoctor(null);
    } catch (err: any) {
      setApiError(err.message ?? "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function field(id: keyof FormState, label: string, input: React.ReactNode) {
    return (
      <div className="form-group">
        <label htmlFor={id} className="form-label">{label}</label>
        {input}
        {errors[id] && <span className="form-error" role="alert">{errors[id]}</span>}
      </div>
    );
  }

  // ── Confirmation Screen ────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="page">
        <div className="confirmation-card">
          <div className="confirm-icon">✅</div>
          <h2>{t("appointmentConfirmed")}</h2>
          <p className="confirm-msg">{t("confirmationMsg")}</p>
          <div className="confirm-detail"><strong>{t("appointmentId")}:</strong><span className="appt-id">{confirmed.id}</span></div>
          <div className="confirm-detail"><strong>{t("patientName")}:</strong> {confirmed.patientName}</div>
          <div className="confirm-detail"><strong>{t("doctor")}:</strong> {confirmed.doctor}</div>
          <div className="confirm-detail"><strong>{t("department")}:</strong> {t(confirmed.dept as any)}</div>
          <div className="confirm-detail"><strong>{t("preferredDate")}:</strong> {confirmed.date}</div>
          <div className="confirm-detail"><strong>{t("timeSlot")}:</strong> {confirmed.slot}</div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.25rem" }}>
            <button className="btn btn-primary" onClick={() => navigate("/my-appointments")}>
              View My Appointments
            </button>
            <button className="btn btn-secondary" onClick={() => { setConfirmed(null); setForm(EMPTY); }}>
              {t("bookAnother")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Incomplete Profile Banner ──────────────────────────────────────────────
  if (!profileLoading && (!authUser?.profileComplete || !profile)) {
    return (
      <div className="page">
        <div className="confirmation-card" style={{ borderColor: "var(--warning, #d97706)" }}>
          <div style={{ fontSize: "2.5rem" }}>📋</div>
          <h2 style={{ color: "var(--warning, #d97706)" }}>Profile Incomplete</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Please complete your profile with your personal details before booking an appointment.
            This ensures your appointment records are accurate.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/profile?redirect=/book")}>
            Complete Profile Now →
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile
    ? [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ") || authUser?.username
    : authUser?.username;

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <h2 className="page-title">{t("bookAppointment")}</h2>

      {/* ── Booking As Card ─────────────────────────────────────────────────── */}
      {profile && (
        <div className="booking-as-card">
          <div className="booking-as-header">
            <span className="booking-as-icon">👤</span>
            <span className="booking-as-title">Booking As</span>
          </div>
          <div className="booking-as-details">
            <div className="booking-as-row">
              <span className="booking-as-label">Name</span>
              <span className="booking-as-value">{displayName}</span>
            </div>
            <div className="booking-as-row">
              <span className="booking-as-label">Mobile</span>
              <span className="booking-as-value">{authUser?.mobile}</span>
            </div>
            <div className="booking-as-row">
              <span className="booking-as-label">Age</span>
              <span className="booking-as-value">{profile.age ?? "—"}</span>
            </div>
            <div className="booking-as-row">
              <span className="booking-as-label">Gender</span>
              <span className="booking-as-value">{profile.gender || "—"}</span>
            </div>
          </div>
          <p className="booking-as-note">
            🔒 Details are auto-filled from your profile.{" "}
            <button className="link-btn" onClick={() => navigate("/profile")}>Edit Profile</button>
          </p>
        </div>
      )}

      {apiError && <div className="form-error mb-1" role="alert">{apiError}</div>}

      <form className="appt-form" onSubmit={handleSubmit} noValidate>
        {field("dept", t("department"),
          <select id="dept" className={`form-input ${errors.dept ? "input-error" : ""}`}
            value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value, doctor: "" })}>
            <option value="">{t("selectDepartment")}</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.key} value={d.key}>{t(d.key as any)}</option>
            ))}
          </select>
        )}
        {field("doctor", t("doctor"),
          <select id="doctor" className={`form-input ${errors.doctor ? "input-error" : ""}`}
            value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}
            disabled={!form.dept}>
            <option value="">{t("selectDoctor")}</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        )}
        <div className="form-row">
          {field("date", t("preferredDate"),
            <input id="date" type="date" min={today()} className={`form-input ${errors.date ? "input-error" : ""}`}
              value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          )}
          {field("slot", t("timeSlot"),
            <select id="slot" className={`form-input ${errors.slot ? "input-error" : ""}`}
              value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
              <option value="">{t("selectSlot")}</option>
              {(doctors.find((d) => d.name === form.doctor)?.slots ?? []).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? "Booking…" : t("submit")}
        </button>
      </form>
    </div>
  );
}
