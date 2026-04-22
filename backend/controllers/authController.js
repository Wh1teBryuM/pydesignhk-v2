const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const registerCustomer = async (req, res) => {
  try {
    const { full_name, email, password } = req.body

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from('customers')
      .insert({ full_name, email, password_hash })
      .select()
      .single()

    if (error) throw error

    const token = uuidv4()
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await supabase.from('sessions').insert({
      customer_id: data.id,
      token,
      expires_at
    })

    res.status(201).json({ token, customer: { id: data.id, full_name, email } })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { registerCustomer }