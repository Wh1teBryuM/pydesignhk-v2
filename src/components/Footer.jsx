const GOLD = "#D4A017"
const BORDER = "rgba(212,160,23,0.2)"
const TEXT_MUTED = "rgba(255,255,255,0.45)"

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerGrid}>
        <div style={styles.footerCol}>
          <p style={styles.footerBrand}>PYDesignHK</p>
          <p style={styles.footerTagline}>Built for permanence.</p>
          <p style={styles.footerDesc}>
            Hong Kong's premier interior construction and design firm, crafting spaces that endure.
          </p>
        </div>
        <div style={styles.footerCol}>
          <p style={styles.footerColTitle}>NAVIGATION</p>
          {["Home", "Services", "Cost Estimator", "Track Project"].map(link => (
            <a key={link} href="#" style={styles.footerLink}>{link}</a>
          ))}
        </div>
        <div style={styles.footerCol}>
          <p style={styles.footerColTitle}>CONNECT</p>
          {["Instagram", "LinkedIn", "WhatsApp", "Email Us"].map(link => (
            <a key={link} href="#" style={styles.footerLink}>{link}</a>
          ))}
        </div>
        <div style={styles.footerCol}>
          <p style={styles.footerColTitle}>NEWSLETTER</p>
          <p style={styles.footerDesc}>Stay updated on our latest projects and insights.</p>
          <div style={styles.newsletterRow}>
            <input
              type="email"
              placeholder="your@email.com"
              style={styles.newsletterInput}
            />
            <button style={styles.newsletterBtn}>→</button>
          </div>
        </div>
      </div>
      <div style={styles.footerBottom}>
        <p style={styles.footerCopy}>© 2024 PYDESIGNHK. ALL RIGHTS RESERVED.</p>
        <div style={styles.footerBottomLinks}>
          <a href="#" style={styles.footerSmallLink}>PRIVACY</a>
          <a href="#" style={styles.footerSmallLink}>TERMS</a>
          <a href="#" style={styles.footerSmallLink}>SUPPORT</a>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    background: "#0a0a0a",
    borderTop: `1px solid ${BORDER}`,
    padding: "64px 80px 32px",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 2fr",
    gap: "48px",
    marginBottom: "48px",
  },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerBrand: {
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    fontSize: "20px",
    color: GOLD,
    margin: 0,
  },
  footerTagline: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.65)",
    margin: 0,
    fontStyle: "italic",
  },
  footerDesc: {
    fontSize: "13px",
    color: TEXT_MUTED,
    lineHeight: 1.7,
    margin: 0,
  },
  footerColTitle: {
    fontSize: "11px",
    letterSpacing: "0.16em",
    color: GOLD,
    margin: "0 0 4px",
  },
  footerLink: {
    fontSize: "13px",
    color: TEXT_MUTED,
    textDecoration: "none",
  },
  newsletterRow: {
    display: "flex",
    gap: "0",
  },
  newsletterInput: {
    flex: 1,
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${BORDER}`,
    borderRight: "none",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
  },
  newsletterBtn: {
    background: GOLD,
    border: "none",
    color: "#000",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  footerBottom: {
    borderTop: `1px solid ${BORDER}`,
    paddingTop: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerCopy: {
    fontSize: "11px",
    color: TEXT_MUTED,
    letterSpacing: "0.06em",
    margin: 0,
  },
  footerBottomLinks: {
    display: "flex",
    gap: "24px",
  },
  footerSmallLink: {
    fontSize: "11px",
    color: TEXT_MUTED,
    textDecoration: "none",
    letterSpacing: "0.08em",
  },
}