const express = require('express')
const multer  = require('multer')
const router  = express.Router()
const {
  createProject,
  addZone,
  addUpdate,
  uploadPhoto,
  listProjects,
  updateProject,
  getCustomerProjects,
} = require('../controllers/trackerController')

const upload = multer({ storage: multer.memoryStorage() })

router.post('/admin/projects',                createProject)
router.post('/admin/projects/:id/zones',      addZone)
router.post('/admin/zones/:id/updates',       addUpdate)
router.post('/admin/updates/:id/photos',      upload.single('photo'), uploadPhoto)
router.get('/admin/projects',                 listProjects)
router.patch('/admin/projects/:id',           updateProject)
router.get('/customer/projects',              getCustomerProjects)

module.exports = router