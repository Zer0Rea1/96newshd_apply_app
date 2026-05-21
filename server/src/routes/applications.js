const router = require('express').Router()
const { uploadMiddleware, uploadScreenshot, getMyApplication } = require('../controllers/applicationController')
const auth = require('../middleware/authMiddleware')

router.post('/screenshot', auth, uploadMiddleware, uploadScreenshot)
router.get('/my', auth, getMyApplication)

module.exports = router
