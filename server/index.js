require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware')

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.json())
app.use(cookieParser())

// CORS
app.use(cors({
  origin: true,
  credentials: true
}))

app.use('/api', router)
app.use(errorMiddleware)

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL)
    console.log('✅ MongoDB connected')

    app.listen(PORT, () => console.log(`🚀 Server started on PORT = ${PORT}`))
  } catch (error) {
    console.log('❌ Start error:', error)
  }
}

start()