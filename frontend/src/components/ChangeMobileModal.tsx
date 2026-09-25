import { useState, useRef, useEffect } from "react";
import { api } from "../data/api";

type Step = "form" | "otp" | "success";

interface Props {
  currentMobile: string;
  onClose: () => void;
  onSuccess: (newMobile: string) => void; // called after successful change → parent logs out
}

export default function ChangeMobileModal({ currentMobile, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("form");

  // Step 1 state
  const [newMobile, setNewMobile] = useState("");
  const [password, setPassword] = useState("");
  const [step1Error, setStep1Error] = useState("");
  const [step1Loading, setStep1Loading] = useState(false);

  // Step 2 (OTP) state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step2Error, setStep2Error] = useState("");
  const [step2Loading, setStep2Loading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  // ── Step 1: request OTP ──────────────────────────────────────────────────────

  function validateStep1(): string | null {
    if (!/^[6-9]\d{9}$/.test(newMobile)) return "Enter a valid 10-digit Indian mobile number.";
    if (newMobile === currentMobile) return "New mobile must be different from your current mobile.";
    if (!password.trim()) return "Current password is required.";
    return null;
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setStep1Error(err); return; }
    setStep1Error("");
    setStep1Loading(true);
    try {
      await api.requestMobileChange(newMobile, password);
      setStep(step === "form" ? "otp" : "otp");
      setStep("otp");
      setResendCountdown(60); // 60s before resend is allowed
    } catch (e: any) {
      setStep1Error(e.message ?? "Failed to send OTP. Please try again.");
    } finally {
      setStep1Loading(false);
    }
  }

  // ── Step 2: verify OTP ───────────────────────────────────────────────────────

  function handleOtpKey(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpChange(index: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[index] = val.slice(-1); // only last digit
    setOtp(next);
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length !== 6) { setStep2Error("Enter the full 6-digit OTP."); return; }
    setStep2Error("");
    setStep2Loading(true);
    try {
      await api.verifyMobileChangeOtp(newMobile, otpStr);
      setStep("success");
    } catch (e: any) {
      setStep2Error(e.message ?? "Invalid OTP. Please try again.");
    } finally {
      setStep2Loading(false);
    }
  }

  async function handleResendOtp() {
    if (resendCountdown > 0) return;
    setStep2Error("");
    try {
      await api.requestMobileChange(newMobile, password);
      setOtp(["", "", "", "", "", ""]);
      setResendCountdown(60);
      otpRefs.current[0]?.focus();
    } catch (e: any) {
      setStep2Error(e.message ?? "Failed to resend OTP.");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      id="change-mobile-modal-overlay"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget && step !== "success") onClose(); }}
    >
      <div
        id="change-mobile-modal"
        style={{
          background: "var(--card-bg, #1e2535)",
          border: "1px solid var(--border, #2d3748)",
          borderRadius: "1.25rem",
          padding: "2rem",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        {/* Step indicator */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {(["form", "otp", "success"] as Step[]).map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1, height: "4px", borderRadius: "2px",
                background: step === s
                  ? "var(--primary, #6366f1)"
                  : i < (step === "success" ? 3 : step === "otp" ? 1 : 0)
                    ? "var(--primary, #6366f1)"
                    : "var(--border, #2d3748)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* ── Step 1: Form ───────────────────────────────────────────────────── */}
        {step === "form" && (
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary, #f1f5f9)" }}>
                🔐 Change Mobile Number
              </h2>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", color: "var(--text-muted, #94a3b8)" }}>
                Current: <strong style={{ color: "var(--text-primary, #f1f5f9)" }}>{currentMobile}</strong>
              </p>
            </div>

            <form id="change-mobile-form" onSubmit={handleRequestOtp} noValidate>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="new-mobile-input">New Mobile Number</label>
                <input
                  id="new-mobile-input"
                  className="form-input"
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="form-label" htmlFor="current-password-input">
                  Current Password <span style={{ color: "var(--text-muted)" }}>(to verify it's you)</span>
                </label>
                <input
                  id="current-password-input"
                  className="form-input"
                  type="password"
                  placeholder="Your current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {step1Error && (
                <div style={{
                  background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "0.5rem", padding: "0.75rem 1rem",
                  color: "#fca5a5", fontSize: "0.875rem", marginBottom: "1rem",
                }}>
                  ⚠️ {step1Error}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  id="send-otp-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={step1Loading}
                >
                  {step1Loading ? "Sending OTP…" : "Send OTP →"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={step1Loading}
                >
                  Cancel
                </button>
              </div>

              <p style={{ marginTop: "1rem", fontSize: "0.78rem", color: "var(--text-muted, #64748b)", lineHeight: 1.5 }}>
                An OTP will be sent to your new mobile number. Your current number remains active until you verify the OTP.
              </p>
            </form>
          </>
        )}

        {/* ── Step 2: OTP ────────────────────────────────────────────────────── */}
        {step === "otp" && (
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary, #f1f5f9)" }}>
                📱 Verify OTP
              </h2>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", color: "var(--text-muted, #94a3b8)" }}>
                Enter the 6-digit OTP sent to <strong style={{ color: "var(--text-primary, #f1f5f9)" }}>{newMobile}</strong>
              </p>
            </div>

            <form id="verify-otp-form" onSubmit={handleVerifyOtp} noValidate>
              {/* 6-box OTP input */}
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1.25rem" }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    id={`otp-box-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    autoFocus={i === 0}
                    style={{
                      width: "48px", height: "56px",
                      textAlign: "center", fontSize: "1.5rem", fontWeight: 700,
                      background: "var(--input-bg, #0f1623)",
                      border: `2px solid ${digit ? "var(--primary, #6366f1)" : "var(--border, #2d3748)"}`,
                      borderRadius: "0.625rem",
                      color: "var(--text-primary, #f1f5f9)",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                  />
                ))}
              </div>

              {step2Error && (
                <div style={{
                  background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "0.5rem", padding: "0.75rem 1rem",
                  color: "#fca5a5", fontSize: "0.875rem", marginBottom: "1rem",
                }}>
                  ⚠️ {step2Error}
                </div>
              )}

              <button
                id="verify-otp-btn"
                type="submit"
                className="btn btn-primary btn-full"
                disabled={step2Loading}
                style={{ marginBottom: "0.75rem" }}
              >
                {step2Loading ? "Verifying…" : "Verify & Change Mobile"}
              </button>

              <div style={{ textAlign: "center" }}>
                {resendCountdown > 0 ? (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Resend OTP in {resendCountdown}s
                  </span>
                ) : (
                  <button
                    id="resend-otp-btn"
                    type="button"
                    onClick={handleResendOtp}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--primary, #6366f1)", fontSize: "0.875rem",
                      textDecoration: "underline",
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep("form"); setStep2Error(""); setOtp(["","","","","",""]); }}
                style={{
                  display: "block", width: "100%", marginTop: "1rem",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: "0.8rem",
                }}
              >
                ← Change new number
              </button>
            </form>
          </>
        )}

        {/* ── Step 3: Success ─────────────────────────────────────────────────── */}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>✅</div>
            <h2 style={{ margin: "0 0 0.5rem", color: "var(--text-primary, #f1f5f9)" }}>
              Mobile Number Changed!
            </h2>
            <p style={{ color: "var(--text-muted, #94a3b8)", marginBottom: "0.5rem" }}>
              Your new mobile number is:
            </p>
            <p style={{
              fontSize: "1.25rem", fontWeight: 700,
              color: "var(--primary, #6366f1)", marginBottom: "1.5rem",
            }}>
              {newMobile}
            </p>
            <p style={{
              fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1.5rem",
              background: "rgba(99,102,241,0.1)", borderRadius: "0.5rem", padding: "0.75rem",
              lineHeight: 1.6,
            }}>
              Your session has been invalidated for security. Please log in again using your new mobile number.
            </p>
            <button
              id="mobile-changed-login-btn"
              className="btn btn-primary btn-full"
              onClick={() => onSuccess(newMobile)}
            >
              Go to Login →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
