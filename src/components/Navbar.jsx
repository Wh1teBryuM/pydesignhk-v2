import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const GOLD = "#D4A017"
const BORDER = "rgba(212,160,23,0.2)"
const NAV_LINKS = ["Home", "Services", "Cost Estimator", "Track Project"]

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  const handleAuthBtn = async () => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token")
      await fetch("http://localhost:3001/auth/logout", {
        method: "POST",
        headers: { Authorization: token },
      })
      localStorage.removeItem("token")
      localStorage.removeItem("customer")
      setIsLoggedIn(false)
      navigate("/")
    } else {
      navigate("/login")
    }
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.navLogo}>
        <img
          src="/logo.png"
          alt="PYDesignHK"
          style={{ height: "40px", width: "40px", marginRight: "10px", objectFit: "contain" }}
        />
        <span style={styles.navLogoText}>PYDesignHK</span>
      </div>
      <div style={styles.navLinks}>
        {NAV_LINKS.map((link) => (
          <a key={link} href="#" style={styles.navLink}>
            {link}
          </a>
        ))}
      </div>
      <button onClick={handleAuthBtn} style={isLoggedIn ? styles.navLogoutBtn : styles.navLoginBtn}>
    {isLoggedIn ? "LOG OUT" : "LOGIN"}
    </button>
    </nav>
  )
}

const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 48px",
    height: "64px",
    borderBottom: `1px solid ${BORDER}`,
    background: "#0f0f0f",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
  },
  navLogoText: {
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    fontSize: "20px",
    color: GOLD,
  },
  navLinks: {
    display: "flex",
    gap: "32px",
  },
  navLink: {
    fontSize: "13px",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.65)",
    textDecoration: "none",
  },
  navLoginBtn: {
    fontSize: "12px",
    letterSpacing: "0.12em",
    color: "#000",
    background: GOLD,
    border: "none",
    paddingTop: "7px",
    paddingBottom: "7px",
    paddingRight: "30px",
    paddingLeft: "30px",
    cursor: "pointer",
    fontWeight: "600",
  },

  navLogoutBtn: {
  fontSize: "12px",
  fontWeight: "1200",
  letterSpacing: "0.12em",
  color: "#000",
  background: GOLD,
  border: "none",
  paddingTop: "15px",
  paddingBottom: "15px",
  paddingRight: "25px",  // ← adjust as needed
  paddingLeft: "25px",
  cursor: "pointer",
  fontWeight: "600",
}
}