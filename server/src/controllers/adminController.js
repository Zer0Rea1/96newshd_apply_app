const User = require('../models/User')
const Notification = require('../models/Notification')
const Role = require('../models/Role')
const { sendPush } = require('../utils/pushNotif')

exports.getApplications = async (req, res) => {
  try {
    const filter = {}
    if (req.query.status) filter.paymentStatus = req.query.status
    filter.isAdmin = false

    const applications = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })

    res.json(applications)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.approveApplication = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.paymentStatus = 'approved'
    user.subscribedDate = new Date()
    user.nextDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    user.rejectionReason = null
    await user.save()

    await sendPush(
      user.expoPushToken,
      'Application Approved',
      'Congratulations! Your 96 News HD membership has been activated.',
      { type: 'approved' }
    )

    await Notification.create({
      userId: user._id,
      title: 'Approved',
      body: 'Your application has been approved.',
      type: 'approved',
    })

    const userObj = user.toObject()
    delete userObj.password

    res.json({ message: 'Approved', user: userObj })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.rejectApplication = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const reason = req.body.reason || 'Your payment could not be verified. Please contact support.'

    user.paymentStatus = 'rejected'
    user.rejectionReason = reason
    await user.save()

    await sendPush(
      user.expoPushToken,
      'Application Rejected',
      reason,
      { type: 'rejected' }
    )

    await Notification.create({
      userId: user._id,
      title: 'Rejected',
      body: reason,
      type: 'rejected',
    })

    const userObj = user.toObject()
    delete userObj.password

    res.json({ message: 'Rejected', user: userObj })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const filter = { isAdmin: false }
    if (req.query.status) filter.paymentStatus = req.query.status
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { city: { $regex: req.query.search, $options: 'i' } },
        { role: { $regex: req.query.search, $options: 'i' } },
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ])

    res.json({ users, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.getStats = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [pending, approved, recentApproved] = await Promise.all([
      User.countDocuments({ paymentStatus: 'pending', isAdmin: false }),
      User.countDocuments({ paymentStatus: 'approved', isAdmin: false }),
      User.find({
        paymentStatus: 'approved',
        isAdmin: false,
        subscribedDate: { $gte: startOfMonth },
      }),
    ])

    const revenue = recentApproved.reduce((sum, u) => sum + u.channelFee, 0)

    const recentSubmissions = await User.find({ isAdmin: false })
      .select('name role paymentStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({ pending, approved, revenue, recentSubmissions })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true })
    res.json({ message: 'Marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── Role Management ──

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ sortOrder: 1 })
    res.json(roles)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.createRole = async (req, res) => {
  try {
    const { name, fee, sortOrder } = req.body
    if (!name || fee == null) return res.status(400).json({ message: 'Name and fee are required' })

    const exists = await Role.findOne({ name })
    if (exists) return res.status(400).json({ message: 'Role name already exists' })

    const role = await Role.create({ name, fee, sortOrder: sortOrder ?? 0 })
    res.status(201).json(role)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.updateRole = async (req, res) => {
  try {
    const { name, fee, isActive, sortOrder } = req.body
    const role = await Role.findById(req.params.id)
    if (!role) return res.status(404).json({ message: 'Role not found' })

    if (name != null) role.name = name
    if (fee != null) role.fee = fee
    if (isActive != null) role.isActive = isActive
    if (sortOrder != null) role.sortOrder = sortOrder
    await role.save()

    res.json(role)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.deleteRole = async (req, res) => {
  try {
    await Role.findByIdAndDelete(req.params.id)
    res.json({ message: 'Role deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
