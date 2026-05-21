require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./src/models/User')
const Role = require('./src/models/Role')

const DEFAULT_ROLES = [
  { name: 'رپورٹر',                fee: 4000,  sortOrder: 1 },
  { name: 'سٹی رپورٹر',            fee: 4500,  sortOrder: 2 },
  { name: 'کرائم رپورٹر',          fee: 4500,  sortOrder: 3 },
  { name: 'تحصیل رپورٹر',          fee: 5000,  sortOrder: 4 },
  { name: 'ڈپٹی بیورو چیف',        fee: 6000,  sortOrder: 5 },
  { name: 'بیورو چیف',             fee: 6500,  sortOrder: 6 },
  { name: 'ڈسٹرکٹ چیف رپورٹر',    fee: 7000,  sortOrder: 7 },
  { name: 'چیف رپورٹر پنجاب',      fee: 10000, sortOrder: 8 },
  { name: 'انچارج نمائندگان پنجاب', fee: 20000, sortOrder: 9 },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)

  // Seed admin
  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL })
  if (adminExists) {
    console.log('Admin already exists')
  } else {
    const hash = await bcrypt.hash('admin_password_change_me', 12)
    await User.create({
      name: '96 News Admin',
      email: process.env.ADMIN_EMAIL,
      password: hash,
      phone: '03000000000',
      cnic: '00000-0000000-0',
      address: 'HQ',
      city: 'Faisalabad',
      role: 'Admin',
      channelFee: 0,
      paymentStatus: 'approved',
      isAdmin: true,
    })
    console.log('Admin user created')
  }

  // Seed roles
  const roleCount = await Role.countDocuments()
  if (roleCount === 0) {
    await Role.insertMany(DEFAULT_ROLES)
    console.log(`${DEFAULT_ROLES.length} default roles created`)
  } else {
    console.log(`Roles already exist (${roleCount} found)`)
  }

  process.exit(0)
}

seed()
