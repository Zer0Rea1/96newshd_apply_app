require('dotenv').config()
const mongoose = require('mongoose')
const app = require('./src/app')
console.log("starting")
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT || 5000, () => console.log('Server running'))
  })
  .catch(console.error)

module.export = app
