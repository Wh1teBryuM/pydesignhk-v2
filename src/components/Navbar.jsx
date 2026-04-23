const GOLD = "#D4A017"
const NAV_LINKS = ["Home", "Services", "Cost Estimator", "Track Project"]

export default function Navbar() {
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
      <a href="/login" style={styles.navLoginBtn}>
        LOGIN
      </a>
    </nav>
  )
}

const BORDER = "rgba(212,160,23,0.2)"

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
    paddingTop:"7px",
    paddingBottom:"7px",
    paddingRight:"30px",
    paddingLeft:"30px",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "none",
  },
}