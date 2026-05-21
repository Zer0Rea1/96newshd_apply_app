const router = require('express').Router()
const { register, login, getMe, updatePushToken } = require('../controllers/authController')
const auth = require('../middleware/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', auth, getMe)
router.patch('/push-token', auth, updatePushToken)

module.exports = router
