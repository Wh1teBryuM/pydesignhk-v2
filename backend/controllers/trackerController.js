const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = {
  createProject: async (req, res) => {
  try {
    const token = req.headers['authorization']
    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('customer_id')
      .eq('token', token)
      .single()

    if (sessionError || !session) return res.status(401).json({ error: 'Invalid session' })

    const {
      customer_email,
      project_name,
      status,
      start_date,
      end_date,
      estimated_cost,
      actual_cost,
      zones,
    } = req.body

    if (!customer_email || !project_name || !status) {
      return res.status(400).json({ error: 'customer_email, project_name and status are required' })
    }

    // Look up the customer by email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer_email)
      .single()

    if (customerError || !customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('tracker_projects')
      .insert({
        customer_id:    customer.id,
        project_name,
        status,
        start_date:     start_date     || null,
        end_date:       end_date       || null,
        estimated_cost: estimated_cost || null,
        actual_cost:    actual_cost    || null,
      })
      .select()
      .single()

    if (projectError) throw projectError

    // Insert zones if provided
    if (zones && zones.length > 0) {
      const zoneRows = zones.map((name, index) => ({
        project_id:    project.id,
        zone_name:     name,
        display_order: index,
      }))

      const { error: zoneError } = await supabase
        .from('tracker_zones')
        .insert(zoneRows)

      if (zoneError) throw zoneError
    }

    res.status(201).json({ message: 'Project created', project_id: project.id })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
},
  addZone: async (req, res) => {
  try {
    const token = req.headers['authorization']
    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('customer_id')
      .eq('token', token)
      .single()

    if (sessionError || !session) return res.status(401).json({ error: 'Invalid session' })

    const { id } = req.params
    const { zone_name, display_order } = req.body

    if (!zone_name) return res.status(400).json({ error: 'zone_name is required' })

    const { data, error } = await supabase
      .from('tracker_zones')
      .insert({
        project_id:    id,
        zone_name,
        display_order: display_order || 0,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ message: 'Zone added', zone: data })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
},
  addUpdate: async (req, res) => {
  try {
    const token = req.headers['authorization']
    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('customer_id')
      .eq('token', token)
      .single()

    if (sessionError || !session) return res.status(401).json({ error: 'Invalid session' })

    const { id } = req.params
    const { note } = req.body

    const { data, error } = await supabase
      .from('tracker_updates')
      .insert({
        zone_id: id,
        note:    note || null,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ message: 'Update added', update: data })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
},
  uploadPhoto: async (req, res) => {
  try {
    const token = req.headers['authorization']
    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('customer_id')
      .eq('token', token)
      .single()

    if (sessionError || !session) return res.status(401).json({ error: 'Invalid session' })

    const { id } = req.params
    const { display_order } = req.body

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const fileExt  = req.file.originalname.split('.').pop()
    const fileName = `${id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('tracker-photos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('tracker-photos')
      .getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('tracker_photos')
      .insert({
        update_id:     id,
        photo_url:     urlData.publicUrl,
        display_order: display_order || 0,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ message: 'Photo uploaded', photo: data })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
},
  listProjects: async (req, res) => {
  try {
    const token = req.headers['authorization']
    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('customer_id')
      .eq('token', token)
      .single()

    if (sessionError || !session) return res.status(401).json({ error: 'Invalid session' })

    const { data, error } = await supabase
      .from('tracker_projects')
      .select(`
        id,
        project_name,
        status,
        start_date,
        end_date,
        estimated_cost,
        actual_cost,
        created_at,
        customers (
          id,
          full_name,
          email
        ),
        tracker_zones (
          id,
          zone_name,
          display_order,
          tracker_updates (
            id,
            note,
            created_at,
            tracker_photos (
              id,
              photo_url,
              display_order
            )
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ projects: data })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
},
  updateProject: async (req, res) => {
  try {
    const token = req.headers['authorization']
    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('customer_id')
      .eq('token', token)
      .single()

    if (sessionError || !session) return res.status(401).json({ error: 'Invalid session' })

    const { id } = req.params
    const { status, start_date, end_date, estimated_cost, actual_cost, project_name } = req.body

    const updates = {}
    if (status)         updates.status         = status
    if (start_date)     updates.start_date     = start_date
    if (end_date)       updates.end_date       = end_date
    if (estimated_cost) updates.estimated_cost = estimated_cost
    if (actual_cost)    updates.actual_cost    = actual_cost
    if (project_name)   updates.project_name   = project_name

    const { error } = await supabase
      .from('tracker_projects')
      .update(updates)
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Project updated' })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
},
  getCustomerProjects: async (req, res) => {
  try {
    const token = req.headers['authorization']
    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('customer_id')
      .eq('token', token)
      .single()

    if (sessionError || !session) return res.status(401).json({ error: 'Invalid session' })

    const { data, error } = await supabase
      .from('tracker_projects')
      .select(`
        id,
        project_name,
        status,
        start_date,
        end_date,
        estimated_cost,
        actual_cost,
        created_at,
        tracker_zones (
          id,
          zone_name,
          display_order,
          tracker_updates (
            id,
            note,
            created_at,
            tracker_photos (
              id,
              photo_url,
              display_order
            )
          )
        )
      `)
      .eq('customer_id', session.customer_id)
      .in('status', ['confirmed', 'in_progress', 'completed'])
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ projects: data })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
},
}