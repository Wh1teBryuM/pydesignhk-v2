import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const GOLD = "#D4A017";
const BG_DARK = "#0f0f0f";
const BG_PANEL = "#141414";
const BORDER = "rgba(212,160,23,0.2)";
const TEXT_MUTED = "rgba(255,255,255,0.45)";
const TEXT_DIM = "rgba(255,255,255,0.65)";

const HK_DISTRICTS = [
  "Central & Western", "Wan Chai", "Eastern", "Southern",
  "Yau Tsim Mong", "Sham Shui Po", "Kowloon City", "Wong Tai Sin",
  "Kwun Tong", "Tsuen Wan", "Tuen Mun", "Yuen Long",
  "North", "Tai Po", "Sha Tin", "Sai Kung", "Islands", "Kwai Tsing",
];

const PRIORITY_PROFILES = [
  {
    id: "look_good_control_cost",
    zh: "外觀為主，控制預算",
    en: "Look good, control cost",
    desc: "Aesthetics matter, but staying within budget is the priority.",
  },
  {
    id: "quality_first",
    zh: "質量為先，不計外觀",
    en: "Quality first, aesthetics secondary",
    desc: "Material durability and build quality over visual impact.",
  },
  {
    id: "full_premium",
    zh: "全面升級，不設上限",
    en: "Full premium, no compromise",
    desc: "Budget is not the constraint. Everything at its best.",
  },
  {
    id: "practical_functional",
    zh: "實用就好，合理價錢",
    en: "Practical and functional",
    desc: "Done properly at a reasonable cost. No excess.",
  },
];

const PROPERTY_TYPES = [
  { id: "private_flat", label: "Private Flat" },
  { id: "hos_flat", label: "HOS Flat 居屋" },
  { id: "village_house", label: "Village House" },
  { id: "detached_house", label: "Detached House 獨立屋" },
  { id: "commercial", label: "Commercial" },
];

const BUILDING_AGES = [
  { id: "0_to_5", label: "0 – 5 years" },
  { id: "6_to_15", label: "6 – 15 years" },
  { id: "16_to_30", label: "16 – 30 years" },
  { id: "30_plus", label: "30+ years" },
];

const STEPS = ["Basics", "Scope", "Materials", "Extras", "Estimate", "Inquiry"];

export default function Quote() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Pre-fill from Explore Idea if params passed
  const params = new URLSearchParams(location.search);
  const preStyle = params.get("style") || "";
  const preBudget = params.get("budget") || "";
  const preSize = params.get("size") || "";

  const sqftDefault = preSize === "compact" ? 400 : preSize === "family" ? 575 : preSize === "spacious" ? 800 : "";

  const [step1, setStep1] = useState({
    priority: "",
    propertyType: "",
    district: "",
    buildingAge: "",
    sqft: sqftDefault,
    bedrooms: 0,
    bathrooms: 0,
    kitchens: 0,
    livingRooms: 0,
  });

  const carried = preStyle || preBudget || preSize;

  const step1Valid =
    step1.priority &&
    step1.propertyType &&
    step1.district &&
    step1.buildingAge &&
    step1.sqft > 0 &&
    (step1.bedrooms + step1.bathrooms + step1.kitchens + step1.livingRooms) > 0;

  function Stepper({ field, value, onChange }) {
    return (
      <div style={styles.stepperWrap}>
        <button
          style={styles.stepperBtn}
          onClick={() => onChange(Math.max(0, value - 1))}
          type="button"
        >−</button>
        <span style={styles.stepperVal}>{value}</span>
        <button
          style={styles.stepperBtn}
          onClick={() => onChange(Math.min(10, value + 1))}
          type="button"
        >+</button>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <Navbar />

      {/* Page header */}
      <div style={styles.pageHeader}>
        <p style={styles.pageTag}>INVESTMENT CALCULATOR</p>
        <h1 style={styles.pageTitle}>
          Define your <em style={styles.titleItalic}>vision.</em>
        </h1>
        <p style={styles.pageSub}>
          Answer a few precise questions. Receive an architect-grade budget projection for your renovation.
        </p>
      </div>

      {/* Progress bar */}
      <div style={styles.progressWrap}>
        {STEPS.map((s, i) => (
          <div key={s} style={styles.progressItem}>
            <div style={{
              ...styles.progressDot,
              background: i === 0 ? GOLD : "transparent",
              border: i === 0 ? `2px solid ${GOLD}` : `2px solid rgba(255,255,255,0.15)`,
            }} />
            <span style={{
              ...styles.progressLabel,
              color: i === 0 ? GOLD : TEXT_MUTED,
              fontWeight: i === 0 ? "600" : "400",
            }}>{s}</span>
            {i < STEPS.length - 1 && <div style={styles.progressLine} />}
          </div>
        ))}
      </div>

      {/* Carry-over banner */}
      {carried && (
        <div style={styles.carryBanner}>
          <span style={styles.carryIcon}>✦</span>
          We've carried your direction from your earlier exploration — style, budget, and size are pre-filled below. Adjust anything.
        </div>
      )}

      {/* Step 1 content */}
      <div style={styles.contentWrap}>

        {/* Section A — Priority Profile */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>01</div>
          <div style={styles.sectionBody}>
            <h2 style={styles.sectionTitle}>What matters most to you?</h2>
            <p style={styles.sectionSub}>This shapes how we allocate your budget across materials and finishes.</p>
            <div style={styles.priorityGrid}>
              {PRIORITY_PROFILES.map((p) => (
                <button
                  key={p.id}
                  style={{
                    ...styles.priorityCard,
                    border: step1.priority === p.id
                      ? `1.5px solid ${GOLD}`
                      : `1.5px solid rgba(255,255,255,0.08)`,
                    background: step1.priority === p.id
                      ? "rgba(212,160,23,0.06)"
                      : BG_PANEL,
                  }}
                  onClick={() => setStep1({ ...step1, priority: p.id })}
                  type="button"
                >
                  {step1.priority === p.id && (
                    <div style={styles.priorityCheck}>✦</div>
                  )}
                  <p style={styles.priorityZh}>{p.zh}</p>
                  <p style={styles.priorityEn}>{p.en}</p>
                  <p style={styles.priorityDesc}>{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Section B — Project Basics */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>02</div>
          <div style={styles.sectionBody}>
            <h2 style={styles.sectionTitle}>Project Dimensions</h2>
            <p style={styles.sectionSub}>These inputs drive all quantity and cost calculations.</p>

            {/* Property Type */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>PROPERTY TYPE</label>
              <div style={styles.btnGroup}>
                {PROPERTY_TYPES.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    style={{
                      ...styles.btnGroupItem,
                      border: step1.propertyType === pt.id
                        ? `1.5px solid ${GOLD}`
                        : `1.5px solid rgba(255,255,255,0.1)`,
                      color: step1.propertyType === pt.id ? GOLD : TEXT_DIM,
                      background: step1.propertyType === pt.id
                        ? "rgba(212,160,23,0.06)"
                        : "transparent",
                    }}
                    onClick={() => setStep1({ ...step1, propertyType: pt.id })}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* District */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>DISTRICT</label>
              <select
                style={styles.select}
                value={step1.district}
                onChange={(e) => setStep1({ ...step1, district: e.target.value })}
              >
                <option value="">Select district</option>
                {HK_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Building Age */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>BUILDING AGE</label>
              <div style={styles.btnGroup}>
                {BUILDING_AGES.map((ba) => (
                  <button
                    key={ba.id}
                    type="button"
                    style={{
                      ...styles.btnGroupItem,
                      border: step1.buildingAge === ba.id
                        ? `1.5px solid ${GOLD}`
                        : `1.5px solid rgba(255,255,255,0.1)`,
                      color: step1.buildingAge === ba.id ? GOLD : TEXT_DIM,
                      background: step1.buildingAge === ba.id
                        ? "rgba(212,160,23,0.06)"
                        : "transparent",
                    }}
                    onClick={() => setStep1({ ...step1, buildingAge: ba.id })}
                  >
                    {ba.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Saleable Area */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>SALEABLE AREA</label>
              <div style={styles.inputWrap}>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  placeholder="e.g. 450"
                  value={step1.sqft || ""}
                  onChange={(e) => setStep1({ ...step1, sqft: parseInt(e.target.value) || 0 })}
                />
                <span style={styles.inputSuffix}>SQ FT</span>
              </div>
            </div>

            {/* Room Count */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>ROOM COUNT</label>
              <p style={styles.fieldHint}>At least one room required.</p>
              <div style={styles.roomGrid}>
                {[
                  { label: "Bedrooms", key: "bedrooms" },
                  { label: "Bathrooms", key: "bathrooms" },
                  { label: "Kitchens", key: "kitchens" },
                  { label: "Living Rooms", key: "livingRooms" },
                ].map(({ label, key }) => (
                  <div key={key} style={styles.roomItem}>
                    <span style={styles.roomLabel}>{label}</span>
                    <Stepper
                      field={key}
                      value={step1[key]}
                      onChange={(v) => setStep1({ ...step1, [key]: v })}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Navigation */}
        <div style={styles.navRow}>
          <button style={styles.backBtn} onClick={() => navigate("/")} type="button">
            ← Back
          </button>
          <button
            style={{
              ...styles.continueBtn,
              background: step1Valid ? GOLD : "rgba(212,160,23,0.2)",
              color: step1Valid ? "#000" : "rgba(255,255,255,0.2)",
              cursor: step1Valid ? "pointer" : "not-allowed",
            }}
            disabled={!step1Valid}
            type="button"
          >
            Continue → <span style={styles.continueSub}>Scope</span>
          </button>
        </div>

      </div>

      <Footer />
    </div>
  );
}

const styles = {
  root: {
    background: BG_DARK,
    color: "#fff",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    minHeight: "100vh",
  },

  // Page header
  pageHeader: {
    padding: "72px 120px 48px",
    borderBottom: `1px solid ${BORDER}`,
  },
  pageTag: {
    fontSize: "11px",
    letterSpacing: "0.22em",
    color: TEXT_MUTED,
    margin: "0 0 16px",
  },
  pageTitle: {
    fontSize: "52px",
    fontWeight: "400",
    fontFamily: "Georgia, serif",
    color: "#fff",
    margin: "0 0 16px",
    lineHeight: 1.1,
  },
  titleItalic: {
    fontStyle: "italic",
    color: GOLD,
  },
  pageSub: {
    fontSize: "15px",
    color: TEXT_DIM,
    lineHeight: 1.7,
    margin: 0,
    maxWidth: "480px",
  },

  // Progress
  progressWrap: {
    display: "flex",
    alignItems: "center",
    padding: "32px 120px",
    borderBottom: `1px solid ${BORDER}`,
    background: BG_PANEL,
  },
  progressItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  progressDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  progressLabel: {
    fontSize: "12px",
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
  },
  progressLine: {
    width: "48px",
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    marginLeft: "10px",
    flexShrink: 0,
  },

  // Carry banner
  carryBanner: {
    margin: "24px 120px 0",
    padding: "14px 20px",
    border: `1px solid ${BORDER}`,
    background: "rgba(212,160,23,0.04)",
    fontSize: "13px",
    color: TEXT_DIM,
    lineHeight: 1.6,
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  carryIcon: {
    color: GOLD,
    fontSize: "10px",
    marginTop: "3px",
    flexShrink: 0,
  },

  // Content
  contentWrap: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "64px 120px 96px",
  },

  // Sections
  section: {
    display: "flex",
    gap: "48px",
  },
  sectionLabel: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "rgba(212,160,23,0.4)",
    fontWeight: "600",
    paddingTop: "6px",
    flexShrink: 0,
    width: "24px",
  },
  sectionBody: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: "400",
    fontFamily: "Georgia, serif",
    color: "#fff",
    margin: "0 0 8px",
  },
  sectionSub: {
    fontSize: "14px",
    color: TEXT_MUTED,
    margin: "0 0 36px",
    lineHeight: 1.6,
  },

  divider: {
    height: "1px",
    background: BORDER,
    margin: "56px 0",
  },

  // Priority cards
  priorityGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  priorityCard: {
    position: "relative",
    padding: "28px 24px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  },
  priorityCheck: {
    position: "absolute",
    top: "16px",
    right: "16px",
    color: GOLD,
    fontSize: "12px",
  },
  priorityZh: {
    fontSize: "15px",
    color: "#fff",
    fontFamily: "Georgia, serif",
    margin: "0 0 4px",
    fontWeight: "400",
  },
  priorityEn: {
    fontSize: "12px",
    letterSpacing: "0.08em",
    color: GOLD,
    margin: "0 0 12px",
  },
  priorityDesc: {
    fontSize: "13px",
    color: TEXT_MUTED,
    lineHeight: 1.6,
    margin: 0,
  },

  // Field groups
  fieldGroup: {
    marginBottom: "36px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "11px",
    letterSpacing: "0.18em",
    color: TEXT_MUTED,
    marginBottom: "14px",
  },
  fieldHint: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.25)",
    margin: "-8px 0 14px",
  },

  // Button group
  btnGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  btnGroupItem: {
    padding: "10px 20px",
    fontSize: "13px",
    letterSpacing: "0.04em",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },

  // Select
  select: {
    background: BG_PANEL,
    border: `1px solid rgba(255,255,255,0.1)`,
    color: "#fff",
    padding: "12px 16px",
    fontSize: "14px",
    fontFamily: "inherit",
    width: "100%",
    maxWidth: "360px",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: "36px",
  },

  // Input
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0",
    maxWidth: "280px",
  },
  input: {
    background: BG_PANEL,
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRight: "none",
    color: "#fff",
    padding: "12px 16px",
    fontSize: "22px",
    fontFamily: "Georgia, serif",
    width: "100%",
    outline: "none",
  },
  inputSuffix: {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid rgba(255,255,255,0.1)`,
    borderLeft: "none",
    color: TEXT_MUTED,
    padding: "12px 14px",
    fontSize: "11px",
    letterSpacing: "0.14em",
    whiteSpace: "nowrap",
  },

  // Room steppers
  roomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  roomItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px",
    background: BG_PANEL,
    border: `1px solid rgba(255,255,255,0.06)`,
  },
  roomLabel: {
    fontSize: "13px",
    color: TEXT_DIM,
    letterSpacing: "0.04em",
  },
  stepperWrap: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  stepperBtn: {
    width: "28px",
    height: "28px",
    background: "transparent",
    border: `1px solid rgba(255,255,255,0.15)`,
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
    lineHeight: 1,
  },
  stepperVal: {
    fontSize: "18px",
    color: "#fff",
    fontFamily: "Georgia, serif",
    minWidth: "20px",
    textAlign: "center",
  },

  // Navigation
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "64px",
    paddingTop: "32px",
    borderTop: `1px solid ${BORDER}`,
  },
  backBtn: {
    background: "transparent",
    border: `1px solid rgba(255,255,255,0.1)`,
    color: TEXT_DIM,
    padding: "12px 24px",
    fontSize: "13px",
    letterSpacing: "0.08em",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  continueBtn: {
    border: "none",
    padding: "14px 36px",
    fontSize: "13px",
    letterSpacing: "0.12em",
    fontWeight: "600",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.15s ease",
  },
  continueSub: {
    fontWeight: "400",
    opacity: 0.7,
    fontSize: "12px",
  },
};