import { useState } from "react";

const NAV_LINKS = ["Home", "Services", "Cost Estimator", "Track Project"];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("customer", JSON.stringify(data.customer));
        window.location.href = "/";
      }
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoText}>PYDesignHK</span>
        </div>
        <div style={styles.navLinks}>
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" style={styles.navLink}>
              {link}
            </a>
          ))}
        </div>
        <a href="/login" style={styles.navLoginBtn}>
          LOGIN
        </a>
      </nav>

      {/* Main */}
      <div style={styles.main}>
        {/* Left panel — image */}
        <div style={styles.leftPanel}>
          <div style={styles.leftOverlay} />
          <div style={styles.leftContent}>
            <p style={styles.leftTagline}>Architectural Excellence.</p>
            <p style={styles.leftSub}>
              Crafting spaces that resonate with permanence and prestige. Log in
              to manage your bespoke interior journey.
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div style={styles.rightPanel}>
          <div style={styles.formWrap}>
            <h1 style={styles.heading}>Welcome Back</h1>
            <p style={styles.subheading}>
              Access your project dashboard and cost estimators.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Email */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>EMAIL ADDRESS</label>
                <div style={styles.inputWrap}>
                  <svg style={{width:16,height:16,color:'rgba(255,255,255,0.45)'}} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={styles.fieldGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>PASSWORD</label>
                  <a href="#" style={styles.forgot}>
                    FORGOT?
                  </a>
                </div>
                <div style={styles.inputWrap}>
                  <svg style={{width:16,height:16,color:'rgba(255,255,255,0.45)'}} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {error && <p style={styles.errorMsg}>{error}</p>}

              {/* Submit */}
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "AUTHENTICATING..." : "AUTHENTICATE →"}
              </button>

              {/* Divider */}
              <div style={styles.divider}>
                <span style={styles.dividerLine} />
                <span style={styles.dividerText}>OR CONTINUE WITH</span>
                <span style={styles.dividerLine} />
              </div>

              {/* Social */}
              <div style={styles.socialRow}>
                <button type="button" style={styles.socialBtn}>
                  <span style={styles.socialIcon}>G</span> GOOGLE
                </button>
                <button type="button" style={styles.socialBtn}>
                  <span style={styles.socialIcon}>🔑</span> SSO
                </button>
              </div>
            </form>

            <p style={styles.registerRow}>
              New to P&Y Interior?{" "}
              <a href="/register" style={styles.registerLink}>
                Initialize Project Profile
              </a>
            </p>
          </div>

          <p style={styles.footerText}>
            © 2024 PYDESIGNHK. BUILT FOR PERMANENCE.
            <span style={styles.footerLinks}>
              &nbsp;&nbsp;PRIVACY &nbsp;&nbsp;LEGAL
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const GOLD = "#D4A017";
const GOLD_HOVER = "#F0B820";
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
    transition: "color 0.2s",
  },
  navLoginBtn: {
    border: `1px solid ${GOLD}`,
    color: GOLD,
    padding: "7px 22px",
    fontSize: "12px",
    letterSpacing: "0.12em",
    textDecoration: "none",
    transition: "background 0.2s",
  },
  main: {
    display: "flex",
    flex: 1,
    minHeight: "calc(100vh - 64px)",
  },
  leftPanel: {
    flex: '0 0 45%',
    background: `linear-gradient(135deg, #0a0a0a 0%, #1a1510 100%)`,
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
    padding: "48px",
    backgroundImage:
      "url('bedroom.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  leftOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "420px",
  },
  leftTagline: {
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    fontSize: "36px",
    color: GOLD,
    margin: "0 0 16px",
    lineHeight: 1.2,
  },
  leftSub: {
    fontSize: "14px",
    color: TEXT_DIM,
    lineHeight: 1.7,
    margin: 0,
  },
  rightPanel: {
    flex: 1,
    minHeight: "calc(100vh - 64px)",
    background: BG_PANEL,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "64px 56px 32px",
    borderLeft: `1px solid ${BORDER}`,
  },
  formWrap: {
  flex: 1,
  maxWidth: '420px',
  width: '100%',
  margin: '0 auto',
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
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgot: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    color: TEXT_MUTED,
    textDecoration: "none",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid rgba(255,255,255,0.1)`,
    padding: "0 14px",
    height: "48px",
    gap: "10px",
    transition: "border-color 0.2s",
  },
  inputIcon: {
    fontSize: "14px",
    color: TEXT_MUTED,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: TEXT_MUTED,
    padding: 0,
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
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.08)",
    display: "block",
  },
  dividerText: {
    fontSize: "11px",
    color: TEXT_MUTED,
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
  },
  socialRow: {
    display: "flex",
    gap: "12px",
  },
  socialBtn: {
    flex: 1,
    height: "46px",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid rgba(255,255,255,0.1)`,
    color: TEXT_DIM,
    fontSize: "12px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "inherit",
  },
  socialIcon: {
    fontSize: "14px",
  },
  registerRow: {
    marginTop: "32px",
    fontSize: "13px",
    color: TEXT_MUTED,
    textAlign: "center",
  },
  registerLink: {
    color: GOLD,
    textDecoration: "none",
    fontStyle: "italic",
  },
  footerText: {
  fontSize: "11px",
  color: "rgba(255,255,255,0.2)",
  letterSpacing: "0.06em",
  marginTop: "32px",
  textAlign: "center",
},
  footerLinks: {
    color: "rgba(255,255,255,0.2)",
  },
};