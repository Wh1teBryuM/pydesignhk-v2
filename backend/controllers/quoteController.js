const { createClient } = require('@supabase/supabase-js')
 
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
 
const submitQuote = async (req, res) => {
  try {
    // ── 1. Authenticate — read customer_id from session token ──
    const token = req.headers['authorization']
 
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
 
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('customer_id, expires_at')
      .eq('token', token)
      .single()
 
    if (sessionError || !session) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }
 
    if (new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Session expired' })
    }
 
    const customer_id = session.customer_id
 
    // ── 2. Destructure request body ──
    const {
      // Step 1
      priority_profile,
      property_type,
      district,
      building_age,
      sqft,
      bedrooms,
      bathrooms,
      kitchens,
      living_rooms,
      estate_name,
      block,
      floor,
      flat,
      street,
      lift_access,
      has_stairs,
      has_parking,
      site_remarks,
      // Step 2
      renovation_scope,
      partial_rooms,
      additional_zones,
      // Step 3
      material_grades,   // { demolition: "standard", painting: "basic", ... }
      // Step 4
      additional_requirements,
      // Step 6
      contact_full_name,
      contact_phone,
      contact_email,
      preferred_contact_method,
      preferred_contact_time,
      inquiry_notes,
    } = req.body
 
    // ── 3. Validate required fields ──
    if (
      !priority_profile || !property_type || !district || !building_age ||
      !sqft || !renovation_scope || !material_grades ||
      !contact_full_name || !contact_phone || !contact_email ||
      !preferred_contact_method || !preferred_contact_time
    ) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
 
    // ── 4. Insert into projects table ──
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        customer_id,
        priority_profile,
        property_type,
        district,
        building_age,
        saleable_area_sqft: sqft,
        bedroom_count:      bedrooms      || 0,
        bathroom_count:     bathrooms     || 0,
        kitchen_count:      kitchens      || 0,
        living_room_count:  living_rooms  || 0,
        estate_name,
        block,
        floor,
        flat,
        street,
        lift_access,
        has_stairs:          has_stairs    ?? false,
        has_parking:         has_parking   ?? false,
        site_remarks:        site_remarks  || null,
        renovation_scope,
        partial_zones:       partial_rooms || [],
        additional_requirements: additional_requirements || null,
        enhancements:        [],
        style_direction:     null,
        status:              'inquiry_submitted',
      })
      .select()
      .single()
 
    if (projectError) throw projectError
 
    // ── 5. Insert into inquiries table ──
    const { error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        project_id:               project.id,
        customer_id,
        preferred_contact_method,
        preferred_contact_time,
        additional_notes:         inquiry_notes || null,
      })
 
    if (inquiryError) throw inquiryError
 
    // ── 6. Return success ──
    res.status(201).json({
      message:    'Inquiry submitted successfully',
      project_id: project.id,
    })
 
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
 
module.exports = { submitQuote }