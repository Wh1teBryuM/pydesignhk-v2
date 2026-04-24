const express    = require('express')
const router     = express.Router()
const { submitQuote } = require('../controllers/quoteController')
 
router.post('/submit', submitQuote)
 
module.exports = router