const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  level: { type: String, enum: ['province', 'district', 'tehsil', 'city'], required: true, default: 'city' },
  fee: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Role', roleSchema)
