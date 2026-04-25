const express = require('express')
const router  = express.Router()
const { loginAdmin, logoutAdmin, getInquiries } = require('../controllers/adminController')

router.post('/login',     loginAdmin)
router.post('/logout',    logoutAdmin)
router.get('/inquiries',  getInquiries)

module.exports = router