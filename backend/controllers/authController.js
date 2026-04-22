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

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !customer) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, customer.password_hash)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = uuidv4()
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await supabase.from('sessions').insert({
      customer_id: customer.id,
      token,
      expires_at
    })

    res.json({ token, customer: { id: customer.id, full_name: customer.full_name, email: customer.email } })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const logoutCustomer = async (req, res) => {
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

module.exports = { registerCustomer, loginCustomer, logoutCustomer }
