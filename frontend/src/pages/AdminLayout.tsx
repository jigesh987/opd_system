import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, type DashboardResponseApi } from "../data/api";
import AdminDoctors from "./AdminDoctors";

type AdminTab = "dashboard" | "doctors" | "appointments" | "patients" | "followups";

interface Stats {
  totalDoctors: number;
  totalAppointments: number;
  todayAppointments: number;
  totalPatients: number;
  followUpsDue: number;
  chatbotRequests: number;
  departmentWise: { department: string; count: number }[];
  languageUsage: { language: string; count: number }[];
}

function toStats(raw: DashboardResponseApi): Stats {
  return {
    totalDoctors: Number(raw.totalDoctors ?? 0),
    totalAppointments: Number(raw.totalAppointments ?? 0),
    todayAppointments: Number(raw.todayAppointments ?? 0),
    totalPatients: Number(raw.totalPatients ?? 0),
    followUpsDue: Number(raw.followUpsDue ?? 0),
    chatbotRequests: Number(raw.chatbotRequests ?? 0),
    departmentWise: (raw.departmentWise ?? []).map((d) => ({ department: String(d.department), count: Number(d.count) })),
    languageUsage: (raw.languageUsage ?? []).map((l) => ({ language: String(l.language), count: Number(l.count) })),
  };
}

export default function AdminLayout() {
  const { t, authUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = (path: string): AdminTab => {
    if (path.startsWith("/admin/doctors")) return "doctors";
    if (path.startsWith("/admin/appointments")) return "appointments";
    if (path.startsWith("/admin/patients")) return "patients";
    if (path.startsWith("/admin/followups")) return "followups";
    return "dashboard";
  };

  const activeTab = getTabFromPath(location.pathname);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleTabClick = (tab: AdminTab) => {
    if (tab === "dashboard") navigate("/admin");
    else navigate(`/admin/${tab}`);
  };

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const raw = await api.getDashboard();
      setStats(toStats(raw));
    } catch (err: any) {
      setError(err.message ?? "Failed to load admin dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      loadStats();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const maxBar = stats ? Math.max(...stats.departmentWise.map((d) => d.count), 1) : 1;

  const deptLabel = (name: string) => {
    const map: Record<string, string> = {
      "General Medicine": t("dept_general"),
      "Dermatology": t("dept_derma"),
      "Orthopedics": t("dept_ortho"),
      "Gynecology": t("dept_gynec"),
      "Pediatrics": t("dept_pedia"),
      "ENT": t("dept_ent"),
      "Ophthalmology": t("dept_ophthal"),
      "Dentistry": t("dept_dental"),
      "Emergency": t("dept_emergency"),
    };
    if (name.startsWith("dept_")) return t(name as any);
    return map[name] ?? name;
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-icon">🏥</span>
          <div>
            <h3 className="admin-sidebar-title">Smart OPD</h3>
            <span className="admin-sidebar-badge">Admin Portal</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => handleTabClick("dashboard")}
          >
            <span className="admin-nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "doctors" ? "active" : ""}`}
            onClick={() => handleTabClick("doctors")}
          >
            <span className="admin-nav-icon">👨‍⚕️</span>
            <span>Doctors</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => handleTabClick("appointments")}
          >
            <span className="admin-nav-icon">📅</span>
            <span>Appointments</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "patients" ? "active" : ""}`}
            onClick={() => handleTabClick("patients")}
          >
            <span className="admin-nav-icon">👥</span>
            <span>Patients</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "followups" ? "active" : ""}`}
            onClick={() => handleTabClick("followups")}
          >
            <span className="admin-nav-icon">🔔</span>
            <span>Follow-ups</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={() => navigate("/")}>
            <span className="admin-nav-icon">🌐</span>
            <span>Patient Website</span>
          </button>
          <button className="admin-nav-item admin-logout-btn" onClick={handleLogout}>
            <span className="admin-nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "doctors" && "Doctor Management"}
              {activeTab === "appointments" && "Appointment Management"}
              {activeTab === "patients" && "Patient Management"}
              {activeTab === "followups" && "Follow-up Management"}
            </h1>
            <p className="admin-page-subtitle">Real-time hospital administration portal</p>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/")} title="Switch to public patient site">
              🌐 View Patient Site
            </button>
            <div className="admin-user-info">
              <span className="admin-user-avatar">👤</span>
              <span className="admin-user-name">{authUser?.username || "Admin"}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === "dashboard" && (
            <>
              {loading && (
                <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
                  <div style={{ fontSize: "2.5rem" }}>⏳</div>
                  <p style={{ color: "var(--text-muted)", marginTop: "0.75rem" }}>Fetching live database analytics…</p>
                </div>
              )}

              {error && (
                <div className="confirmation-card" style={{ borderColor: "var(--danger, #ef4444)", margin: "1.5rem 0" }}>
                  <div style={{ fontSize: "2.5rem" }}>⚠️</div>
                  <h3 style={{ color: "var(--danger, #ef4444)" }}>Dashboard Metrics Unavailable</h3>
                  <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>{error}</p>
                  <button className="btn btn-primary" onClick={loadStats}>
                    🔄 Retry Connection
                  </button>
                </div>
              )}

              {!loading && !error && stats && (
                <>
                  {/* Real DB Metric Cards */}
                  <div className="admin-stats-grid">
                    <AdminStatCard icon="👨‍⚕️" label="Total Doctors" value={stats.totalDoctors} color="teal" />
                    <AdminStatCard icon="📅" label="Total Appointments" value={stats.totalAppointments} color="blue" />
                    <AdminStatCard icon="📆" label="Today's Appointments" value={stats.todayAppointments} color="emerald" />
                    <AdminStatCard icon="👥" label="Total Patients" value={stats.totalPatients} color="indigo" />
                    <AdminStatCard icon="🔔" label="Follow-ups Due" value={stats.followUpsDue} color="amber" />
                  </div>

                  <div className="admin-charts-grid">
                    <div className="dash-section admin-chart-card">
                      <h3 className="dash-section-title">Department-wise Appointments</h3>
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
                        {stats.departmentWise.length === 0 && (
                          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>No department data recorded yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="dash-section admin-chart-card">
                      <h3 className="dash-section-title">Language Usage Breakdown</h3>
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
                        {stats.languageUsage.length === 0 && (
                          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>No language data recorded yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === "doctors" && <AdminDoctors />}

          {activeTab !== "dashboard" && activeTab !== "doctors" && (
            <div className="admin-placeholder-card">
              <div style={{ fontSize: "3rem" }}>⚙️</div>
              <h2>
                {activeTab === "appointments" && "Appointment Management"}
                {activeTab === "patients" && "Patient Management"}
                {activeTab === "followups" && "Follow-up Management"}
              </h2>
              <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
                This module has been prepared as part of the Admin Panel foundation and will be implemented in subsequent steps.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AdminStatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className={`admin-stat-card stat-${color}`}>
      <span className="admin-stat-icon">{icon}</span>
      <div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );
}
