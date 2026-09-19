import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../data/api";

export default function Login() {
  const { t, setAuthUser } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [mobile, setMobile] = useState("");
  const [displayUsername, setDisplayUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) { setError(t("invalidMobile")); return; }
    if (!password.trim()) { setError(t("required")); return; }
    if (mode === "register" && !displayUsername.trim()) { setError(t("required")); return; }
    setLoading(true);
    setError("");
    try {
      const res = mode === "login"
        ? await api.login(mobile, password)
        : await api.register(mobile, password, displayUsername);
      setAuthUser({ token: res.token, username: res.username, role: res.role, mobile: res.mobile, profileComplete: res.profileComplete });
      navigate(res.role === "ADMIN" ? "/dashboard" : "/");
    } catch (err: any) {
      setError(err.message ?? "Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: "login" | "register") { setMode(m); setError(""); setMobile(""); setPassword(""); setDisplayUsername(""); }

  return (
    <div className="page">
      <div className="login-card">
        <div className="login-icon">🏥</div>
        <h2 className="login-title">{mode === "login" ? t("loginTitle") : t("registerTitle")}</h2>

        {error && <div className="form-error login-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="mobile" className="form-label">{t("mobileNumber")}</label>
            <input id="mobile" className="form-input" inputMode="numeric" maxLength={10}
              value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} />
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="displayUsername" className="form-label">{t("username")}</label>
              <input id="displayUsername" className="form-input" autoComplete="username"
                value={displayUsername} onChange={(e) => setDisplayUsername(e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label">{t("password")}</label>
            <input id="password" type="password" className="form-input"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "…" : mode === "login" ? t("login") : t("register")}
          </button>
        </form>

        <div className="login-switch">
          {mode === "login" ? (
            <button className="link-btn" onClick={() => switchMode("register")}>{t("noAccount")}</button>
          ) : (
            <button className="link-btn" onClick={() => switchMode("login")}>{t("alreadyHaveAccount")}</button>
          )}
        </div>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <Link to="/" className="link-btn">← {t("home")}</Link>
        </div>
      </div>
    </div>
  );
}
