import { useState } from "react"
import { useNavigate } from "react-router-dom"

const GOLD = "#D4A017"
const BG_DARK = "#0f0f0f"
const BG_PANEL = "#141414"
const BORDER = "rgba(212,160,23,0.2)"
const TEXT_MUTED = "rgba(255,255,255,0.45)"
const TEXT_DIM = "rgba(255,255,255,0.65)"

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("https://pydesignhk-backend.onrender.com/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.")
        setLoading(false)
        return
      }

      localStorage.setItem("adminToken", data.token)
      localStorage.setItem("admin", JSON.stringify(data.admin))
      window.location.href = "/admin/dashboard"

    } catch (err) {
      setError("Network error. Please check your connection.")
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      {/* Left panel — branding */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <p style={styles.brandTag}>PYDESIGNHK</p>
          <h1 style={styles.brandTitle}>
            Admin<br /><em style={styles.brandItalic}>Portal</em>
          </h1>
          <p style={styles.brandSub}>
            Manage inquiries, track projects, and stay in control of every renovation.
          </p>
          <div style={styles.brandDivider} />
          <p style={styles.brandNote}>Authorised personnel only.</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={styles.right}>
        <div style={styles.formWrap}>
          <p style={styles.formTag}>ADMIN ACCESS</p>
          <h2 style={styles.formTitle}>Sign in</h2>
          <p style={styles.formSub}>Enter your credentials to access the dashboard.</p>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>EMAIL</label>
            <input
              style={styles.input}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin() }}
              autoComplete="email"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>PASSWORD</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin() }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <button
            style={{
              ...styles.loginBtn,
              background: loading ? "rgba(212,160,23,0.4)" : GOLD,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={handleLogin}
            disabled={loading}
            type="button"
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <p style={styles.backLink}>
            <span
              style={{ color: TEXT_MUTED, fontSize: "12px", cursor: "pointer", letterSpacing: "0.06em" }}
              onClick={() => navigate("/")}
            >
              ← Back to site
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: BG_DARK,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },

  // Left branding panel
  left: {
    width: "45%",
    background: BG_PANEL,
    borderRight: `1px solid ${BORDER}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px",
  },
  leftInner: {
    maxWidth: "360px",
  },
  brandTag: {
    fontSize: "11px",
    letterSpacing: "0.22em",
    color: GOLD,
    margin: "0 0 32px",
    fontWeight: "600",
  },
  brandTitle: {
    fontSize: "56px",
    fontFamily: "Georgia, serif",
    fontWeight: "400",
    color: "#fff",
    margin: "0 0 24px",
    lineHeight: 1.1,
  },
  brandItalic: {
    fontStyle: "italic",
    color: GOLD,
  },
  brandSub: {
    fontSize: "14px",
    color: TEXT_DIM,
    lineHeight: 1.8,
    margin: "0 0 40px",
  },
  brandDivider: {
    width: "40px",
    height: "1px",
    background: BORDER,
    margin: "0 0 24px",
  },
  brandNote: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    color: TEXT_MUTED,
  },

  // Right form panel
  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px",
  },
  formWrap: {
    width: "100%",
    maxWidth: "400px",
  },
  formTag: {
    fontSize: "11px",
    letterSpacing: "0.22em",
    color: TEXT_MUTED,
    margin: "0 0 16px",
  },
  formTitle: {
    fontSize: "36px",
    fontFamily: "Georgia, serif",
    fontWeight: "400",
    color: "#fff",
    margin: "0 0 8px",
  },
  formSub: {
    fontSize: "13px",
    color: TEXT_MUTED,
    margin: "0 0 40px",
    lineHeight: 1.6,
  },
  fieldGroup: {
    marginBottom: "24px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "11px",
    letterSpacing: "0.18em",
    color: TEXT_MUTED,
    marginBottom: "10px",
  },
  input: {
    width: "100%",
    background: BG_PANEL,
    border: `1px solid rgba(255,255,255,0.1)`,
    color: "#fff",
    padding: "13px 16px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  },
  errorBox: {
    padding: "12px 16px",
    background: "rgba(255,80,80,0.08)",
    border: "1px solid rgba(255,80,80,0.25)",
    color: "rgba(255,120,120,0.9)",
    fontSize: "13px",
    lineHeight: 1.5,
    marginBottom: "20px",
  },
  loginBtn: {
    width: "100%",
    border: "none",
    color: "#000",
    padding: "15px",
    fontSize: "13px",
    letterSpacing: "0.12em",
    fontWeight: "600",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
    marginBottom: "24px",
  },
  backLink: {
    textAlign: "center",
    margin: 0,
  },
}