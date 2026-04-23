import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NAV_LINKS = ["Home", "Services", "Cost Estimator", "Track Project"];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.root}>
      <Navbar />

      {/* Section 1 — Hero */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <p style={styles.heroTag}>EST. 1994 · PREMIUM INTERIORS</p>
          <h1 style={styles.heroHeading}>
            Architecture<br />
            is the <em style={styles.heroItalic}>soul</em><br />
            of living.
          </h1>
          <p style={styles.heroSub}>
            Crafting bespoke interior environments that marry structural
            permanence with the warmth of high-end design.
          </p>
          <div style={styles.heroBtns}>
            <button style={styles.heroBtnPrimary}>START CONSULTATION</button>
            <button style={styles.heroBtnOutline}>VIEW PORTFOLIO</button>
          </div>
        </div>
      </section>

      {/* Section 2 — Feature Cards */}
    <section style={styles.featureSection}>
    <div style={styles.featureCard}>
        <div style={styles.featureCardText}>
        <h3 style={styles.featureTitle}>Precision Cost Estimator</h3>
        <p style={styles.featureText}>
            Get an architect-grade budget projection for your renovation based
            on premium material selection and structural requirements.
        </p>
        </div>
        <a href="#" style={styles.featureLink}>CALCULATE YOUR VISION →</a>
    </div>

    <div style={styles.featureDivider} />

    <div style={styles.featureCard}>
        <div style={styles.featureCardText}>
        <h3 style={styles.featureTitle}>Live Project Tracking</h3>
        <p style={styles.featureText}>
            Real-time updates, milestone photos, and budget transparency through
            our exclusive client portal.
        </p>
        </div>
        <a href="/login" style={styles.featureLink}>TRACK YOUR OWN PROJECT →</a>
    </div>
    </section>

      {/* Section 3 — Capability */}
      <section style={styles.capabilitySection}>
        <h2 style={styles.capabilityHeading}>
          The P&Y <em style={styles.capabilityItalic}>Capability</em>
        </h2>
        <div style={styles.capabilityDivider} />
        <div style={styles.capabilityGrid}>
          {[
            {
              img: "/kitchen.png",
              title: "Kitchen Mastery",
              text: "Structural overhauls that integrate professional-grade appliances with handcrafted cabinetry and stone surfaces.",
            },
            {
              img: "/social.png",
              title: "Social Architecture",
              text: "Reimagining living spaces through lighting design, bespoke network, and seamless indoor-outdoor transitions.",
            },
            {
              img: "/whole.png",
              title: "Whole-Home Refinement",
              text: "End-to-end interior transformations that harmonize every room under a singular, cohesive aesthetic vision.",
            },
          ].map((item) => (
            <div key={item.title} style={styles.capabilityItem}>
              <div
                style={{
                  ...styles.capabilityImg,
                  backgroundImage: `url('${item.img}')`,
                }}
              />
              <h4 style={styles.capabilityItemTitle}>{item.title}</h4>
              <p style={styles.capabilityItemText}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4 — Mission */}
      <section style={styles.missionSection}>
        <div style={styles.missionImage} />
        <div style={styles.missionContent}>
          <p style={styles.missionTag}>OUR MISSION</p>
          <h2 style={styles.missionHeading}>
            Permanent Quality<br />
            in an <em style={styles.missionItalic}>Ephemeral</em><br />
            World.
          </h2>
          <p style={styles.missionQuote}>
            "Our goal isn't just to finish a project; it's to create an
            inheritance. We believe the spaces we inhabit shape the lives we
            lead."
          </p>
          <div style={styles.missionPoints}>
            {[
              {
                num: "01.",
                title: "STRUCTURAL INTEGRITY FIRST",
                text: "We never compromise on the 'bones'. Aesthetic beauty must be supported by engineering excellence.",
              },
              {
                num: "02.",
                title: "TRANSPARENT ACCOUNTABILITY",
                text: "Through our digital tracking system, you are never in the dark about budget or timeline.",
              },
              {
                num: "03.",
                title: "BESPOKE CURATION",
                text: "Every material is hand-selected from our network of global premium suppliers.",
              },
            ].map((point) => (
              <div key={point.num} style={styles.missionPoint}>
                <span style={styles.missionNum}>{point.num}</span>
                <div>
                  <p style={styles.missionPointTitle}>{point.title}</p>
                  <p style={styles.missionPointText}>{point.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaHeading}>
          Ready to Elevate Your Living Standard?
        </h2>
        <p style={styles.ctaSub}>
          Schedule a private site visit or studio consultation today.
        </p>
        <div style={styles.ctaBtns}>
          <button style={styles.ctaBtnPrimary}>REQUEST PROPOSAL</button>
          <a href="#" style={styles.ctaBtnText}>Download Brochure (PDF)</a>
        </div>
      </section>

      {/* Footer */}
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
    background: BG_DARK,
    color: "#fff",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
  navLogo: { display: "flex", alignItems: "center", gap: "10px" },
  navLogoText: {
    color: GOLD,
    fontStyle: "italic",
    fontSize: "17px",
    letterSpacing: "0.04em",
    fontFamily: "Georgia, serif",
  },
  navLinks: { display: "flex", gap: "36px" },
  navLink: {
    color: TEXT_DIM,
    textDecoration: "none",
    fontSize: "13px",
    letterSpacing: "0.08em",
  },
  navLoginBtn: {
    border: `1px solid ${GOLD}`,
    color: "#000",
    background: GOLD,
    padding: "7px 22px",
    fontSize: "12px",
    fontWeight:"600",
    letterSpacing: "0.12em",
    textDecoration: "none",
  },

  // Hero
  hero: {
    position: "relative",
    height: "100vh",
    backgroundImage: "url('/livingroom.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.2) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    padding: "0 80px",
    maxWidth: "580px",
  },
  heroTag: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: TEXT_MUTED,
    margin: "0 0 24px",
  },
  heroHeading: {
    fontSize: "64px",
    fontWeight: "400",
    fontFamily: "Georgia, serif",
    color: "#fff",
    margin: "0 0 24px",
    lineHeight: 1.1,
  },
  heroItalic: { fontStyle: "italic", color: GOLD },
  heroSub: {
    fontSize: "15px",
    color: TEXT_DIM,
    lineHeight: 1.7,
    margin: "0 0 36px",
    maxWidth: "380px",
  },
  heroBtns: { display: "flex", gap: "16px" },
  heroBtnPrimary: {
    background: GOLD,
    color: "#000",
    border: "none",
    padding: "14px 28px",
    fontSize: "12px",
    letterSpacing: "0.12em",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  heroBtnOutline: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    padding: "14px 28px",
    fontSize: "12px",
    letterSpacing: "0.12em",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // Features
  featureSection: {
    display: "flex",
    background: "#111",
    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
    paddingLeft: "100px",
    paddingTop: "70px",
    paddingBottom: "50px"
  },
  featureCard: {
    flex: 1,
    padding: "56px 64px",
    display: "flex",              // ← side by side layout
    flexDirection: "row",
    alignItems: "center",
    gap: "40px",
  },
  featureDivider: {
    width: "1px",
    background: BORDER,
    margin: "1px 0",
  },

  featureTitle: {
    fontSize: "35px",             // ← larger
    fontWeight: "400",
    color: "#fff",
    margin: "0 0 12px",
    fontFamily: "Georgia, serif",
  },
  featureText: {
    fontSize: "17px",
    color: TEXT_MUTED,
    lineHeight: 1.7,
    margin: "0 0 24px",
    marginTop: "30px",
    maxWidth: "340px",
  },
  featureLink: {
  display: "inline-block",
  fontSize: "14px",
  letterSpacing: "0.12em",
  color: GOLD,
  textDecoration: "none",
  border: `1px solid ${GOLD}`,
  padding: "14px 24px",
  marginLeft: "50px",
  whiteSpace: "nowrap",
  flexShrink: 0,
},

  // Capability
  capabilitySection: {
    padding: "96px 80px",
    background: BG_DARK,
  },
  capabilityHeading: {
    fontSize: "36px",
    fontWeight: "400",
    fontFamily: "Georgia, serif",
    color: "#fff",
    margin: "0 0 12px",
  },
  capabilityItalic: { fontStyle: "italic", color: GOLD },
  capabilityDivider: {
    width: "48px",
    height: "2px",
    background: GOLD,
    margin: "0 0 56px",
  },
  capabilityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "40px",
  },
  capabilityItem: {},
  capabilityImg: {
    width: "80%",
    paddingLeft: "25%",
    paddingBottom: "80%",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    marginBottom: "40px",
  },
  capabilityItemTitle: {
    fontSize: "22px",
    paddingLeft: "12%",
    fontWeight: "400",
    color: "#fff",
    margin: "0 0 10px",
    fontFamily: "Georgia, serif",
  },
  capabilityItemText: {
    fontSize: "15px",
    paddingLeft: "12%",
    color: TEXT_MUTED,
    lineHeight: 1.7,
    margin: 0,
  },

  // Mission
  missionSection: {
  display: "flex",
  alignItems: "center",      // ← add this
  paddingTop: "50px",
  paddingLeft: "50px",
  paddingBottom: "50px",
  minHeight: "600px",
  borderTop: `1px solid ${BORDER}`,
},
missionImage: {
  flex: "0 0 48%",
  alignSelf: "stretch",      // ← forces image to fill full height
  backgroundImage: "url('/mission.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#111",
},
missionContent: {
  flex: 1,
  padding: "0 94px 96px",         // ← remove the 80px top padding
  background: "#111",
  display: "flex",           // ← add these two
  flexDirection: "column",
  justifyContent: "center",
},
  missionTag: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: GOLD,
    margin: "0 0 20px",
  },
  missionHeading: {
    fontSize: "42px",
    fontWeight: "400",
    fontFamily: "Georgia, serif",
    color: "#fff",
    margin: "0 0 28px",
    lineHeight: 1.15,
  },
  missionItalic: { fontStyle: "italic", color: GOLD },
  missionQuote: {
    fontSize: "16px",
    color: TEXT_MUTED,
    lineHeight: 1.7,
    margin: "0 0 36px",
    fontStyle: "italic",
    borderLeft: `2px solid ${GOLD}`,
    paddingLeft: "16px",
  },
  missionPoints: { display: "flex", flexDirection: "column", gap: "24px" },
  missionPoint: { display: "flex", gap: "20px", alignItems: "flex-start" },
  missionNum: {
    fontSize: "25px",
    color: GOLD,
    fontWeight: "600",
    flexShrink: 0,
    marginTop: "2px",
  },
  missionPointTitle: {
    fontSize: "15px",
    letterSpacing: "0.12em",
    color: "#fff",
    margin: "0 0 6px",
  },
  missionPointText: {
    fontSize: "15px",
    color: TEXT_MUTED,
    lineHeight: 1.6,
    margin: 0,
  },

  // CTA
  ctaSection: {
    padding: "120px 80px",
    textAlign: "center",
    background: BG_DARK,
    borderTop: `1px solid ${BORDER}`,
  },
  ctaHeading: {
    fontSize: "40px",
    fontWeight: "400",
    fontFamily: "Georgia, serif",
    color: "#fff",
    margin: "0 0 16px",
  },
  ctaSub: {
    fontSize: "15px",
    color: TEXT_MUTED,
    margin: "0 0 40px",
  },
  ctaBtns: {
    display: "flex",
    gap: "24px",
    justifyContent: "center",
    alignItems: "center",
  },
  ctaBtnPrimary: {
    background: GOLD,
    color: "#000",
    border: "none",
    padding: "16px 36px",
    fontSize: "12px",
    letterSpacing: "0.14em",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  ctaBtnText: {
    fontSize: "14px",
    color: TEXT_DIM,
    textDecoration: "none",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    paddingBottom: "2px",
  },

  // Footer
  footer: {
    borderTop: `1px solid ${BORDER}`,
    background: "#0a0a0a",
  },
  footerTop: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 2fr",
    gap: "48px",
    padding: "64px 80px 48px",
  },
  footerBrand: {},
  footerLogo: {
    fontSize: "13px",
    letterSpacing: "0.1em",
    color: "#fff",
    margin: "0 0 16px",
    fontWeight: "500",
  },
  footerBrandText: {
    fontSize: "13px",
    color: TEXT_MUTED,
    lineHeight: 1.7,
    margin: "0 0 16px",
  },
  footerLocation: {
    fontSize: "12px",
    color: TEXT_MUTED,
    margin: 0,
  },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerColTitle: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    color: TEXT_MUTED,
    margin: "0 0 4px",
  },
  footerLink: {
    fontSize: "13px",
    color: TEXT_DIM,
    textDecoration: "none",
  },
  footerNewsletterText: {
    fontSize: "13px",
    color: TEXT_MUTED,
    lineHeight: 1.6,
    margin: "0 0 12px",
  },
  footerNewsletterRow: {
    display: "flex",
    gap: "0",
  },
  footerInput: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRight: "none",
    color: "#fff",
    padding: "10px 14px",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
  },
  footerInputBtn: {
    background: GOLD,
    border: "none",
    color: "#000",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },
  footerBottom: {
    borderTop: `1px solid ${BORDER}`,
    padding: "20px 80px",
    textAlign: "center",
  },
  footerCopy: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.2)",
    letterSpacing: "0.06em",
    margin: 0,
  },
};