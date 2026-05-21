const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, cnic, address, province, district, tehsil, city, role, channelFee, profilePhoto } = req.body

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const hash = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      password: hash,
      phone,
      cnic,
      address,
      province,
      district,
      tehsil,
      city,
      role,
      channelFee,
      profilePhoto: profilePhoto || null,
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })

    const userObj = user.toObject()
    delete userObj.password

    res.status(201).json({ token, user: userObj })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })

    const userObj = user.toObject()
    delete userObj.password

    res.json({ token, user: userObj })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.getMe = async (req, res) => {
  res.json(req.user)
}

exports.updatePushToken = async (req, res) => {
  try {
    const { token } = req.body
    await User.findByIdAndUpdate(req.user._id, { expoPushToken: token })
    res.json({ message: 'Push token updated' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
