import { useState } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../data/api";
import { SAMPLE_FOLLOWUPS } from "../data/sampleData";

interface FollowUpItem {
  id?: number;
  appointmentId: string;
  mobile: string;
  doctor: string;
  department: string;
  followUpDate: string;
  reminderSent: boolean;
}

export default function FollowUp() {
  const { t } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FollowUpItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const data = await api.lookupFollowUps(q) as FollowUpItem[];
      setResults(data.length > 0 ? data : []);
    } catch {
      // Fallback to sample data
      const lower = q.toLowerCase();
      const found = SAMPLE_FOLLOWUPS.filter(
        (f) => f.mobile.includes(lower) || f.appointmentId.toLowerCase().includes(lower)
      ).map((f) => ({
        appointmentId: f.appointmentId,
        mobile: f.mobile,
        doctor: f.doctor,
        department: f.dept,
        followUpDate: f.followUpDate,
        reminderSent: f.reminderSent,
      }));
      setResults(found);
    } finally {
      setLoading(false);
    }
  }

  async function sendReminder(item: FollowUpItem, idx: number) {
    if (item.id) {
      try { await api.sendReminder(item.id); } catch { /* demo fallback */ }
    }
    setResults((prev) =>
      prev ? prev.map((r, i) => i === idx ? { ...r, reminderSent: true } : r) : prev
    );
  }

  // dept key or name → translated label
  const deptLabel = (dept: string) => {
    if (dept.startsWith("dept_")) return t(dept as any);
    const map: Record<string, string> = {
      "General Medicine": t("dept_general"), "Dermatology": t("dept_derma"),
      "Orthopedics": t("dept_ortho"), "Gynecology": t("dept_gynec"),
      "Pediatrics": t("dept_pedia"), "ENT": t("dept_ent"),
      "Ophthalmology": t("dept_ophthal"), "Dentistry": t("dept_dental"),
      "Emergency": t("dept_emergency"),
    };
    return map[dept] ?? dept;
  };

  return (
    <div className="page">
      <h2 className="page-title">{t("followUpTitle")}</h2>
      <div className="followup-search">
        <label htmlFor="followup-query" className="form-label">{t("enterMobileOrId")}</label>
        <div className="search-row">
          <input
            id="followup-query"
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button className="btn btn-primary" onClick={search} disabled={loading}>
            {loading ? "…" : t("search")}
          </button>
        </div>
      </div>

      {results !== null && (
        results.length === 0
          ? <p className="no-results">{t("noFollowUp")}</p>
          : (
            <div className="followup-list">
              {results.map((f, idx) => (
                <div key={f.appointmentId + idx} className="followup-card">
                  <div className="followup-row">
                    <span className="followup-label">{t("appointmentId")}:</span>
                    <span className="followup-value appt-id">{f.appointmentId}</span>
                  </div>
                  <div className="followup-row">
                    <span className="followup-label">{t("followUpDoctor")}:</span>
                    <span className="followup-value">{f.doctor}</span>
                  </div>
                  <div className="followup-row">
                    <span className="followup-label">{t("followUpDept")}:</span>
                    <span className="followup-value">{deptLabel(f.department)}</span>
                  </div>
                  <div className="followup-row">
                    <span className="followup-label">{t("followUpDate")}:</span>
                    <span className="followup-value">{f.followUpDate}</span>
                  </div>
                  <div className="followup-row">
                    <span className="followup-label">{t("reminderStatus")}:</span>
                    <span className={`badge ${f.reminderSent ? "badge-green" : "badge-yellow"}`}>
                      {f.reminderSent ? t("reminderSent") : t("reminderPending")}
                    </span>
                  </div>
                  {!f.reminderSent && (
                    <button className="btn btn-secondary mt-1" onClick={() => sendReminder(f, idx)}>
                      {t("sendReminder")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
      )}

      <div className="followup-hint">
        <p>💡 {t("followUpHint")} <code>9876543210</code>, <code>9123456780</code>, <code>OPD-1001</code></p>
      </div>
    </div>
  );
}
