const router = require('express').Router()
const Role = require('../models/Role')
const User = require('../models/User')

router.get('/', async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).sort({ sortOrder: 1 })
    res.json(roles)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.get('/available', async (req, res) => {
  try {
    const { province, district, tehsil, city } = req.query;

    if (!province) {
      return res.status(400).json({ message: "Province is required" });
    }

    // Determine the query parameters to find existing users at this specific location
    let locationQuery = { province: new RegExp(`^${province}$`, 'i') };

    // We want to query users exactly at the specified level or above that might conflict
    if (district) locationQuery.district = new RegExp(`^${district}$`, 'i');
    if (tehsil) locationQuery.tehsil = new RegExp(`^${tehsil}$`, 'i');
    if (city) locationQuery.city = new RegExp(`^${city}$`, 'i');

    const existingUsers = await User.find(locationQuery);
    const takenRoleNames = existingUsers.map(user => user.role);

    // Now find all roles
    const allRoles = await Role.find({ isActive: true }).sort({ sortOrder: 1 });

    // Filter out the roles that are taken AT THIS SPECIFIC LEVEL
    // Also, theoretically we only want to show roles that correspond to the level selected
    // but the system UI can just filter those out or we return all available ones
    const availableRoles = allRoles.filter(role => !takenRoleNames.includes(role.name));

    res.json(availableRoles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router
