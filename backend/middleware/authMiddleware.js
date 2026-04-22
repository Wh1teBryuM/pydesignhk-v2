const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !session) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    if (new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Token expired' })
    }

    req.customerId = session.customer_id

    next()

  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = authMiddleware