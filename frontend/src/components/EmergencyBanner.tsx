import { useApp } from "../context/AppContext";

export default function EmergencyBanner() {
  const { t } = useApp();
  return (
    <div className="emergency-banner" role="alert">
      {t("emergencyNotice")}
    </div>
  );
}
