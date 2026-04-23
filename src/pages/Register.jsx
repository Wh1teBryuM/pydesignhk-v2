import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"

const NAV_LINKS = ["Home", "Services", "Cost Estimator", "Track Project"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!agreed) {
      setError("You must acknowledge the Terms of Engagement.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("customer", JSON.stringify(data.customer));
        navigate("/");
      }
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <Navbar />

      {/* Main */}
      <div style={styles.main}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={styles.leftOverlay} />
          <div style={styles.leftContent}>
            <p style={styles.leftTag}>BESPOKE EXCELLENCE</p>
            <h2 style={styles.leftHeading}>
              Crafting<br />
              <em style={styles.leftHeadingItalic}>Permanence.</em>
            </h2>
            <p style={styles.leftSub}>
              Begin your journey toward a space defined by architectural
              precision and unparalleled quality.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div style={styles.rightPanel}>
          <div style={styles.formWrap}>
            <h1 style={styles.heading}>Initialize Project Profile</h1>
            <p style={styles.subheading}>
              Enter your details to access your construction dashboard and
              project timeline.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Full Name */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>FULL NAME</label>
                <div style={styles.inputWrap}>
                  <input
                    type="text"
                    placeholder="Peter Lau"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>EMAIL ADDRESS</label>
                <div style={styles.inputWrap}>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>SECURITY KEY (PASSWORD)</label>
                <div style={styles.inputWrap}>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Checkbox */}
              <div style={styles.checkboxWrap}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="terms" style={styles.checkboxLabel}>
                  I acknowledge the{" "}
                  <a href="#" style={styles.termsLink}>
                    Terms of Engagement
                  </a>{" "}
                  and consent to the digital handling of project blueprints and
                  contracts.
                </label>
              </div>

              {error && <p style={styles.errorMsg}>{error}</p>}

              {/* Submit */}
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "CREATING PROFILE..." : "CREATE PROFILE"}
              </button>

              {/* Divider */}
              <div style={styles.existingWrap}>
                <p style={styles.existingText}>EXISTING PARTNER?</p>
                <button
                  type="button"
                  style={styles.accessBtn}
                  onClick={() => navigate("/login")}
                >
                  ACCESS YOUR ACCOUNT
                </button>
              </div>

              <p style={styles.troubleText}>
                Having trouble?{" "}
                <a href="#" style={styles.troubleLink}>
                  Contact Site Office
                </a>
              </p>
            </form>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerBrand}>PYDesignHK Ltd.</p>
            <div style={styles.footerLinks}>
              <a href="#" style={styles.footerLink}>TERMS OF SERVICE</a>
              <a href="#" style={styles.footerLink}>PRIVACY POLICY</a>
              <a href="#" style={styles.footerLink}>CONTACT SUPPORT</a>
            </div>
            <p style={styles.footerCopy}>© 2024 PYDESIGNHK. CRAFTED FOR PERMANENCE.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const GOLD = "#D4A017";
const BG_DARK = "#0f0f0f";
const BG_PANEL = "#141414";
const BORDER = "rgba(212,160,23,0.2)";
const TEXT_MUTED = "rgba(255,255,255,0.45)";
const TEXT_DIM = "rgba(255,255,255,0.65)";

const styles = {
  root: {
    minHeight: "100vh",
    background: BG_DARK,
    color: "#fff",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 48px",
    height: "64px",
    borderBottom: `1px solid ${BORDER}`,
    background: "rgba(10,10,10,0.95)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  navLogoText: {
    color: GOLD,
    fontStyle: "italic",
    fontSize: "17px",
    letterSpacing: "0.04em",
    fontFamily: "Georgia, serif",
  },
  navLinks: {
    display: "flex",
    gap: "36px",
  },
  navLink: {
    color: TEXT_DIM,
    textDecoration: "none",
    fontSize: "13px",
    letterSpacing: "0.08em",
  },
  navLoginBtn: {
    border: `1px solid ${GOLD}`,
    color: GOLD,
    padding: "7px 22px",
    fontSize: "12px",
    letterSpacing: "0.12em",
    textDecoration: "none",
  },
  main: {
    display: "flex",
    flex: 1,
    minHeight: "calc(100vh - 64px)",
  },
  leftPanel: {
    flex: "0 0 45%",
    background: BG_DARK,
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
    padding: "48px",
    backgroundImage: "url('/cabinet.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  leftOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "420px",
  },
  leftTag: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: GOLD,
    margin: "0 0 16px",
  },
  leftHeading: {
    fontSize: "52px",
    fontWeight: "400",
    fontFamily: "Georgia, serif",
    color: "#fff",
    margin: "0 0 20px",
    lineHeight: 1.1,
  },
  leftHeadingItalic: {
    fontStyle: "italic",
    color: GOLD,
  },
  leftSub: {
    fontSize: "14px",
    color: TEXT_DIM,
    lineHeight: 1.7,
    margin: 0,
  },
  rightPanel: {
    flex: 1,
    background: BG_PANEL,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "64px 56px 32px",
    borderLeft: `1px solid ${BORDER}`,
    minHeight: "calc(100vh - 64px)",
  },
  formWrap: {
    flex: 1,
    maxWidth: "420px",
    width: "100%",
    margin: "0 auto",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "400",
    margin: "0 0 10px",
    color: "#fff",
    letterSpacing: "-0.01em",
  },
  subheading: {
    fontSize: "14px",
    color: TEXT_MUTED,
    margin: "0 0 40px",
    lineHeight: 1.6,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    color: TEXT_MUTED,
  },
  inputWrap: {
    borderBottom: `1px solid rgba(255,255,255,0.15)`,
    padding: "8px 0",
  },
  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: "15px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  checkboxWrap: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  checkbox: {
    marginTop: "3px",
    accentColor: GOLD,
    flexShrink: 0,
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  checkboxLabel: {
    fontSize: "13px",
    color: TEXT_DIM,
    lineHeight: 1.6,
    cursor: "pointer",
  },
  termsLink: {
    color: GOLD,
    textDecoration: "none",
  },
  errorMsg: {
    color: "#e05555",
    fontSize: "13px",
    margin: 0,
  },
  submitBtn: {
    background: GOLD,
    color: "#000",
    border: "none",
    height: "52px",
    fontSize: "13px",
    letterSpacing: "0.14em",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    width: "100%",
  },
  existingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  existingText: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    color: TEXT_MUTED,
    margin: 0,
  },
  accessBtn: {
    background: "transparent",
    border: `1px solid rgba(255,255,255,0.2)`,
    color: TEXT_DIM,
    height: "46px",
    width: "100%",
    fontSize: "12px",
    letterSpacing: "0.14em",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  troubleText: {
    fontSize: "13px",
    color: TEXT_MUTED,
    textAlign: "center",
    margin: 0,
  },
  troubleLink: {
    color: GOLD,
    textDecoration: "none",
  },
  footer: {
    marginTop: "48px",
    borderTop: `1px solid ${BORDER}`,
    paddingTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
  },
  footerBrand: {
    color: GOLD,
    fontStyle: "italic",
    fontFamily: "Georgia, serif",
    fontSize: "14px",
    margin: 0,
  },
  footerLinks: {
    display: "flex",
    gap: "24px",
  },
  footerLink: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    color: TEXT_MUTED,
    textDecoration: "none",
  },
  footerCopy: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.2)",
    letterSpacing: "0.06em",
    margin: 0,
  },
};