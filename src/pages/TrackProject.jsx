import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

const GOLD = "#D4A017"
const BG_DARK = "#0f0f0f"
const BG_PANEL = "#141414"
const BORDER = "rgba(212,160,23,0.2)"
const BORDER_SUBTLE = "rgba(255,255,255,0.06)"
const TEXT_MUTED = "rgba(255,255,255,0.45)"
const TEXT_DIM = "rgba(255,255,255,0.65)"

const STATUS_LABELS = { confirmed: "Confirmed", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled" }
const STATUS_COLORS = { confirmed: "#4CAF50", in_progress: GOLD, completed: "#2196F3", cancelled: "#f44336" }
const PHASE_STATUS_COLORS = { upcoming: "rgba(255,255,255,0.2)", active: GOLD, completed: "#4CAF50" }

function formatDate(ts) {
  if (!ts) return "—"
  return new Date(ts).toLocaleDateString("en-HK", { day: "2-digit", month: "short", year: "numeric" })
}

export default function TrackProject() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/login"); return }
    fetchProjects(token)
  }, [])

  async function fetchProjects(token) {
    setLoading(true)
    setError("")
    try {
      const res  = await fetch("http://localhost:3001/tracker/customer/projects", { headers: { authorization: token } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load projects")
      setProjects(data.projects || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: BG_DARK, minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 24px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "32px", color: "#fff", margin: "0 0 8px" }}>My Project</h1>
        <p style={{ fontSize: "13px", color: TEXT_MUTED, margin: "0 0 48px" }}>Track the progress of your renovation project.</p>

        {loading && <p style={{ color: TEXT_MUTED, fontSize: "13px" }}>Loading...</p>}
        {error   && <p style={{ color: "#f44336", fontSize: "13px" }}>{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "32px", color: "rgba(212,160,23,0.3)", margin: "0 0 16px" }}>✦</p>
            <p style={{ fontSize: "15px", color: TEXT_MUTED, margin: "0 0 8px" }}>No active projects found.</p>
            <p style={{ fontSize: "13px", color: TEXT_MUTED }}>If you have signed a contract with us, please contact us to get access.</p>
          </div>
        )}

        {!loading && !error && projects.map((proj) => {
          const phases       = proj.tracker_phases || []
          const totalPhases  = phases.length
          const doneCount    = phases.filter(p => p.status === "completed").length
          const activePhase  = phases.find(p => p.status === "active")
          const progressPct  = totalPhases > 0 ? Math.round((doneCount / totalPhases) * 100) : 0

          return (
            <div key={proj.id} style={{ marginBottom: "64px" }}>

              {/* Project header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
                <div>
                  <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "24px", color: "#fff", margin: "0 0 6px" }}>{proj.project_name}</h2>
                  <p style={{ fontSize: "12px", color: TEXT_MUTED, margin: 0 }}>
                    {proj.start_date ? `Started ${formatDate(proj.start_date)}` : "Start date TBC"}
                    {proj.end_date ? ` · Est. completion ${formatDate(proj.end_date)}` : ""}
                  </p>
                </div>
                <span style={{ fontSize: "11px", padding: "5px 12px", border: `1px solid ${STATUS_COLORS[proj.status]}`, color: STATUS_COLORS[proj.status], whiteSpace: "nowrap" }}>
                  {STATUS_LABELS[proj.status]}
                </span>
              </div>

              {/* Progress bar */}
              {totalPhases > 0 && (
                <div style={{ marginBottom: "40px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", letterSpacing: "0.16em", color: TEXT_MUTED }}>OVERALL PROGRESS</span>
                    <span style={{ fontSize: "13px", color: GOLD, fontFamily: "Georgia, serif" }}>{progressPct}%</span>
                  </div>
                  <div style={{ height: "3px", background: "rgba(255,255,255,0.08)", width: "100%" }}>
                    <div style={{ height: "100%", width: `${progressPct}%`, background: GOLD, transition: "width 0.6s ease" }} />
                  </div>
                  {activePhase && (
                    <p style={{ fontSize: "12px", color: TEXT_MUTED, margin: "10px 0 0" }}>
                      Currently in: <span style={{ color: GOLD }}>{activePhase.phase_name}</span>
                      {activePhase.expected_completion_date ? ` · Est. completion ${formatDate(activePhase.expected_completion_date)}` : ""}
                    </p>
                  )}
                </div>
              )}

              {/* Phase timeline */}
              {phases.map((phase, idx) => {
                const isLast    = idx === phases.length - 1
                const dotColor  = PHASE_STATUS_COLORS[phase.status]
                const updates   = phase.tracker_updates || []

                return (
                  <div key={phase.id} style={{ display: "flex", gap: "20px", marginBottom: isLast ? 0 : "0" }}>

                    {/* Timeline spine */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      {/* Dot */}
                      <div style={{
                        width: "12px", height: "12px",
                        borderRadius: "50%",
                        background: phase.status === "upcoming" ? "transparent" : dotColor,
                        border: `2px solid ${dotColor}`,
                        flexShrink: 0,
                        marginTop: "4px",
                        boxShadow: phase.status === "active" ? `0 0 8px ${GOLD}` : "none",
                      }} />
                      {/* Line */}
                      {!isLast && (
                        <div style={{ width: "1px", flex: 1, minHeight: "40px", background: phase.status === "completed" ? "rgba(212,160,23,0.4)" : BORDER_SUBTLE, margin: "6px 0" }} />
                      )}
                    </div>

                    {/* Phase content */}
                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : "32px" }}>
                      {/* Phase header */}
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                          <span style={{ fontSize: "15px", color: phase.status === "upcoming" ? TEXT_MUTED : "#fff", fontFamily: "Georgia, serif" }}>
                            {phase.phase_name}
                          </span>
                          <span style={{ fontSize: "10px", letterSpacing: "0.12em", color: dotColor, fontWeight: "600" }}>
                            {phase.status.toUpperCase()}
                          </span>
                        </div>
                        {phase.expected_completion_date && (
                          <span style={{ fontSize: "11px", color: TEXT_MUTED }}>Est. {formatDate(phase.expected_completion_date)}</span>
                        )}
                      </div>

                      {/* Updates */}
                      {updates.length > 0 && (
                        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                          {updates.map((update) => (
                            <div key={update.id} style={{ paddingLeft: "16px", borderLeft: `2px solid ${BORDER}` }}>
                              <p style={{ fontSize: "11px", color: TEXT_MUTED, margin: "0 0 6px" }}>{formatDate(update.created_at)}</p>
                              {update.note && <p style={{ fontSize: "14px", color: TEXT_DIM, margin: "0 0 10px", lineHeight: 1.6 }}>{update.note}</p>}
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {update.tracker_photos?.sort((a, b) => a.display_order - b.display_order).map((photo) => (
                                  <a key={photo.id} href={photo.photo_url} target="_blank" rel="noopener noreferrer">
                                    <img src={photo.photo_url} alt="progress" style={{ width: "160px", height: "120px", objectFit: "cover", border: `1px solid ${BORDER_SUBTLE}`, display: "block" }} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {phase.status !== "upcoming" && updates.length === 0 && (
                        <p style={{ fontSize: "12px", color: TEXT_MUTED, marginTop: "8px" }}>No updates yet for this phase.</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}