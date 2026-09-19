import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../data/api";

interface Stats {
  totalAppointments: number;
  chatbotRequests: number;
  followUpsDue: number;
  departmentWise: { department: string; count: number }[];
  languageUsage: { language: string; count: number }[];
}

function toStats(raw: any): Stats {
  return {
    totalAppointments: raw.totalAppointments ?? 0,
    chatbotRequests: raw.chatbotRequests ?? 0,
    followUpsDue: raw.followUpsDue ?? 0,
    departmentWise: (raw.departmentWise ?? []).map((d: any) => ({ department: d.department, count: Number(d.count) })),
    languageUsage: (raw.languageUsage ?? []).map((l: any) => ({ language: l.language, count: Number(l.count) })),
  };
}

export default function Dashboard() {
  const { t } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const raw = await api.getDashboard();
      setStats(toStats(raw));
    } catch (err: any) {
      setError(err.message ?? "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const maxBar = stats ? Math.max(...stats.departmentWise.map((d) => d.count), 1) : 1;

  // Map backend dept name → translation key
  const deptLabel = (name: string) => {
    const map: Record<string, string> = {
      "General Medicine": t("dept_general"), "Dermatology": t("dept_derma"),
      "Orthopedics": t("dept_ortho"), "Gynecology": t("dept_gynec"),
      "Pediatrics": t("dept_pedia"), "ENT": t("dept_ent"),
      "Ophthalmology": t("dept_ophthal"), "Dentistry": t("dept_dental"),
      "Emergency": t("dept_emergency"),
    };
    if (name.startsWith("dept_")) return t(name as any);
    return map[name] ?? name;
  };

  return (
    <div className="page">
      <h2 className="page-title">{t("dashboardTitle")}</h2>

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "2rem" }}>⏳</div>
          <p style={{ color: "var(--text-muted)", marginTop: "0.75rem" }}>Loading live analytics…</p>
        </div>
      )}

      {error && (
        <div className="confirmation-card" style={{ borderColor: "var(--danger, #ef4444)" }}>
          <div style={{ fontSize: "2.5rem" }}>📊</div>
          <h2 style={{ color: "var(--danger, #ef4444)" }}>Dashboard Metrics Unavailable</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>{error}</p>
          <button className="btn btn-primary" onClick={loadStats}>
            🔄 Try Again
          </button>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div className="stats-grid">
            <StatCard icon="📅" label={t("totalAppointments")} value={stats.totalAppointments} color="blue" />
            <StatCard icon="🤖" label={t("chatbotRequests")} value={stats.chatbotRequests} color="purple" />
            <StatCard icon="🔔" label={t("followUpsDue")} value={stats.followUpsDue} color="orange" />
          </div>

          <div className="dash-section">
            <h3 className="dash-section-title">{t("deptWise")}</h3>
            <div className="bar-chart">
              {stats.departmentWise.map((d) => (
                <div key={d.department} className="bar-row">
                  <span className="bar-label">{deptLabel(d.department)}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(d.count / maxBar) * 100}%` }} />
                  </div>
                  <span className="bar-count">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-section">
            <h3 className="dash-section-title">{t("languageUsage")}</h3>
            <div className="lang-usage">
              {stats.languageUsage.map((l) => {
                const total = stats.languageUsage.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((l.count / total) * 100) : 0;
                return (
                  <div key={l.language} className="lang-usage-row">
                    <span className="lang-usage-label">{l.language}</span>
                    <div className="bar-track">
                      <div className="bar-fill bar-fill-lang" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="bar-count">{l.count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <span className="stat-icon">{icon}</span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
