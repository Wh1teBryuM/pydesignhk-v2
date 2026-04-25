import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const GOLD = "#D4A017"
const BG_DARK = "#0f0f0f"
const BG_PANEL = "#141414"
const BG_PANEL2 = "#1a1a1a"
const BORDER = "rgba(212,160,23,0.2)"
const BORDER_SUBTLE = "rgba(255,255,255,0.06)"
const TEXT_MUTED = "rgba(255,255,255,0.45)"
const TEXT_DIM = "rgba(255,255,255,0.65)"

const SCOPE_LABELS = {
  full:         "Full Renovation",
  kitchen_only: "Kitchen Only",
  bathroom_only:"Bathroom Only",
  partial:      "Partial",
}

const CONTACT_LABELS = {
  whatsapp:   "WhatsApp",
  phone_call: "Phone Call",
  email:      "Email",
}

const PRIORITY_LABELS = {
  look_good_control_cost: "Beautiful on a budget",
  practical_functional:   "Built to last",
  full_premium:           "Full premium",
  quality_first:          "Quality first",
}

function formatDate(ts) {
  if (!ts) return "—"
  return new Date(ts).toLocaleDateString("en-HK", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  })
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab,   setActiveTab]   = useState("estimation")
  const [inquiries,   setInquiries]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState("")
  const [expandedId,  setExpandedId]  = useState(null)
  const admin = JSON.parse(localStorage.getItem("admin") || "{}")

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) navigate("/admin/login")
  }, [navigate])

  // Fetch inquiries
  useEffect(() => {
    if (activeTab !== "estimation") return
    fetchInquiries()
  }, [activeTab])

  async function fetchInquiries() {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("adminToken")
      const res   = await fetch("http://localhost:3001/admin/inquiries", {
        headers: { authorization: token },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch inquiries")
      setInquiries(data.inquiries || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    const token = localStorage.getItem("adminToken")
    await fetch("http://localhost:3001/admin/logout", {
      method:  "POST",
      headers: { authorization: token },
    })
    localStorage.removeItem("adminToken")
    localStorage.removeItem("admin")
    navigate("/admin/login")
  }

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div style={styles.root}>

      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerLogo}>PYDesignHK</span>
          <span style={styles.headerDivider}>|</span>
          <span style={styles.headerPortal}>Admin Dashboard</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.headerAdmin}>{admin.full_name || "Admin"}</span>
          <button style={styles.logoutBtn} onClick={handleLogout} type="button">
            Log Out
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div style={styles.tabBar}>
        {[
          { id: "estimation", label: "Cost Estimation" },
          { id: "tracker",    label: "Project Tracker" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            style={{
              ...styles.tab,
              color:        activeTab === tab.id ? GOLD : TEXT_MUTED,
              borderBottom: activeTab === tab.id ? `2px solid ${GOLD}` : "2px solid transparent",
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={styles.content}>

        {/* ── Cost Estimation Tab ── */}
        {activeTab === "estimation" && (
          <>
            <div style={styles.contentHeader}>
              <div>
                <h2 style={styles.contentTitle}>Submitted Inquiries</h2>
                <p style={styles.contentSub}>All cost estimation inquiries submitted through the website.</p>
              </div>
              <button style={styles.refreshBtn} onClick={fetchInquiries} type="button">
                ↻ Refresh
              </button>
            </div>

            {loading && (
              <div style={styles.stateMsg}>Loading inquiries...</div>
            )}

            {error && (
              <div style={styles.errorBox}>{error}</div>
            )}

            {!loading && !error && inquiries.length === 0 && (
              <div style={styles.emptyState}>
                <p style={styles.emptyIcon}>✦</p>
                <p style={styles.emptyText}>No inquiries submitted yet.</p>
              </div>
            )}

            {!loading && !error && inquiries.length > 0 && (
              <div style={styles.tableWrap}>
                {/* Table header */}
                <div style={styles.tableHeader}>
                  <span style={{ ...styles.th, flex: 2 }}>CUSTOMER</span>
                  <span style={{ ...styles.th, flex: 2 }}>CONTACT</span>
                  <span style={styles.th}>DISTRICT</span>
                  <span style={styles.th}>SQFT</span>
                  <span style={styles.th}>SCOPE</span>
                  <span style={styles.th}>VIA</span>
                  <span style={styles.th}>DATE</span>
                  <span style={{ ...styles.th, flex: 0.5 }}></span>
                </div>

                {/* Rows */}
                {inquiries.map((inq) => (
                  <div key={inq.inquiry_id}>
                    <div
                      style={{
                        ...styles.tableRow,
                        background: expandedId === inq.inquiry_id ? BG_PANEL2 : "transparent",
                      }}
                      onClick={() => toggleExpand(inq.inquiry_id)}
                    >
                      <div style={{ ...styles.td, flex: 2 }}>
                        <p style={styles.tdPrimary}>{inq.contact_full_name || "—"}</p>
                        <p style={styles.tdSecondary}>{inq.contact_email || "—"}</p>
                      </div>
                      <div style={{ ...styles.td, flex: 2 }}>
                        <p style={styles.tdPrimary}>{inq.contact_phone || "—"}</p>
                        <p style={styles.tdSecondary}>{inq.contact_email || "—"}</p>
                      </div>
                      <span style={styles.td}>{inq.district || "—"}</span>
                      <span style={styles.td}>{inq.saleable_area_sqft ? `${inq.saleable_area_sqft} ft²` : "—"}</span>
                      <span style={styles.td}>{SCOPE_LABELS[inq.renovation_scope] || inq.renovation_scope || "—"}</span>
                      <span style={{ ...styles.td, color: GOLD }}>{CONTACT_LABELS[inq.preferred_contact_method] || "—"}</span>
                      <span style={styles.td}>{formatDate(inq.submitted_at)}</span>
                      <span style={{ ...styles.td, flex: 0.5, color: TEXT_MUTED }}>
                        {expandedId === inq.inquiry_id ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {expandedId === inq.inquiry_id && (
                      <div style={styles.expandedRow}>
                        <div style={styles.expandedGrid}>

                          <div style={styles.expandedSection}>
                            <p style={styles.expandedLabel}>PROPERTY</p>
                            <p style={styles.expandedValue}>{inq.property_type?.replace("_", " ") || "—"}</p>
                            <p style={styles.expandedValue}>Building age: {inq.building_age?.replace(/_/g, " ") || "—"}</p>
                            <p style={styles.expandedValue}>Priority: {PRIORITY_LABELS[inq.priority_profile] || "—"}</p>
                          </div>

                          <div style={styles.expandedSection}>
                            <p style={styles.expandedLabel}>ADDRESS</p>
                            <p style={styles.expandedValue}>{inq.estate_name || "—"}, Block {inq.block || "—"}</p>
                            <p style={styles.expandedValue}>Floor {inq.floor || "—"}, Flat {inq.flat || "—"}</p>
                            <p style={styles.expandedValue}>{inq.street || "—"}</p>
                          </div>

                          <div style={styles.expandedSection}>
                            <p style={styles.expandedLabel}>ROOMS</p>
                            <p style={styles.expandedValue}>Bedrooms: {inq.bedroom_count ?? "—"}</p>
                            <p style={styles.expandedValue}>Bathrooms: {inq.bathroom_count ?? "—"}</p>
                            <p style={styles.expandedValue}>Kitchens: {inq.kitchen_count ?? "—"}</p>
                            <p style={styles.expandedValue}>Living rooms: {inq.living_room_count ?? "—"}</p>
                          </div>

                          <div style={styles.expandedSection}>
                            <p style={styles.expandedLabel}>SITE CONDITIONS</p>
                            <p style={styles.expandedValue}>Lift: {inq.lift_access?.replace(/_/g, " ") || "—"}</p>
                            <p style={styles.expandedValue}>Stairs: {inq.has_stairs ? "Yes" : "No"}</p>
                            <p style={styles.expandedValue}>Parking: {inq.has_parking ? "Yes" : "No"}</p>
                            {inq.site_remarks && <p style={styles.expandedValue}>Remarks: {inq.site_remarks}</p>}
                          </div>

                          <div style={styles.expandedSection}>
                            <p style={styles.expandedLabel}>MATERIAL GRADES</p>
                            {inq.material_grades
                              ? Object.entries(inq.material_grades).map(([zone, grade]) => (
                                  <p key={zone} style={styles.expandedValue}>
                                    {zone.replace(/_/g, " ")}: <span style={{ color: grade === "premium" ? GOLD : "#fff" }}>{grade}</span>
                                  </p>
                                ))
                              : <p style={styles.expandedValue}>—</p>
                            }
                          </div>

                          <div style={styles.expandedSection}>
                            <p style={styles.expandedLabel}>REQUIREMENTS & NOTES</p>
                            <p style={styles.expandedValue}>{inq.additional_requirements || "None"}</p>
                            {inq.additional_notes && (
                              <>
                                <p style={{ ...styles.expandedLabel, marginTop: "12px" }}>INQUIRY NOTES</p>
                                <p style={styles.expandedValue}>{inq.additional_notes}</p>
                              </>
                            )}
                          </div>

                        </div>

                        {/* WhatsApp quick action */}
                        {inq.preferred_contact_method === "whatsapp" && inq.contact_phone && (
                          <div style={styles.expandedActions}>
                            <a
                              href={`https://wa.me/852${inq.contact_phone.replace(/\s/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.whatsappBtn}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              Contact on WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Project Tracker Tab ── */}
        {activeTab === "tracker" && (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>✦</p>
            <p style={styles.emptyText}>Project Tracker — Coming Soon</p>
            <p style={{ fontSize: "13px", color: TEXT_MUTED, marginTop: "8px" }}>
              This feature is currently being built.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  root: {
    background: BG_DARK,
    color: "#fff",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    minHeight: "100vh",
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 48px",
    height: "64px",
    borderBottom: `1px solid ${BORDER}`,
    background: BG_PANEL,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerLogo: {
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    fontSize: "18px",
    color: GOLD,
  },
  headerDivider: {
    color: "rgba(255,255,255,0.15)",
    fontSize: "16px",
  },
  headerPortal: {
    fontSize: "12px",
    letterSpacing: "0.14em",
    color: TEXT_MUTED,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  headerAdmin: {
    fontSize: "13px",
    color: TEXT_DIM,
    letterSpacing: "0.04em",
  },
  logoutBtn: {
    background: "transparent",
    border: `1px solid rgba(255,255,255,0.1)`,
    color: TEXT_DIM,
    padding: "7px 18px",
    fontSize: "12px",
    letterSpacing: "0.08em",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // Tabs
  tabBar: {
    display: "flex",
    gap: "0",
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    padding: "0 48px",
    background: BG_PANEL,
  },
  tab: {
    background: "transparent",
    border: "none",
    padding: "18px 24px",
    fontSize: "13px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },

  // Content area
  content: {
    padding: "40px 48px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  contentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
  },
  contentTitle: {
    fontSize: "24px",
    fontFamily: "Georgia, serif",
    fontWeight: "400",
    color: "#fff",
    margin: "0 0 6px",
  },
  contentSub: {
    fontSize: "13px",
    color: TEXT_MUTED,
    margin: 0,
  },
  refreshBtn: {
    background: "transparent",
    border: `1px solid rgba(255,255,255,0.1)`,
    color: TEXT_DIM,
    padding: "8px 18px",
    fontSize: "12px",
    letterSpacing: "0.08em",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // States
  stateMsg: {
    fontSize: "13px",
    color: TEXT_MUTED,
    padding: "48px 0",
    textAlign: "center",
  },
  errorBox: {
    padding: "12px 16px",
    background: "rgba(255,80,80,0.08)",
    border: "1px solid rgba(255,80,80,0.25)",
    color: "rgba(255,120,120,0.9)",
    fontSize: "13px",
    marginBottom: "24px",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 0",
  },
  emptyIcon: {
    fontSize: "24px",
    color: "rgba(212,160,23,0.3)",
    margin: "0 0 16px",
  },
  emptyText: {
    fontSize: "15px",
    color: TEXT_MUTED,
    margin: 0,
  },

  // Table
  tableWrap: {
    border: `1px solid ${BORDER_SUBTLE}`,
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    background: "rgba(212,160,23,0.04)",
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    gap: "16px",
  },
  th: {
    flex: 1,
    fontSize: "10px",
    letterSpacing: "0.16em",
    color: GOLD,
    fontWeight: "600",
  },
  tableRow: {
    display: "flex",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    gap: "16px",
    cursor: "pointer",
    transition: "background 0.12s ease",
  },
  td: {
    flex: 1,
    fontSize: "13px",
    color: TEXT_DIM,
  },
  tdPrimary: {
    fontSize: "13px",
    color: "#fff",
    margin: "0 0 3px",
  },
  tdSecondary: {
    fontSize: "11px",
    color: TEXT_MUTED,
    margin: 0,
  },

  // Expanded row
  expandedRow: {
    padding: "24px 20px 20px",
    background: BG_PANEL2,
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    borderTop: `1px solid rgba(212,160,23,0.1)`,
  },
  expandedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    marginBottom: "20px",
  },
  expandedSection: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  expandedLabel: {
    fontSize: "10px",
    letterSpacing: "0.16em",
    color: GOLD,
    margin: "0 0 6px",
    fontWeight: "600",
  },
  expandedValue: {
    fontSize: "12px",
    color: TEXT_DIM,
    margin: 0,
    lineHeight: 1.6,
    textTransform: "capitalize",
  },
  expandedActions: {
    paddingTop: "16px",
    borderTop: `1px solid ${BORDER_SUBTLE}`,
  },
  whatsappBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 20px",
    background: "#25D366",
    color: "#fff",
    fontSize: "12px",
    letterSpacing: "0.06em",
    fontWeight: "600",
    textDecoration: "none",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
}