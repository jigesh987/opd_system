import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../data/api";

interface Appointment {
  id: string;
  patientName: string;
  department: string;
  doctor: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  age: number;
  gender: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    CONFIRMED:  { background: "rgba(34,197,94,0.15)",  color: "#16a34a", border: "1px solid rgba(34,197,94,0.35)" },
    COMPLETED:  { background: "rgba(99,102,241,0.15)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.35)" },
    CANCELLED:  { background: "rgba(239,68,68,0.15)",  color: "#dc2626", border: "1px solid rgba(239,68,68,0.35)" },
  };
  const style = styles[status] ?? styles.CONFIRMED;
  return (
    <span style={{
      ...style,
      padding: "0.2rem 0.65rem",
      borderRadius: "999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.03em",
      textTransform: "capitalize",
    }}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function PatientDashboard() {
  const { authUser } = useApp();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getMyAppointments();
      setAppointments(res as Appointment[]);
    } catch (err: any) {
      setError(err.message ?? "Could not fetch appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <div className="page">
      <h2 className="page-title">👤 My Appointments</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        Welcome back, <strong>{authUser?.username}</strong>.
        {!authUser?.profileComplete && (
          <span style={{ marginLeft: "0.5rem", color: "var(--warning, #d97706)" }}>
            ⚠️ Your profile is incomplete.{" "}
            <button className="link-btn" onClick={() => navigate("/profile")}>Complete it now →</button>
          </span>
        )}
      </p>

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading appointments…</p>}

      {error && (
        <div className="confirmation-card mb-2" style={{ borderColor: "var(--warning, #d97706)" }}>
          <p className="form-error" style={{ marginBottom: "1rem" }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={loadAppointments}>
            🔄 Try Again
          </button>
        </div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🗓️</div>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            You have no appointments yet.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/book")}>
            Book an Appointment
          </button>
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="followup-list">
          {appointments.map((appt) => (
            <div key={appt.id} className="followup-card">
              <div className="followup-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <span className="appt-id">{appt.id}</span>
                <StatusBadge status={appt.status ?? "CONFIRMED"} />
              </div>
              <div className="followup-row"><span className="followup-label">Patient</span><span className="followup-value">{appt.patientName}</span></div>
              <div className="followup-row"><span className="followup-label">Department</span><span className="followup-value">{appt.department}</span></div>
              <div className="followup-row"><span className="followup-label">Doctor</span><span className="followup-value">{appt.doctor}</span></div>
              <div className="followup-row"><span className="followup-label">Date</span><span className="followup-value">{formatDate(appt.appointmentDate)}</span></div>
              <div className="followup-row"><span className="followup-label">Time Slot</span><span className="followup-value">{appt.timeSlot}</span></div>
              {appt.age ? <div className="followup-row"><span className="followup-label">Age / Gender</span><span className="followup-value">{appt.age} yrs · {appt.gender}</span></div> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
