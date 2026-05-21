const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  body:      { type: String, required: true },
  type:      { type: String, enum: ['new_application', 'approved', 'rejected'], required: true },
  read:      { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)
