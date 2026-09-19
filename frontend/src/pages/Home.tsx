import { useApp } from "../context/AppContext";

export default function Home() {
  const { t } = useApp();
  return (
    <div className="page">
      <section className="features">
        <div className="feature-card">
          <span className="feature-icon">📅</span>
          <h3>{t("bookAppointment")}</h3>
          <p>{t("featureBooking")}</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🤖</span>
          <h3>{t("findDoctor")}</h3>
          <p>{t("featureFinder")}</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🔔</span>
          <h3>{t("myFollowUps")}</h3>
          <p>{t("featureFollowUp")}</p>
        </div>
      </section>

    </div>
  );
}
