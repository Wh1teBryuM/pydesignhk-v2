import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";

const animationStyles = `
  @keyframes slideInLeft {
    from { transform: translateX(-60px); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
  }
  @keyframes fadeInUp {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
`

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const images = ["/bedroom.png", "/loginimage2.jpg", "/loginimage3.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://pydesignhk-backend.onrender.com/auth/login", {
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
      <style>{animationStyles}</style>
      <Navbar />

      <div style={styles.main}>
        {/* Left panel */}
        <div style={{ ...styles.leftPanel, backgroundImage: `url('${images[currentImage]}')`, transition: "background-image 1s ease-in-out", }}>
          <div style={styles.leftOverlay} />
          <div style={styles.leftContent}>
            <p style={styles.leftTagline}>Architectural Excellence.</p>
            <p style={styles.leftSub}>
              Crafting spaces that resonate with permanence and prestige. Log in
              to manage your bespoke interior journey.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div style={styles.rightPanel}>
          <div style={styles.formWrap}>

            <div style={{ animation: "fadeInUp 0.5s ease both", animationDelay: "0.1s" }}>
              <h1 style={styles.heading}>Welcome Back</h1>
              <p style={styles.subheading}>
                Sign in to continue your renovation journey with PYDesignHK
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>

              <div style={{ animation: "fadeInUp 0.5s ease both", animationDelay: "0.25s" }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>EMAIL ADDRESS</label>
                  <div style={styles.inputWrap}>
                    <svg style={{width:16,height:16,color:'rgba(255,255,255,0.45)'}} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
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
              </div>

              <div style={{ animation: "fadeInUp 0.5s ease both", animationDelay: "0.4s" }}>
                <div style={styles.fieldGroup}>
                  <div style={styles.labelRow}>
                    <label style={styles.label}>PASSWORD</label>
                    <a href="#" style={styles.forgot}>Forgot password?</a>
                  </div>
                  <div style={styles.inputWrap}>
                    <svg style={{width:16,height:16,color:'rgba(255,255,255,0.45)'}} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={styles.input}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      {showPassword ? (
                        <svg style={{width:16,height:16,color:'rgba(255,255,255,0.45)'}} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg style={{width:16,height:16,color:'rgba(255,255,255,0.45)'}} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p style={styles.errorMsg}>{error}</p>}

              <div style={{ animation: "fadeInUp 0.5s ease both", animationDelay: "0.55s" }}>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? "Signing In..." : "Sign In →"}
                </button>
              </div>

            </form>

            <div style={{ animation: "fadeInUp 0.5s ease both", animationDelay: "0.7s" }}>
              <p style={styles.registerRow}>
                New to PYDesignHK?{" "}
                <a href="/register" style={styles.registerLink}>Create an account</a>
              </p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
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
  main: {
    display: "flex",
    flex: 1,
    minHeight: "calc(100vh - 64px)",
  },
  leftPanel: {
    flex: "0 0 45%",
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
    padding: "48px",
    backgroundImage: "url('/bedroom.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    animation: "slideInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
  },
  leftOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)",
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
    fontSize: "17px",
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
    justifyContent: "center",
    padding: "64px 56px",
    borderLeft: `1px solid ${BORDER}`,
  },
  formWrap: {
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
    fontSize: "15px",
    color: TEXT_MUTED,
    margin: "5px 0 40px",
    paddingTop: "10px",
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
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "0 14px",
    height: "48px",
    gap: "10px",
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
    width: "100%",
    fontSize: "18px",
    letterSpacing: "0.14em",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
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
};