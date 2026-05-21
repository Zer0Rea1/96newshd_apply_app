const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  cnic: { type: String, required: true },
  address: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, default: null },
  tehsil: { type: String, default: null },
  city: { type: String, default: null },
  role: { type: String, required: true },
  channelFee: { type: Number, required: true },
  profilePhoto: { type: String, default: null },
  paymentStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentScreenshot: { type: String, default: null },
  rejectionReason: { type: String, default: null },
  subscribedDate: { type: Date, default: null },
  nextDueDate: { type: Date, default: null },
  expoPushToken: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
