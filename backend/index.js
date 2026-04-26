const express = require('express')
const cors = require('cors')
require('dotenv').config()
const authRoutes = require('./routes/authRoutes')
const quoteRoutes = require('./routes/quoteRoutes')
const adminRoutes = require('./routes/adminRoutes')
const trackerRoutes = require('./routes/trackerRoutes')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/auth', authRoutes)
app.use('/quote', quoteRoutes)
app.use('/admin', adminRoutes)
app.use('/tracker', trackerRoutes)

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})