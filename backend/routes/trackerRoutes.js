const express = require('express')
const router  = express.Router()
const {
  createProject,
  getAdminProjects,
  updateProject,
  updatePhase,
  addUpdate,
  uploadPhoto,
  getCustomerProjects,
} = require('../controllers/trackerController')

// Admin
router.post('/admin/projects',                    createProject)
router.get('/admin/projects',                     getAdminProjects)
router.patch('/admin/projects/:id',               updateProject)
router.patch('/admin/phases/:id',                 updatePhase)
router.post('/admin/phases/:phase_id/updates',    addUpdate)
router.post('/admin/updates/:update_id/photos',   ...uploadPhoto)

// Customer
router.get('/customer/projects', getCustomerProjects)

module.exports = router