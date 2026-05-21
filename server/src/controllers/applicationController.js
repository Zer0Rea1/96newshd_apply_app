const multer = require('multer')
const User = require('../models/User')
const Notification = require('../models/Notification')
const { storage } = require('../utils/cloudinary')
const { sendPush } = require('../utils/pushNotif')

const upload = multer({ storage })

exports.uploadMiddleware = upload.single('screenshot')

exports.uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { paymentScreenshot: req.file.path },
      { new: true }
    ).select('-password')

    // Notify admin
    const admin = await User.findOne({ isAdmin: true })
    if (admin) {
      await sendPush(
        admin.expoPushToken,
        'New Application',
        `${req.user.name} applied for ${req.user.role} — Rs ${req.user.channelFee}`,
        { type: 'new_application', userId: req.user._id.toString() }
      )

      await Notification.create({
        userId: admin._id,
        title: 'New Application',
        body: `${req.user.name} — ${req.user.role}`,
        type: 'new_application',
        relatedId: req.user._id,
      })
    }

    res.json({ message: 'Screenshot uploaded', user })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.getMyApplication = async (req, res) => {
  res.json(req.user)
}
