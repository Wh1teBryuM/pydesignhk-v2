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
  look_good_control_cost: "Refined finish, smart allocation",
  practical_functional:   "Engineered to endure",
  full_premium:           "Full premium, no compromise",
  quality_first:          "Structure leads, design follows",
}

function formatDate(ts) {
  if (!ts) return "—"
  return new Date(ts).toLocaleDateString("en-HK", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  })
}

function TrackerTab({ adminToken }) {
  const [projects,          setProjects]          = useState([])
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState("")
  const [expandedId,        setExpandedId]        = useState(null)
  const [showModal,         setShowModal]         = useState(false)
  const [creating,          setCreating]          = useState(false)

  const PHASE_SUGGESTIONS = [
    "Demolition & Hacking",
    "Plumbing & Electrical",
    "Masonry & Tiling",
    "Carpentry & Finishes",
    "Painting",
    "Final Inspection & Handover",
  ]

  const [form, setForm] = useState({
    customer_email: "", project_name: "", status: "confirmed",
    start_date: "", end_date: "", estimated_cost: "", actual_cost: "",
    phases: [
      { phase_name: "", status: "upcoming", expected_completion_date: "" },
      { phase_name: "", status: "upcoming", expected_completion_date: "" },
      { phase_name: "", status: "upcoming", expected_completion_date: "" },
      { phase_name: "", status: "upcoming", expected_completion_date: "" },
    ],
  })

  const [showUpdateModal,   setShowUpdateModal]   = useState(false)
  const [selectedPhase,     setSelectedPhase]     = useState(null)
  const [updateNote,        setUpdateNote]        = useState("")
  const [updatePhotos,      setUpdatePhotos]      = useState([])
  const [submittingUpdate,  setSubmittingUpdate]  = useState(false)

  const [showPhaseModal,    setShowPhaseModal]    = useState(false)
  const [editingPhase,      setEditingPhase]      = useState(null)
  const [phaseForm,         setPhaseForm]         = useState({ phase_name: "", status: "upcoming", expected_completion_date: "" })
  const [savingPhase,       setSavingPhase]       = useState(false)

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    setLoading(true)
    setError("")
    try {
      const res  = await fetch("http://localhost:3001/tracker/admin/projects", { headers: { authorization: adminToken } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch projects")
      setProjects(data.projects || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProject() {
    setCreating(true)
    try {
      const phases = form.phases
        .filter(p => p.phase_name.trim())
        .map((p) => ({
          phase_name:               p.phase_name.trim(),
          status:                   p.status,
          expected_completion_date: p.expected_completion_date || null,
        }))

      const res  = await fetch("http://localhost:3001/tracker/admin/projects", {
        method:  "POST",
        headers: { authorization: adminToken, "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_email:  form.customer_email,
          project_name:    form.project_name,
          status:          form.status,
          start_date:      form.start_date     || null,
          end_date:        form.end_date       || null,
          estimated_cost:  form.estimated_cost ? parseFloat(form.estimated_cost) : null,
          actual_cost:     form.actual_cost    ? parseFloat(form.actual_cost)    : null,
          phases,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create project")
      setShowModal(false)
      setForm({
        customer_email: "", project_name: "", status: "confirmed",
        start_date: "", end_date: "", estimated_cost: "", actual_cost: "",
        phases: [
          { phase_name: "", status: "upcoming", expected_completion_date: "" },
          { phase_name: "", status: "upcoming", expected_completion_date: "" },
          { phase_name: "", status: "upcoming", expected_completion_date: "" },
          { phase_name: "", status: "upcoming", expected_completion_date: "" },
        ],
      })
      fetchProjects()
    } catch (err) {
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleSavePhase() {
    if (!editingPhase) return
    setSavingPhase(true)
    try {
      const res  = await fetch(`http://localhost:3001/tracker/admin/phases/${editingPhase.id}`, {
        method:  "PATCH",
        headers: { authorization: adminToken, "Content-Type": "application/json" },
        body: JSON.stringify({
          phase_name:               phaseForm.phase_name,
          status:                   phaseForm.status,
          expected_completion_date: phaseForm.expected_completion_date || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update phase")
      setShowPhaseModal(false)
      setEditingPhase(null)
      fetchProjects()
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingPhase(false)
    }
  }

  async function handleAddUpdate() {
    if (!selectedPhase) return
    setSubmittingUpdate(true)
    try {
      const res  = await fetch(`http://localhost:3001/tracker/admin/phases/${selectedPhase.id}/updates`, {
        method:  "POST",
        headers: { authorization: adminToken, "Content-Type": "application/json" },
        body: JSON.stringify({ note: updateNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add update")
      const updateId = data.update.id

      for (let i = 0; i < updatePhotos.length; i++) {
        const formData = new FormData()
        formData.append("photo", updatePhotos[i])
        formData.append("display_order", i)
        await fetch(`http://localhost:3001/tracker/admin/updates/${updateId}/photos`, {
          method:  "POST",
          headers: { authorization: adminToken },
          body:    formData,
        })
      }

      setShowUpdateModal(false)
      setUpdateNote("")
      setUpdatePhotos([])
      setSelectedPhase(null)
      fetchProjects()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmittingUpdate(false)
    }
  }

  const STATUS_COLORS = { confirmed: "#4CAF50", in_progress: GOLD, completed: "#2196F3", cancelled: "#f44336" }
  const STATUS_LABELS = { confirmed: "Confirmed", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled" }
  const PHASE_STATUS_COLORS = { upcoming: "rgba(255,255,255,0.3)", active: GOLD, completed: "#4CAF50" }

  return (
    <div>
      <div style={styles.contentHeader}>
        <div>
          <h2 style={styles.contentTitle}>Project Tracker</h2>
          <p style={styles.contentSub}>Manage active renovation projects for paying customers.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={styles.refreshBtn} onClick={fetchProjects} type="button">↻ Refresh</button>
          <button style={{ ...styles.refreshBtn, borderColor: GOLD, color: GOLD }} onClick={() => setShowModal(true)} type="button">+ New Project</button>
        </div>
      </div>

      {loading && <div style={styles.stateMsg}>Loading projects...</div>}
      {error   && <div style={styles.errorBox}>{error}</div>}
      {!loading && !error && projects.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyIcon}>✦</p>
          <p style={styles.emptyText}>No projects yet.</p>
        </div>
      )}

      {!loading && !error && projects.map((proj) => (
        <div key={proj.id} style={{ marginBottom: "16px", border: `1px solid ${BORDER_SUBTLE}` }}>
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", cursor: "pointer", background: expandedId === proj.id ? BG_PANEL2 : "transparent" }}
            onClick={() => setExpandedId(expandedId === proj.id ? null : proj.id)}
          >
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "15px", color: "#fff" }}>{proj.project_name}</p>
              <p style={{ margin: 0, fontSize: "12px", color: TEXT_MUTED }}>{proj.customers?.full_name} · {proj.customers?.email}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "11px", padding: "4px 10px", border: `1px solid ${STATUS_COLORS[proj.status]}`, color: STATUS_COLORS[proj.status] }}>
                {STATUS_LABELS[proj.status]}
              </span>
              <span style={{ color: TEXT_MUTED, fontSize: "12px" }}>{expandedId === proj.id ? "▲" : "▼"}</span>
            </div>
          </div>

          {expandedId === proj.id && (
            <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${BORDER_SUBTLE}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", padding: "20px 0", borderBottom: `1px solid ${BORDER_SUBTLE}`, marginBottom: "24px" }}>
                {[
                  { label: "START DATE",  value: proj.start_date     || "—" },
                  { label: "END DATE",    value: proj.end_date       || "—" },
                  { label: "EST. COST",   value: proj.estimated_cost ? `HKD $${Number(proj.estimated_cost).toLocaleString()}` : "—" },
                  { label: "ACTUAL COST", value: proj.actual_cost    ? `HKD $${Number(proj.actual_cost).toLocaleString()}`    : "—" },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={styles.expandedLabel}>{item.label}</p>
                    <p style={{ ...styles.expandedValue, color: "#fff" }}>{item.value}</p>
                  </div>
                ))}

                <div>
                  <p style={styles.expandedLabel}>PROJECT STATUS</p>
                  <select
                    value={proj.status}
                    onChange={async (e) => {
                      const token = localStorage.getItem("adminToken")
                      await fetch(`http://localhost:3001/tracker/admin/projects/${proj.id}`, {
                        method: "PATCH",
                        headers: { authorization: token, "Content-Type": "application/json" },
                        body: JSON.stringify({ status: e.target.value }),
                      })
                      fetchProjects()
                    }}
                    style={{ background: BG_PANEL, border: `1px solid ${BORDER}`, color: GOLD, padding: "6px 10px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <p style={{ ...styles.expandedLabel, marginBottom: "16px" }}>PHASES</p>
              {(proj.tracker_phases || []).map((phase) => (
                <div key={phase.id} style={{ marginBottom: "24px", padding: "16px 20px", background: BG_DARK, border: `1px solid ${BORDER_SUBTLE}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: PHASE_STATUS_COLORS[phase.status], flexShrink: 0 }} />
                      <span style={{ fontSize: "14px", color: "#fff" }}>{phase.phase_name}</span>
                      <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: PHASE_STATUS_COLORS[phase.status] }}>{phase.status.toUpperCase()}</span>
                      {phase.expected_completion_date && (
                        <span style={{ fontSize: "11px", color: TEXT_MUTED }}>· Est. {phase.expected_completion_date}</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        style={{ background: "transparent", border: `1px solid ${BORDER}`, color: TEXT_DIM, fontSize: "11px", padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" }}
                        onClick={() => { setEditingPhase(phase); setPhaseForm({ phase_name: phase.phase_name, status: phase.status, expected_completion_date: phase.expected_completion_date || "" }); setShowPhaseModal(true) }}
                      >Edit Phase</button>
                      <button
                        type="button"
                        style={{ background: "transparent", border: `1px solid ${BORDER}`, color: GOLD, fontSize: "11px", padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.08em" }}
                        onClick={() => { setSelectedPhase(phase); setShowUpdateModal(true) }}
                      >+ Add Update</button>
                    </div>
                  </div>

                  {(phase.tracker_updates || []).length === 0 && (
                    <p style={{ fontSize: "12px", color: TEXT_MUTED, paddingLeft: "20px" }}>No updates yet.</p>
                  )}
                  {(phase.tracker_updates || []).map((update) => (
                    <div key={update.id} style={{ marginBottom: "12px", paddingLeft: "20px", borderLeft: `2px solid ${BORDER}` }}>
                      <p style={{ fontSize: "11px", color: TEXT_MUTED, margin: "0 0 4px" }}>{formatDate(update.created_at)}</p>
                      {update.note && <p style={{ fontSize: "13px", color: TEXT_DIM, margin: "0 0 8px" }}>{update.note}</p>}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {update.tracker_photos?.sort((a, b) => a.display_order - b.display_order).map((photo) => (
                          <img key={photo.id} src={photo.photo_url} alt="update" style={{ width: "100px", height: "75px", objectFit: "cover", border: `1px solid ${BORDER_SUBTLE}` }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Create Project Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: BG_PANEL, border: `1px solid ${BORDER}`, padding: "32px", width: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#fff", margin: "0 0 24px", fontSize: "18px" }}>New Project</h3>

            {[
              { label: "Customer Email *",     key: "customer_email", type: "text"   },
              { label: "Project Name *",        key: "project_name",   type: "text"   },
              { label: "Start Date",            key: "start_date",     type: "date"   },
              { label: "End Date",              key: "end_date",       type: "date"   },
              { label: "Estimated Cost (HKD)",  key: "estimated_cost", type: "number" },
              { label: "Actual Cost (HKD)",     key: "actual_cost",    type: "number" },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: "16px" }}>
                <p style={{ ...styles.expandedLabel, marginBottom: "6px" }}>{field.label}</p>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  style={{ width: "100%", background: BG_DARK, border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
            ))}

            <div style={{ marginBottom: "24px" }}>
              <p style={{ ...styles.expandedLabel, marginBottom: "6px" }}>STATUS *</p>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={{ width: "100%", background: BG_DARK, border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit" }}
              >
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ borderTop: `1px solid ${BORDER_SUBTLE}`, paddingTop: "20px", marginBottom: "24px" }}>
              <p style={{ ...styles.expandedLabel, marginBottom: "16px" }}>PHASES (up to 4)</p>
              {form.phases.map((phase, idx) => (
                <div key={idx} style={{ marginBottom: "16px", padding: "16px", background: BG_DARK, border: `1px solid ${BORDER_SUBTLE}` }}>
                  <p style={{ ...styles.expandedLabel, marginBottom: "10px" }}>PHASE {idx + 1}</p>
                  <p style={{ fontSize: "11px", color: TEXT_MUTED, margin: "0 0 6px" }}>PHASE NAME</p>
                  <input
                    type="text"
                    placeholder="e.g. Demolition & Hacking"
                    value={phase.phase_name}
                    onChange={(e) => {
                      const updated = [...form.phases]
                      updated[idx] = { ...updated[idx], phase_name: e.target.value }
                      setForm({ ...form, phases: updated })
                    }}
                    style={{ width: "100%", background: BG_PANEL, border: `1px solid ${BORDER}`, color: "#fff", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box", marginBottom: "8px" }}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                    {PHASE_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const updated = [...form.phases]
                          updated[idx] = { ...updated[idx], phase_name: s }
                          setForm({ ...form, phases: updated })
                        }}
                        style={{ background: "transparent", border: `1px solid rgba(255,255,255,0.1)`, color: TEXT_MUTED, fontSize: "11px", padding: "3px 10px", cursor: "pointer", fontFamily: "inherit" }}
                      >{s}</button>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: TEXT_MUTED, margin: "0 0 6px" }}>STATUS</p>
                      <select
                        value={phase.status}
                        onChange={(e) => {
                          const updated = [...form.phases]
                          updated[idx] = { ...updated[idx], status: e.target.value }
                          setForm({ ...form, phases: updated })
                        }}
                        style={{ width: "100%", background: BG_PANEL, border: `1px solid ${BORDER}`, color: "#fff", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit" }}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: TEXT_MUTED, margin: "0 0 6px" }}>EST. COMPLETION</p>
                      <input
                        type="date"
                        value={phase.expected_completion_date}
                        onChange={(e) => {
                          const updated = [...form.phases]
                          updated[idx] = { ...updated[idx], expected_completion_date: e.target.value }
                          setForm({ ...form, phases: updated })
                        }}
                        style={{ width: "100%", background: BG_PANEL, border: `1px solid ${BORDER}`, color: "#fff", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.refreshBtn, cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={handleCreateProject} disabled={creating} style={{ ...styles.refreshBtn, borderColor: GOLD, color: GOLD, cursor: "pointer" }}>
                {creating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Phase Modal */}
      {showPhaseModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: BG_PANEL, border: `1px solid ${BORDER}`, padding: "32px", width: "440px" }}>
            <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#fff", margin: "0 0 24px", fontSize: "18px" }}>Edit Phase</h3>
            <div style={{ marginBottom: "16px" }}>
              <p style={{ ...styles.expandedLabel, marginBottom: "6px" }}>PHASE NAME</p>
              <input
                type="text"
                value={phaseForm.phase_name}
                onChange={(e) => setPhaseForm({ ...phaseForm, phase_name: e.target.value })}
                style={{ width: "100%", background: BG_DARK, border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                {PHASE_SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setPhaseForm({ ...phaseForm, phase_name: s })}
                    style={{ background: "transparent", border: `1px solid rgba(255,255,255,0.1)`, color: TEXT_MUTED, fontSize: "11px", padding: "3px 10px", cursor: "pointer", fontFamily: "inherit" }}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <p style={{ ...styles.expandedLabel, marginBottom: "6px" }}>STATUS</p>
              <select
                value={phaseForm.status}
                onChange={(e) => setPhaseForm({ ...phaseForm, status: e.target.value })}
                style={{ width: "100%", background: BG_DARK, border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit" }}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <p style={{ ...styles.expandedLabel, marginBottom: "6px" }}>EST. COMPLETION DATE</p>
              <input
                type="date"
                value={phaseForm.expected_completion_date}
                onChange={(e) => setPhaseForm({ ...phaseForm, expected_completion_date: e.target.value })}
                style={{ width: "100%", background: BG_DARK, border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setShowPhaseModal(false); setEditingPhase(null) }} style={{ ...styles.refreshBtn, cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={handleSavePhase} disabled={savingPhase} style={{ ...styles.refreshBtn, borderColor: GOLD, color: GOLD, cursor: "pointer" }}>
                {savingPhase ? "Saving..." : "Save Phase"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Update Modal */}
      {showUpdateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: BG_PANEL, border: `1px solid ${BORDER}`, padding: "32px", width: "480px" }}>
            <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#fff", margin: "0 0 8px", fontSize: "18px" }}>Add Update</h3>
            <p style={{ fontSize: "12px", color: TEXT_MUTED, margin: "0 0 24px" }}>{selectedPhase?.phase_name}</p>
            <div style={{ marginBottom: "16px" }}>
              <p style={{ ...styles.expandedLabel, marginBottom: "6px" }}>NOTE</p>
              <textarea
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                rows={4}
                style={{ width: "100%", background: BG_DARK, border: `1px solid ${BORDER}`, color: "#fff", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <p style={{ ...styles.expandedLabel, marginBottom: "6px" }}>PHOTOS</p>
              <input type="file" multiple accept="image/*" onChange={(e) => setUpdatePhotos(Array.from(e.target.files))} style={{ fontSize: "12px", color: TEXT_DIM }} />
              {updatePhotos.length > 0 && <p style={{ fontSize: "11px", color: TEXT_MUTED, marginTop: "6px" }}>{updatePhotos.length} photo(s) selected</p>}
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setShowUpdateModal(false); setUpdateNote(""); setUpdatePhotos([]); setSelectedPhase(null) }} style={{ ...styles.refreshBtn, cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={handleAddUpdate} disabled={submittingUpdate} style={{ ...styles.refreshBtn, borderColor: GOLD, color: GOLD, cursor: "pointer" }}>
                {submittingUpdate ? "Saving..." : "Save Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab,   setActiveTab]   = useState("estimation")
  const [inquiries,   setInquiries]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState("")
  const [expandedId,  setExpandedId]  = useState(null)
  const admin = JSON.parse(localStorage.getItem("admin") || "{}")

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) navigate("/admin/login")
  }, [navigate])

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
      console.log(data.inquiries)
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

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerLogo}>PYDesignHK</span>
          <span style={styles.headerDivider}>|</span>
          <span style={styles.headerPortal}>Admin Dashboard</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.headerAdmin}>{admin.full_name || "Admin"}</span>
          <button style={styles.logoutBtn} onClick={handleLogout} type="button">Log Out</button>
        </div>
      </header>

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

      <div style={styles.content}>

        {activeTab === "estimation" && (
          <>
            <div style={styles.contentHeader}>
              <div>
                <h2 style={styles.contentTitle}>Submitted Inquiries</h2>
                <p style={styles.contentSub}>All cost estimation inquiries submitted through the website.</p>
              </div>
              <button style={styles.refreshBtn} onClick={fetchInquiries} type="button">↻ Refresh</button>
            </div>

            {loading && <div style={styles.stateMsg}>Loading inquiries...</div>}
            {error   && <div style={styles.errorBox}>{error}</div>}

            {!loading && !error && inquiries.length === 0 && (
              <div style={styles.emptyState}>
                <p style={styles.emptyIcon}>✦</p>
                <p style={styles.emptyText}>No inquiries submitted yet.</p>
              </div>
            )}

            {!loading && !error && inquiries.length > 0 && (
              <div style={styles.tableWrap}>
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

                {inquiries.map((inq) => (
                  <div key={inq.inquiry_id}>
                    <div
                      style={{ ...styles.tableRow, background: expandedId === inq.inquiry_id ? BG_PANEL2 : "transparent" }}
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
                                    {zone.replace(/_/g, " ")}: <span style={{ color: grade === "premium" ? GOLD : grade === "standard" ? "rgba(212,160,23,0.7)" : TEXT_DIM }}>{grade}</span>
                                  </p>
                                ))
                              : <p style={styles.expandedValue}>—</p>
                            }
                          </div>

                          <div style={styles.expandedSection}>
                            <p style={styles.expandedLabel}>STYLE PREFERENCES</p>
                            {inq.style_preferences && Object.keys(inq.style_preferences).length > 0
                              ? Object.entries(inq.style_preferences).map(([key, value]) => (
                                  value ? (
                                    <p key={key} style={styles.expandedValue}>
                                      {key.replace(/_/g, " ")}: <span style={{ color: GOLD }}>{String(value).replace(/_/g, " ")}</span>
                                    </p>
                                  ) : null
                                ))
                              : <p style={styles.expandedValue}>—</p>
                            }
                          </div>

                          <div style={styles.expandedSection}>
                            <p style={styles.expandedLabel}>ADDITIONAL ZONES</p>
                            <p style={styles.expandedValue}>{inq.additional_zones || "—"}</p>
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

        {activeTab === "tracker" && (
          <TrackerTab adminToken={localStorage.getItem("adminToken")} />
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
  headerLeft: { display: "flex", alignItems: "center", gap: "16px" },
  headerLogo: { fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "18px", color: GOLD },
  headerDivider: { color: "rgba(255,255,255,0.15)", fontSize: "16px" },
  headerPortal: { fontSize: "12px", letterSpacing: "0.14em", color: TEXT_MUTED },
  headerRight: { display: "flex", alignItems: "center", gap: "20px" },
  headerAdmin: { fontSize: "13px", color: TEXT_DIM, letterSpacing: "0.04em" },
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
  contentTitle: { fontSize: "24px", fontFamily: "Georgia, serif", fontWeight: "400", color: "#fff", margin: "0 0 6px" },
  contentSub: { fontSize: "13px", color: TEXT_MUTED, margin: 0 },
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
  stateMsg: { fontSize: "13px", color: TEXT_MUTED, padding: "48px 0", textAlign: "center" },
  errorBox: {
    padding: "12px 16px",
    background: "rgba(255,80,80,0.08)",
    border: "1px solid rgba(255,80,80,0.25)",
    color: "rgba(255,120,120,0.9)",
    fontSize: "13px",
    marginBottom: "24px",
  },
  emptyState: { textAlign: "center", padding: "80px 0" },
  emptyIcon: { fontSize: "24px", color: "rgba(212,160,23,0.3)", margin: "0 0 16px" },
  emptyText: { fontSize: "15px", color: TEXT_MUTED, margin: 0 },
  tableWrap: { border: `1px solid ${BORDER_SUBTLE}` },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    background: "rgba(212,160,23,0.04)",
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    gap: "16px",
  },
  th: { flex: 1, fontSize: "10px", letterSpacing: "0.16em", color: GOLD, fontWeight: "600" },
  tableRow: {
    display: "flex",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    gap: "16px",
    cursor: "pointer",
    transition: "background 0.12s ease",
  },
  td: { flex: 1, fontSize: "13px", color: TEXT_DIM },
  tdPrimary: { fontSize: "13px", color: "#fff", margin: "0 0 3px" },
  tdSecondary: { fontSize: "11px", color: TEXT_MUTED, margin: 0 },
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
  expandedSection: { display: "flex", flexDirection: "column", gap: "4px" },
  expandedLabel: { fontSize: "10px", letterSpacing: "0.16em", color: GOLD, margin: "0 0 6px", fontWeight: "600" },
  expandedValue: { fontSize: "12px", color: TEXT_DIM, margin: 0, lineHeight: 1.6, textTransform: "capitalize" },
  expandedActions: { paddingTop: "16px", borderTop: `1px solid ${BORDER_SUBTLE}` },
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