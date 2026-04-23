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
    zh: "精緻外觀，控制預算",
    en: "Beautiful on a budget",
    desc: "Visible surfaces premium, hidden works standard.",
  },
  {
    id: "practical_functional",
    zh: "實用耐用，價錢合理",
    en: "Built to last, not to impress",
    desc: "Durability and function over aesthetics. Budget stays controlled.",
  },
  {
    id: "full_premium",
    zh: "全面精緻，不設上限",
    en: "Full premium, no compromise",
    desc: "No compromise anywhere. Premium throughout.",
  },
  {
    id: "quality_first",
    zh: "質量至上，功能優先",
    en: "Quality and function first",
    desc: "Best materials and systems. Design follows structure.",
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

const ZONES = [
  { id: "demolition", name: "Demolition", zh: "清拆", desc: "Structural removal, hacking, debris clearance", structural: false },
  { id: "plumbing_electrical", name: "Plumbing & Electrical", zh: "水電", desc: "Pipes, wiring, fixtures, sockets, switches", structural: true },
  { id: "masonry_tiling", name: "Masonry & Tiling", zh: "泥水", desc: "Floor and wall tiles, screeding, waterproofing", structural: false },
  { id: "painting", name: "Painting", zh: "油漆", desc: "Walls, ceilings, feature walls", structural: false },
  { id: "carpentry", name: "Carpentry", zh: "木器", desc: "Built-in wardrobes, feature walls, shelving", structural: false },
  { id: "aluminium", name: "Aluminium Works", zh: "鋁質", desc: "Windows, grilles, sliding doors, frames", structural: true },
  { id: "cabinets", name: "Cabinets", zh: "櫥櫃", desc: "Kitchen and bathroom cabinet units", structural: false },
  { id: "miscellaneous", name: "Miscellaneous", zh: "其他", desc: "Sundries, protection, clean-up", structural: false },
];

const SCOPE_ZONE_MAP = {
  full: ["demolition", "plumbing_electrical", "masonry_tiling", "painting", "carpentry", "aluminium", "cabinets", "miscellaneous"],
  kitchen_only: ["demolition", "plumbing_electrical", "masonry_tiling", "aluminium", "cabinets", "miscellaneous"],
  bathroom_only: ["demolition", "plumbing_electrical", "masonry_tiling", "aluminium", "cabinets", "miscellaneous"],
};

const PARTIAL_ROOM_ZONE_MAP = {
  living_room: ["demolition", "masonry_tiling", "painting", "carpentry", "miscellaneous"],
  master_bedroom: ["demolition", "painting", "carpentry", "miscellaneous"],
  bedroom: ["demolition", "painting", "carpentry", "miscellaneous"],
  kitchen: ["demolition", "plumbing_electrical", "masonry_tiling", "aluminium", "cabinets", "miscellaneous"],
  bathroom: ["demolition", "plumbing_electrical", "masonry_tiling", "aluminium", "cabinets", "miscellaneous"],
};

const GRADE_DEFAULTS_BY_PRIORITY = {
  look_good_control_cost: (zone) => (zone.structural ? "basic" : "standard"),
  practical_functional: () => "basic",
  full_premium: () => "premium",
  quality_first: (zone) => (zone.structural ? "premium" : "standard"),
};

function getActiveZones(step2) {
  const scope = step2?.renovationScope;
  if (!scope) return ZONES;
  if (scope !== "partial") {
    const ids = SCOPE_ZONE_MAP[scope] || ZONES.map((z) => z.id);
    return ZONES.filter((z) => ids.includes(z.id));
  }
  const rooms = step2?.partialRooms || [];
  const ids = new Set();
  rooms.forEach((r) => (PARTIAL_ROOM_ZONE_MAP[r] || []).forEach((id) => ids.add(id)));
  return ZONES.filter((z) => ids.has(z.id));
}

function buildGradeDefaults(activeZones, priority) {
  const fn = GRADE_DEFAULTS_BY_PRIORITY[priority] || GRADE_DEFAULTS_BY_PRIORITY["practical_functional"];
  const result = {};
  activeZones.forEach((z) => { result[z.id] = fn(z); });
  return result;
}

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
    estateName: "",
    block: "",
    floor: "",
    flat: "",
    street: "",
    liftAccess: "",
    hasStairs: null,
    hasParking: null,
    siteRemarks: "",
  });

  const carried = preStyle || preBudget || preSize;

  const step1Valid =
    step1.priority &&
    step1.propertyType &&
    step1.district &&
    step1.buildingAge &&
    step1.sqft > 0 &&
    (step1.bedrooms + step1.bathrooms + step1.kitchens + step1.livingRooms) > 0 &&
    step1.estateName.trim() &&
    step1.block.trim() &&
    step1.floor.trim() &&
    step1.flat.trim() &&
    step1.street.trim() &&
    step1.liftAccess &&
    step1.hasStairs !== null &&
    step1.hasParking !== null;

  const [currentStep, setCurrentStep] = useState(1);

  const [step2, setStep2] = useState({
    renovationScope: "",
    partialRooms: [],
    roomOtherText: {},
    roomOtherEnabled: {},
    additionalZones: "",
  });

  const [step3, setStep3] = useState(null);

  const step2Valid =
    step2.renovationScope === "full" ||
    step2.renovationScope === "kitchen_only" ||
    step2.renovationScope === "bathroom_only" ||
    (step2.renovationScope === "partial" && step2.partialRooms.length > 0);

  const step3Valid = step3 !== null && Object.keys(step3).length > 0;

  // Pre-fill grades when entering step 3
  useEffect(() => {
    if (currentStep !== 3) return;
    if (step3 !== null) return;
    const active = getActiveZones(step2);
    const defaults = buildGradeDefaults(active, step1.priority);
    setStep3(defaults);
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  function Stepper({ field, value, onChange }) {
    return (
      <div style={styles.stepperWrap}>
        <button style={styles.stepperBtn} onClick={() => onChange(Math.max(0, value - 1))} type="button">−</button>
        <span style={styles.stepperVal}>{value}</span>
        <button style={styles.stepperBtn} onClick={() => onChange(Math.min(10, value + 1))} type="button">+</button>
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
              background: i + 1 === currentStep ? GOLD : i + 1 < currentStep ? "rgba(212,160,23,0.4)" : "transparent",
              border: i + 1 <= currentStep ? `2px solid ${GOLD}` : `2px solid rgba(255,255,255,0.15)`,
            }} />
            <span style={{
              ...styles.progressLabel,
              color: i + 1 === currentStep ? GOLD : i + 1 < currentStep ? "rgba(212,160,23,0.5)" : TEXT_MUTED,
              fontWeight: i + 1 === currentStep ? "600" : "400",
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

      {/* Step content */}
      <div style={styles.contentWrap}>

        {/* ── STEP 1 ── */}
        {currentStep === 1 && (
          <>
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
                        border: step1.priority === p.id ? `1.5px solid ${GOLD}` : `1.5px solid rgba(255,255,255,0.08)`,
                        background: step1.priority === p.id ? "rgba(212,160,23,0.06)" : BG_PANEL,
                      }}
                      onClick={() => setStep1({ ...step1, priority: p.id })}
                      type="button"
                    >
                      {step1.priority === p.id && <div style={styles.priorityCheck}>✦</div>}
                      <p style={styles.priorityZh}>{p.zh}</p>
                      <p style={styles.priorityEn}>{p.en}</p>
                      <p style={styles.priorityDesc}>{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.section}>
              <div style={styles.sectionLabel}>02</div>
              <div style={styles.sectionBody}>
                <h2 style={styles.sectionTitle}>Project Dimensions</h2>
                <p style={styles.sectionSub}>These inputs drive all quantity and cost calculations.</p>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>PROPERTY TYPE</label>
                  <div style={styles.btnGroup}>
                    {PROPERTY_TYPES.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        style={{
                          ...styles.btnGroupItem,
                          border: step1.propertyType === pt.id ? `1.5px solid ${GOLD}` : `1.5px solid rgba(255,255,255,0.1)`,
                          color: step1.propertyType === pt.id ? GOLD : TEXT_DIM,
                          background: step1.propertyType === pt.id ? "rgba(212,160,23,0.06)" : "transparent",
                        }}
                        onClick={() => setStep1({ ...step1, propertyType: pt.id })}
                      >{pt.label}</button>
                    ))}
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>DISTRICT</label>
                  <select
                    style={styles.select}
                    value={step1.district}
                    onChange={(e) => setStep1({ ...step1, district: e.target.value })}
                  >
                    <option value="">Select district</option>
                    {HK_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>BUILDING AGE</label>
                  <div style={styles.btnGroup}>
                    {BUILDING_AGES.map((ba) => (
                      <button
                        key={ba.id}
                        type="button"
                        style={{
                          ...styles.btnGroupItem,
                          border: step1.buildingAge === ba.id ? `1.5px solid ${GOLD}` : `1.5px solid rgba(255,255,255,0.1)`,
                          color: step1.buildingAge === ba.id ? GOLD : TEXT_DIM,
                          background: step1.buildingAge === ba.id ? "rgba(212,160,23,0.06)" : "transparent",
                        }}
                        onClick={() => setStep1({ ...step1, buildingAge: ba.id })}
                      >{ba.label}</button>
                    ))}
                  </div>
                </div>

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
                        <Stepper field={key} value={step1[key]} onChange={(v) => setStep1({ ...step1, [key]: v })} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.section}>
              <div style={styles.sectionLabel}>03</div>
              <div style={styles.sectionBody}>
                <h2 style={styles.sectionTitle}>Property Address</h2>
                <p style={styles.sectionSub}>Required for the owner to prepare for the site visit.</p>
                <div style={styles.addressGrid}>
                  {[
                    { label: "ESTATE / BUILDING NAME", key: "estateName", placeholder: "e.g. Laguna City, Metro Harbour Plaza", full: true },
                    { label: "STREET", key: "street", placeholder: "e.g. 8 Laguna Street", full: true },
                    { label: "BLOCK", key: "block", placeholder: "e.g. Block A" },
                    { label: "FLOOR", key: "floor", placeholder: "e.g. 12" },
                    { label: "FLAT", key: "flat", placeholder: "e.g. 3B" },
                  ].map(({ label, key, placeholder, full }) => (
                    <div key={key} style={{ ...styles.fieldGroup, gridColumn: full ? "1 / -1" : "auto" }}>
                      <label style={styles.fieldLabel}>{label}</label>
                      <input
                        style={styles.textInput}
                        type="text"
                        placeholder={placeholder}
                        value={step1[key]}
                        onChange={(e) => setStep1({ ...step1, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.section}>
              <div style={styles.sectionLabel}>04</div>
              <div style={styles.sectionBody}>
                <h2 style={styles.sectionTitle}>Site Conditions</h2>
                <p style={styles.sectionSub}>These affect labour and logistics costs.</p>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>LIFT ACCESS</label>
                  <div style={styles.btnGroup}>
                    {[
                      { id: "direct", label: "Direct lift to apartment" },
                      { id: "change_at_podium", label: "Change lift at podium" },
                      { id: "no_lift", label: "No lift" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        style={{
                          ...styles.btnGroupItem,
                          border: step1.liftAccess === opt.id ? `1.5px solid ${GOLD}` : "1.5px solid rgba(255,255,255,0.1)",
                          color: step1.liftAccess === opt.id ? GOLD : TEXT_DIM,
                          background: step1.liftAccess === opt.id ? "rgba(212,160,23,0.06)" : "transparent",
                        }}
                        onClick={() => setStep1({ ...step1, liftAccess: opt.id })}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div style={styles.toggleRow}>
                  {[
                    { key: "hasStairs", label: "STAIRS", desc: "Steps involved in access" },
                    { key: "hasParking", label: "PARKING AVAILABLE", desc: "On-site parking for delivery" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} style={styles.toggleCard}>
                      <div>
                        <p style={styles.toggleLabel}>{label}</p>
                        <p style={styles.toggleDesc}>{desc}</p>
                      </div>
                      <div style={styles.toggleBtns}>
                        <button
                          type="button"
                          style={{
                            ...styles.toggleBtn,
                            background: step1[key] === true ? GOLD : "transparent",
                            color: step1[key] === true ? "#000" : TEXT_DIM,
                            border: step1[key] === true ? `1px solid ${GOLD}` : "1px solid rgba(255,255,255,0.1)",
                          }}
                          onClick={() => setStep1({ ...step1, [key]: true })}
                        >Yes</button>
                        <button
                          type="button"
                          style={{
                            ...styles.toggleBtn,
                            background: step1[key] === false ? "rgba(255,255,255,0.08)" : "transparent",
                            color: step1[key] === false ? "#fff" : TEXT_DIM,
                            border: step1[key] === false ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.1)",
                          }}
                          onClick={() => setStep1({ ...step1, [key]: false })}
                        >No</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>SITE REMARKS <span style={{ color: TEXT_MUTED, fontWeight: "400" }}>(optional)</span></label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Narrow corridors, low ceiling, existing defects, or anything else the team should know before visiting."
                    value={step1.siteRemarks}
                    onChange={(e) => setStep1({ ...step1, siteRemarks: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div style={styles.navRow}>
              <button style={styles.backBtn} onClick={() => navigate("/")} type="button">← Back</button>
              <button
                style={{
                  ...styles.continueBtn,
                  background: step1Valid ? GOLD : "rgba(212,160,23,0.2)",
                  color: step1Valid ? "#000" : "rgba(255,255,255,0.2)",
                  cursor: step1Valid ? "pointer" : "not-allowed",
                }}
                disabled={!step1Valid}
                type="button"
                onClick={() => { if (step1Valid) setCurrentStep(2); }}
              >
                Continue → <span style={styles.continueSub}>Scope</span>
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2 ── */}
        {currentStep === 2 && (
          <>
            <div style={styles.section}>
              <div style={styles.sectionLabel}>05</div>
              <div style={styles.sectionBody}>
                <h2 style={styles.sectionTitle}>Renovation Scope</h2>
                <p style={styles.sectionSub}>Select the scope of your renovation project.</p>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>SCOPE TYPE</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { id: "full", label: "Full Renovation", desc: "Complete overhaul of the entire flat. All zones included." },
                      { id: "kitchen_only", label: "Kitchen Only", desc: "Kitchen demolition, plumbing, tiling, aluminium works, cabinets." },
                      { id: "bathroom_only", label: "Bathroom Only", desc: "Bathroom demolition, plumbing, tiling, aluminium works, cabinets." },
                      { id: "partial", label: "Partial Renovation", desc: "Select specific rooms. Zones activate based on your selection." },
                    ].map((scope) => (
                      <button
                        key={scope.id}
                        type="button"
                        style={{
                          ...styles.scopeCard,
                          border: step2.renovationScope === scope.id ? `1.5px solid ${GOLD}` : "1.5px solid rgba(255,255,255,0.08)",
                          background: step2.renovationScope === scope.id ? "rgba(212,160,23,0.06)" : BG_PANEL,
                        }}
                        onClick={() => {
                          setStep2({ ...step2, renovationScope: scope.id, partialRooms: [], roomOtherText: {}, roomOtherEnabled: {} });
                          setStep3(null); // reset grades when scope changes
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ textAlign: "left" }}>
                            <p style={{ ...styles.scopeLabel, color: step2.renovationScope === scope.id ? GOLD : "#fff" }}>{scope.label}</p>
                            <p style={styles.scopeDesc}>{scope.desc}</p>
                          </div>
                          {step2.renovationScope === scope.id && (
                            <span style={{ color: GOLD, fontSize: "18px", flexShrink: 0, marginLeft: "16px" }}>✦</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {step2.renovationScope === "partial" && (
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>SELECT ROOMS TO RENOVATE</label>
                    <p style={{ fontSize: "12px", color: TEXT_MUTED, margin: "-8px 0 16px" }}>Select all that apply. You can add custom requirements per room.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[
                        { id: "living_room", label: "Living Room", zones: "Demolition, Masonry/Tiling, Painting, Carpentry" },
                        { id: "master_bedroom", label: "Master Bedroom", zones: "Demolition, Painting, Carpentry" },
                        { id: "bedroom", label: "Bedroom(s)", zones: "Demolition, Painting, Carpentry" },
                        { id: "kitchen", label: "Kitchen", zones: "Demolition, Plumbing & Electrical, Masonry/Tiling, Aluminium, Cabinets" },
                        { id: "bathroom", label: "Bathroom(s)", zones: "Demolition, Plumbing & Electrical, Masonry/Tiling, Aluminium, Cabinets" },
                      ].map((room) => {
                        const isSelected = step2.partialRooms.includes(room.id);
                        const otherEnabled = step2.roomOtherEnabled[room.id];
                        return (
                          <div key={room.id}>
                            <button
                              type="button"
                              style={{
                                ...styles.roomSelectCard,
                                border: isSelected ? `1.5px solid ${GOLD}` : "1.5px solid rgba(255,255,255,0.08)",
                                background: isSelected ? "rgba(212,160,23,0.06)" : BG_PANEL,
                                width: "100%",
                              }}
                              onClick={() => {
                                const rooms = isSelected
                                  ? step2.partialRooms.filter(r => r !== room.id)
                                  : [...step2.partialRooms, room.id];
                                setStep2({ ...step2, partialRooms: rooms });
                                setStep3(null); // reset grades when rooms change
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ textAlign: "left" }}>
                                  <p style={{ ...styles.scopeLabel, color: isSelected ? GOLD : "#fff", margin: "0 0 4px" }}>{room.label}</p>
                                  <p style={{ ...styles.scopeDesc, margin: 0 }}>Zones: {room.zones}</p>
                                </div>
                                <div style={{
                                  width: "20px", height: "20px",
                                  border: isSelected ? `2px solid ${GOLD}` : "2px solid rgba(255,255,255,0.2)",
                                  background: isSelected ? GOLD : "transparent",
                                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  {isSelected && <span style={{ color: "#000", fontSize: "12px", fontWeight: "700" }}>✓</span>}
                                </div>
                              </div>
                            </button>

                            {isSelected && (
                              <div style={{ marginTop: "8px", paddingLeft: "16px", borderLeft: `2px solid rgba(212,160,23,0.2)` }}>
                                <button
                                  type="button"
                                  style={{
                                    background: "transparent", border: "none",
                                    color: otherEnabled ? GOLD : TEXT_MUTED,
                                    fontSize: "12px", letterSpacing: "0.08em", cursor: "pointer", padding: "4px 0",
                                    fontFamily: "inherit",
                                  }}
                                  onClick={() => setStep2({
                                    ...step2,
                                    roomOtherEnabled: { ...step2.roomOtherEnabled, [room.id]: !otherEnabled },
                                    roomOtherText: { ...step2.roomOtherText, [room.id]: "" },
                                  })}
                                >
                                  {otherEnabled ? "− Remove other requirements" : "+ Add other requirements for this room"}
                                </button>
                                {otherEnabled && (
                                  <textarea
                                    style={{ ...styles.textarea, marginTop: "8px" }}
                                    placeholder={"Describe any specific requirements for " + room.label + "..."}
                                    value={step2.roomOtherText[room.id] || ""}
                                    onChange={(e) => setStep2({
                                      ...step2,
                                      roomOtherText: { ...step2.roomOtherText, [room.id]: e.target.value },
                                    })}
                                    rows={2}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>ADDITIONAL ZONES OR REQUIREMENTS <span style={{ color: TEXT_MUTED, fontWeight: "400" }}>(optional)</span></label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Any zones or requirements not covered above — e.g. balcony, storeroom, custom built-in, structural changes..."
                    value={step2.additionalZones}
                    onChange={(e) => setStep2({ ...step2, additionalZones: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div style={styles.navRow}>
              <button style={styles.backBtn} onClick={() => setCurrentStep(1)} type="button">← Back</button>
              <button
                style={{
                  ...styles.continueBtn,
                  background: step2Valid ? GOLD : "rgba(212,160,23,0.2)",
                  color: step2Valid ? "#000" : "rgba(255,255,255,0.2)",
                  cursor: step2Valid ? "pointer" : "not-allowed",
                }}
                disabled={!step2Valid}
                type="button"
                onClick={() => setCurrentStep(3)}
              >
                Continue → <span style={styles.continueSub}>Materials</span>
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3 ── */}
        {currentStep === 3 && step3 !== null && (() => {
          const activeZones = getActiveZones(step2);
          const gradeLabels = {
            basic:    { label: "Basic",    zh: "基本", multiplier: "1.0×", desc: "Standard local materials, functional finish" },
            standard: { label: "Standard", zh: "中級", multiplier: "1.25×", desc: "Mid-range materials, improved durability and finish" },
            premium:  { label: "Premium",  zh: "優質", multiplier: "1.6×",  desc: "High-end imported materials, superior longevity" },
          };
          const priorityNote = {
            look_good_control_cost: "Visible zones defaulted to Standard, hidden works to Basic — adjust freely.",
            practical_functional:   "All zones defaulted to Basic for maximum cost efficiency.",
            full_premium:           "All zones defaulted to Premium — no compromise.",
            quality_first:          "Structural and functional zones set to Premium, finishes to Standard.",
          }[step1.priority] || "";

          return (
            <>
              <div style={styles.section}>
                <div style={styles.sectionLabel}>06</div>
                <div style={styles.sectionBody}>
                  <h2 style={styles.sectionTitle}>Material Grade</h2>
                  <p style={styles.sectionSub}>
                    Select the quality tier for each active zone. These multipliers are applied to the base rate per zone when calculating your estimate.
                  </p>

                  {priorityNote && (
                    <div style={styles.gradeNote}>
                      <span style={{ color: GOLD, fontSize: "10px", flexShrink: 0, marginTop: "2px" }}>✦</span>
                      <span>{priorityNote}</span>
                    </div>
                  )}

                  {/* Grade legend */}
                  <div style={styles.gradeLegend}>
                    {Object.entries(gradeLabels).map(([id, g]) => (
                      <div key={id} style={styles.gradeLegendItem}>
                        <span style={{ ...styles.gradePill, ...(id === "basic" ? styles.gradePill_basic : id === "standard" ? styles.gradePill_standard : styles.gradePill_premium) }}>
                          {g.label}
                        </span>
                        <span style={styles.gradeLegendMult}>{g.multiplier}</span>
                        <span style={styles.gradeLegendDesc}>{g.desc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Zone rows */}
                  <div style={styles.zoneList}>
                    {activeZones.map((zone, i) => {
                      const selected = step3[zone.id] || "basic";
                      return (
                        <div
                          key={zone.id}
                          style={{
                            ...styles.zoneRow,
                            borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                          }}
                        >
                          <div style={styles.zoneInfo}>
                            <div style={styles.zoneNameRow}>
                              <span style={styles.zoneName}>{zone.name}</span>
                              <span style={styles.zoneZh}>{zone.zh}</span>
                              {zone.structural && <span style={styles.structuralBadge}>STRUCTURAL</span>}
                            </div>
                            <p style={styles.zoneDesc}>{zone.desc}</p>
                          </div>

                          <div style={styles.gradeSelector}>
                            {["basic", "standard", "premium"].map((grade) => {
                              const isSelected = selected === grade;
                              return (
                                <button
                                  key={grade}
                                  type="button"
                                  style={{
                                    ...styles.gradeBtn,
                                    background: isSelected
                                      ? grade === "premium" ? GOLD
                                        : grade === "standard" ? "rgba(212,160,23,0.18)"
                                        : "rgba(255,255,255,0.08)"
                                      : "transparent",
                                    color: isSelected
                                      ? grade === "premium" ? "#000"
                                        : grade === "standard" ? GOLD
                                        : "rgba(255,255,255,0.75)"
                                      : "rgba(255,255,255,0.25)",
                                    border: isSelected
                                      ? grade === "premium" ? `1.5px solid ${GOLD}`
                                        : grade === "standard" ? "1.5px solid rgba(212,160,23,0.5)"
                                        : "1.5px solid rgba(255,255,255,0.2)"
                                      : "1.5px solid rgba(255,255,255,0.07)",
                                    fontWeight: isSelected ? "600" : "400",
                                  }}
                                  onClick={() => setStep3({ ...step3, [zone.id]: grade })}
                                >
                                  {gradeLabels[grade].label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Apply all shortcut */}
                  <div style={styles.applyAllRow}>
                    <span style={styles.applyAllLabel}>APPLY TO ALL ZONES</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {["basic", "standard", "premium"].map((grade) => (
                        <button
                          key={grade}
                          type="button"
                          style={styles.applyAllBtn}
                          onClick={() => {
                            const updated = {};
                            activeZones.forEach((z) => { updated[z.id] = grade; });
                            setStep3(updated);
                          }}
                        >
                          All {gradeLabels[grade].label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              <div style={styles.navRow}>
                <button style={styles.backBtn} onClick={() => setCurrentStep(2)} type="button">← Back</button>
                <button
                  style={{
                    ...styles.continueBtn,
                    background: step3Valid ? GOLD : "rgba(212,160,23,0.2)",
                    color: step3Valid ? "#000" : "rgba(255,255,255,0.2)",
                    cursor: step3Valid ? "pointer" : "not-allowed",
                  }}
                  disabled={!step3Valid}
                  type="button"
                  onClick={() => { if (step3Valid) setCurrentStep(4); }}
                >
                  Continue → <span style={styles.continueSub}>Extras</span>
                </button>
              </div>
            </>
          );
        })()}

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

  contentWrap: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "64px 120px 96px",
  },

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

  inputWrap: {
    display: "flex",
    alignItems: "center",
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

  scopeCard: {
    padding: "20px 24px",
    cursor: "pointer",
    fontFamily: "inherit",
    width: "100%",
    transition: "all 0.15s ease",
  },
  scopeLabel: {
    fontSize: "15px",
    fontFamily: "Georgia, serif",
    fontWeight: "400",
    margin: "0 0 6px",
  },
  scopeDesc: {
    fontSize: "13px",
    color: TEXT_MUTED,
    margin: 0,
    lineHeight: 1.5,
  },
  roomSelectCard: {
    padding: "16px 20px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },

  addressGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 32px",
  },
  textInput: {
    background: "#141414",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "12px 16px",
    fontSize: "14px",
    fontFamily: "inherit",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    background: "#141414",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "12px 16px",
    fontSize: "14px",
    fontFamily: "inherit",
    width: "100%",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.6,
    boxSizing: "border-box",
  },

  toggleRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "36px",
  },
  toggleCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 20px",
    background: "#141414",
    border: "1px solid rgba(255,255,255,0.06)",
    gap: "16px",
  },
  toggleLabel: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    color: "rgba(255,255,255,0.45)",
    margin: "0 0 4px",
  },
  toggleDesc: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.3)",
    margin: 0,
  },
  toggleBtns: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  toggleBtn: {
    padding: "8px 18px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.04em",
  },

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

  // Step 3 styles
  gradeNote: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    padding: "14px 18px",
    background: "rgba(212,160,23,0.04)",
    border: "1px solid rgba(212,160,23,0.15)",
    fontSize: "13px",
    color: TEXT_MUTED,
    lineHeight: 1.6,
    marginBottom: "32px",
  },
  gradeLegend: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
    marginBottom: "40px",
  },
  gradeLegendItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "16px",
    background: BG_PANEL,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  gradePill: {
    display: "inline-block",
    fontSize: "11px",
    letterSpacing: "0.12em",
    fontWeight: "600",
    padding: "3px 10px",
    alignSelf: "flex-start",
  },
  gradePill_basic: {
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.55)",
  },
  gradePill_standard: {
    background: "rgba(212,160,23,0.12)",
    color: GOLD,
  },
  gradePill_premium: {
    background: GOLD,
    color: "#000",
  },
  gradeLegendMult: {
    fontSize: "20px",
    fontFamily: "Georgia, serif",
    color: "#fff",
    fontWeight: "400",
  },
  gradeLegendDesc: {
    fontSize: "12px",
    color: TEXT_MUTED,
    lineHeight: 1.5,
  },
  zoneList: {
    display: "flex",
    flexDirection: "column",
  },
  zoneRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    padding: "20px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  zoneInfo: {
    flex: 1,
  },
  zoneNameRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
  },
  zoneName: {
    fontSize: "15px",
    color: "#fff",
    fontFamily: "Georgia, serif",
    fontWeight: "400",
  },
  zoneZh: {
    fontSize: "13px",
    color: "rgba(212,160,23,0.5)",
    fontFamily: "Georgia, serif",
  },
  structuralBadge: {
    fontSize: "9px",
    letterSpacing: "0.14em",
    color: "rgba(255,255,255,0.3)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "2px 7px",
    fontWeight: "500",
  },
  zoneDesc: {
    fontSize: "12px",
    color: TEXT_MUTED,
    margin: 0,
    lineHeight: 1.5,
  },
  gradeSelector: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  gradeBtn: {
    padding: "8px 18px",
    fontSize: "12px",
    letterSpacing: "0.08em",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.12s ease",
    whiteSpace: "nowrap",
  },
  applyAllRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  applyAllLabel: {
    fontSize: "11px",
    letterSpacing: "0.16em",
    color: TEXT_MUTED,
  },
  applyAllBtn: {
    padding: "8px 18px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    color: TEXT_DIM,
    fontSize: "12px",
    letterSpacing: "0.06em",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.12s ease",
  },
};