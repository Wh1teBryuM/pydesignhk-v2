const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const { createClient } = require('@supabase/supabase-js')
 
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
 
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body
 
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
 
    // Fetch account by email
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()
 
    if (error || !customer) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
 
    // Check role is admin — reject non-admins at the backend level
    if (customer.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }
 
    // Check account is active
    if (customer.account_status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' })
    }
 
    // Verify password
    const passwordMatch = await bcrypt.compare(password, customer.password_hash)
 
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
 
    // Create session token
    const token = uuidv4()
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
 
    await supabase.from('sessions').insert({
      customer_id: customer.id,
      token,
      expires_at,
    })
 
    res.json({
      token,
      admin: {
        id:        customer.id,
        full_name: customer.full_name,
        email:     customer.email,
      },
    })
 
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
 
const logoutAdmin = async (req, res) => {
  try {
    const token = req.headers['authorization']
 
    if (!token) {
      return res.status(400).json({ error: 'No token provided' })
    }
 
    await supabase.from('sessions').delete().eq('token', token)
 
    res.json({ message: 'Logged out successfully' })
 
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getInquiries = async (req, res) => {
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
      .from('inquiries')
      .select(`
        id,
        contact_full_name,
        contact_phone,
        contact_email,
        preferred_contact_method,
        additional_notes,
        submitted_at,
        projects (
        priority_profile, property_type, district, building_age,
        saleable_area_sqft, bedroom_count, bathroom_count,
        kitchen_count, living_room_count, estate_name, block,
        floor, flat, street, lift_access, has_stairs, has_parking,
        site_remarks, renovation_scope, additional_requirements,
        material_grades, style_preferences, additional_zones
      ),
        customers (
          full_name, email
        )
      `)
      .order('submitted_at', { ascending: false })

    if (error) throw error

    const inquiries = data.map((inq) => ({
    inquiry_id:               inq.id,
    preferred_contact_method: inq.preferred_contact_method,
    additional_notes:         inq.additional_notes,
    submitted_at:             inq.submitted_at,
    contact_full_name:        inq.contact_full_name,
    contact_phone:            inq.contact_phone,
    contact_email:            inq.contact_email,
    ...inq.projects,
  }))

    res.json({ inquiries })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
 
module.exports = { loginAdmin, logoutAdmin, getInquiries }