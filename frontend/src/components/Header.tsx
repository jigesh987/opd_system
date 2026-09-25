import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Header() {
  const { t, authUser, setAuthUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Do not render Patient Navbar inside Admin Portal routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const isAdmin = authUser?.role === "ADMIN";
  const isPatient = authUser?.role === "PATIENT";

  const navLinks = [
    { to: "/", label: t("home"), show: true },
    { to: "/doctors", label: "Doctors", show: true },
    { to: "/book", label: t("bookAppointment"), show: true },
    { to: "/chatbot", label: t("findDoctor"), show: true },
    { to: "/followup", label: t("myFollowUps"), show: true },
    { to: "/my-appointments", label: "My Appointments", show: isPatient },
    { to: "/admin", label: "Admin Panel", show: isAdmin },
  ];

  function handleLogout() {
    setAuthUser(null);
    setMenuOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">🏥</span>
          <span className="brand-name">{t("appName")}</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          ☰
        </button>

        <nav className={`nav ${menuOpen ? "nav-open" : ""}`}>
          {navLinks.filter(l => l.show).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${location.pathname === l.to ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}

          {authUser ? (
            <div className="auth-area">
              {authUser.role === "PATIENT" ? (
                <Link to="/profile" className="auth-user" onClick={() => setMenuOpen(false)}>👤 {authUser.username}</Link>
              ) : (
                <span className="auth-user">👤 {authUser.username}</span>
              )}
              <button className="lang-btn" onClick={handleLogout}>{t("logout")}</button>
            </div>
          ) : (
            <Link to="/login" className="nav-link nav-login" onClick={() => setMenuOpen(false)}>
              {t("login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
