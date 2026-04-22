const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const authRoutes = require('./routes/authRoutes')

const app = express()
const PORT = process.env.PORT || 3001

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

app.use(cors())
app.use(express.json())
app.use('/auth', authRoutes)

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is running' })
})

app.get('/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').select('*')
    if (error) throw error
    res.json({ success: true, data })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})