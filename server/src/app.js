const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/applications', require('./routes/applications'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/roles', require('./routes/roles'))
app.use('/api/locations', require('./routes/locations'))

module.exports = app
