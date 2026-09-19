import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">🏥 {t("appName")}</span>
        <nav className="footer-links">
          <Link to="/book">{t("bookAppointment")}</Link>
          <Link to="/chatbot">{t("findDoctor")}</Link>
          <Link to="/followup">{t("myFollowUps")}</Link>
        </nav>
        <span className="footer-copy">© {new Date().getFullYear()} Smart OPD Connect</span>
      </div>
    </footer>
  );
}
