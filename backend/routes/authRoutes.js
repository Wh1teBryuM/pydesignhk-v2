const express = require('express')
const router = express.Router()
const { registerCustomer } = require('../controllers/authController')

router.post('/register', registerCustomer)

module.exports = router