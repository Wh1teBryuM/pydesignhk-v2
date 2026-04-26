import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

const GOLD = "#D4A017"
const BG_DARK = "#0f0f0f"
const BG_PANEL = "#141414"
const BG_PANEL2 = "#1a1a1a"
const BORDER = "rgba(212,160,23,0.2)"
const BORDER_SUBTLE = "rgba(255,255,255,0.06)"
const TEXT_MUTED = "rgba(255,255,255,0.45)"
const TEXT_DIM = "rgba(255,255,255,0.65)"

const STATUS_LABELS = {
  confirmed:   "Confirmed",
  in_progress: "In Progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
}

const STATUS_COLORS = {
  confirmed:   "#4CAF50",
  in_progress: GOLD,
  completed:   "#2196F3",
  cancelled:   "#f44336",
}

function formatDate(ts) {
  if (!ts) return "—"
  return new Date(ts).toLocaleDateString("en-HK", {
    day: "2-digit", month: "short", year: "numeric",
  })
}

export default function TrackProject() {
  const navigate  = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }
    fetchProjects(token)
  }, [])

  async function fetchProjects(token) {
    setLoading(true)
    setError("")
    try {
      const res  = await fetch("http://localhost:3001/tracker/customer/projects", {
        headers: { authorization: token },
      })
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

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "32px", color: "#fff", margin: "0 0 8px" }}>
          My Project
        </h1>
        <p style={{ fontSize: "13px", color: TEXT_MUTED, margin: "0 0 48px" }}>
          Track the progress of your renovation project.
        </p>

        {loading && <p style={{ color: TEXT_MUTED, fontSize: "13px" }}>Loading...</p>}
        {error   && <p style={{ color: "#f44336", fontSize: "13px" }}>{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "32px", color: "rgba(212,160,23,0.3)", margin: "0 0 16px" }}>✦</p>
            <p style={{ fontSize: "15px", color: TEXT_MUTED, margin: "0 0 8px" }}>No active projects found.</p>
            <p style={{ fontSize: "13px", color: TEXT_MUTED }}>If you have signed a contract with us, please contact us to get access.</p>
          </div>
        )}

        {!loading && !error && projects.map((proj) => (
          <div key={proj.id} style={{ marginBottom: "48px" }}>

            {/* Project header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "22px", color: "#fff", margin: "0 0 6px" }}>
                  {proj.project_name}
                </h2>
                <p style={{ fontSize: "12px", color: TEXT_MUTED, margin: 0 }}>
                  {proj.start_date ? `${proj.start_date} → ${proj.end_date || "TBC"}` : "Dates TBC"}
                </p>
              </div>
              <span style={{ fontSize: "11px", padding: "5px 12px", border: `1px solid ${STATUS_COLORS[proj.status]}`, color: STATUS_COLORS[proj.status], whiteSpace: "nowrap" }}>
                {STATUS_LABELS[proj.status]}
              </span>
            </div>

            {/* Zones */}
            {proj.tracker_zones?.sort((a, b) => a.display_order - b.display_order).map((zone) => (
              <div key={zone.id} style={{ marginBottom: "32px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.16em", color: GOLD, fontWeight: 600, margin: "0 0 16px" }}>
                  {zone.zone_name.toUpperCase()}
                </p>

                {zone.tracker_updates?.length === 0 && (
                  <p style={{ fontSize: "13px", color: TEXT_MUTED }}>No updates yet for this zone.</p>
                )}

                {zone.tracker_updates?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((update) => (
                  <div key={update.id} style={{ marginBottom: "24px", paddingLeft: "16px", borderLeft: `2px solid ${BORDER}` }}>
                    <p style={{ fontSize: "11px", color: TEXT_MUTED, margin: "0 0 6px" }}>{formatDate(update.created_at)}</p>
                    {update.note && (
                      <p style={{ fontSize: "14px", color: TEXT_DIM, margin: "0 0 12px", lineHeight: 1.6 }}>{update.note}</p>
                    )}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {update.tracker_photos?.sort((a, b) => a.display_order - b.display_order).map((photo) => (
                        <a key={photo.id} href={photo.photo_url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={photo.photo_url}
                            alt="progress"
                            style={{ width: "160px", height: "120px", objectFit: "cover", border: `1px solid ${BORDER_SUBTLE}`, display: "block" }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ height: "1px", background: BORDER_SUBTLE, margin: "24px 0 0" }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}