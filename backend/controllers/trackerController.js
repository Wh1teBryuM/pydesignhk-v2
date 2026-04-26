const { createClient } = require('@supabase/supabase-js')
const multer  = require('multer')
const path    = require('path')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const upload = multer({ storage: multer.memoryStorage() })

// ── Auth helpers ──
async function verifyAdmin(token) {
  const { data, error } = await supabase
    .from('sessions')
    .select('customer_id')
    .eq('token', token)
    .single()
  if (error || !data) return null
  const { data: customer } = await supabase
    .from('customers')
    .select('role')
    .eq('id', data.customer_id)
    .single()
  return customer?.role === 'admin' ? data.customer_id : null
}

async function verifyCustomer(token) {
  const { data, error } = await supabase
    .from('sessions')
    .select('customer_id, expires_at')
    .eq('token', token)
    .single()
  if (error || !data) return null
  if (new Date(data.expires_at) < new Date()) return null
  return data.customer_id
}

// ── Admin: Create project ──
const createProject = async (req, res) => {
  try {
    const token = req.headers['authorization']
    const adminId = await verifyAdmin(token)
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' })

    const { customer_email, project_name, status, start_date, end_date, estimated_cost, actual_cost, phases } = req.body

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer_email)
      .single()
    if (customerError || !customer) return res.status(404).json({ error: 'Customer not found' })

    const { data: project, error: projectError } = await supabase
      .from('tracker_projects')
      .insert({
        customer_id:    customer.id,
        project_name,
        status:         status || 'confirmed',
        start_date:     start_date  || null,
        end_date:       end_date    || null,
        estimated_cost: estimated_cost || null,
        actual_cost:    actual_cost    || null,
      })
      .select()
      .single()
    if (projectError) throw projectError

    // Insert phases if provided
    if (phases && phases.length > 0) {
      const phaseRows = phases.map((p, i) => ({
        project_id:               project.id,
        phase_name:               p.phase_name,
        phase_order:              i + 1,
        status:                   p.status || 'upcoming',
        expected_completion_date: p.expected_completion_date || null,
      }))
      const { error: phaseError } = await supabase.from('tracker_phases').insert(phaseRows)
      if (phaseError) throw phaseError
    }

    res.status(201).json({ message: 'Project created', project })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ── Admin: Get all projects ──
const getAdminProjects = async (req, res) => {
  try {
    const token = req.headers['authorization']
    const adminId = await verifyAdmin(token)
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' })

    const { data, error } = await supabase
      .from('tracker_projects')
      .select(`
        *,
        customers ( full_name, email ),
        tracker_phases (
          id, phase_name, phase_order, status, expected_completion_date,
          tracker_updates (
            id, note, created_at,
            tracker_photos ( id, photo_url, display_order )
          )
        )
      `)
      .order('created_at', { ascending: false })
    if (error) throw error

    // Sort phases and updates
    const projects = data.map(p => ({
      ...p,
      tracker_phases: (p.tracker_phases || [])
        .sort((a, b) => a.phase_order - b.phase_order)
        .map(ph => ({
          ...ph,
          tracker_updates: (ph.tracker_updates || [])
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        })),
    }))

    res.json({ projects })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ── Admin: Update project ──
const updateProject = async (req, res) => {
  try {
    const token = req.headers['authorization']
    const adminId = await verifyAdmin(token)
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    const { error } = await supabase
      .from('tracker_projects')
      .update(req.body)
      .eq('id', id)
    if (error) throw error

    res.json({ message: 'Project updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ── Admin: Update phase ──
const updatePhase = async (req, res) => {
  try {
    const token = req.headers['authorization']
    const adminId = await verifyAdmin(token)
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    const { phase_name, status, expected_completion_date } = req.body

    // Update the phase
    const { data: phase, error } = await supabase
      .from('tracker_phases')
      .update({ phase_name, status, expected_completion_date })
      .eq('id', id)
      .select('project_id')
      .single()
    if (error) throw error

    // Check if all phases for this project are completed
    const { data: allPhases, error: phasesError } = await supabase
      .from('tracker_phases')
      .select('status')
      .eq('project_id', phase.project_id)
    if (phasesError) throw phasesError

    const allDone = allPhases.every(p => p.status === 'completed')

    if (allDone) {
      await supabase
        .from('tracker_projects')
        .update({ status: 'completed' })
        .eq('id', phase.project_id)
    }

    res.json({ message: 'Phase updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ── Admin: Add update to phase ──
const addUpdate = async (req, res) => {
  try {
    const token = req.headers['authorization']
    const adminId = await verifyAdmin(token)
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' })

    const { phase_id } = req.params
    const { note } = req.body

    const { data: update, error } = await supabase
      .from('tracker_updates')
      .insert({ phase_id, note: note || null })
      .select()
      .single()
    if (error) throw error

    res.status(201).json({ update })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ── Admin: Upload photo ──
const uploadPhoto = async (req, res) => {
  try {
    const token = req.headers['authorization']
    const adminId = await verifyAdmin(token)
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' })

    const { update_id } = req.params
    const file         = req.file
    const display_order = parseInt(req.body.display_order) || 0

    if (!file) return res.status(400).json({ error: 'No file uploaded' })

    const ext      = path.extname(file.originalname)
    const filename = `${update_id}_${Date.now()}${ext}`

    const { error: uploadError } = await supabase.storage
      .from('tracker-photos')
      .upload(filename, file.buffer, { contentType: file.mimetype })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('tracker-photos')
      .getPublicUrl(filename)

    const { error: dbError } = await supabase
      .from('tracker_photos')
      .insert({ update_id, photo_url: publicUrl, display_order })
    if (dbError) throw dbError

    res.status(201).json({ photo_url: publicUrl })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ── Customer: Get own projects ──
const getCustomerProjects = async (req, res) => {
  try {
    const token      = req.headers['authorization']
    const customerId = await verifyCustomer(token)
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' })

    const { data, error } = await supabase
      .from('tracker_projects')
      .select(`
        id, project_name, status, start_date, end_date,
        tracker_phases (
          id, phase_name, phase_order, status, expected_completion_date,
          tracker_updates (
            id, note, created_at,
            tracker_photos ( id, photo_url, display_order )
          )
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    if (error) throw error

    const projects = data.map(p => ({
      ...p,
      tracker_phases: (p.tracker_phases || [])
        .sort((a, b) => a.phase_order - b.phase_order)
        .map(ph => ({
          ...ph,
          tracker_updates: (ph.tracker_updates || [])
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        })),
    }))

    res.json({ projects })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createProject,
  getAdminProjects,
  updateProject,
  updatePhase,
  addUpdate,
  uploadPhoto: [upload.single('photo'), uploadPhoto],
  getCustomerProjects,
}