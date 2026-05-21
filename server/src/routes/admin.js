const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const admin = require('../middleware/adminMiddleware')
const {
  getApplications,
  approveApplication,
  rejectApplication,
  getUsers,
  getUserById,
  getStats,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/adminController')

router.use(auth, admin)

router.get('/applications', getApplications)
router.patch('/applications/:id/approve', approveApplication)
router.patch('/applications/:id/reject', rejectApplication)
router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.get('/stats', getStats)
router.get('/notifications', getNotifications)
router.patch('/notifications/:id/read', markNotificationRead)
router.delete('/notifications/:id', deleteNotification)
router.get('/roles', getRoles)
router.post('/roles', createRole)
router.patch('/roles/:id', updateRole)
router.delete('/roles/:id', deleteRole)

module.exports = router
