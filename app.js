const cors = require('cors')
const config = require('./utils/config')
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const express = require('express')
// require('express-async-errors')

const app = express()

logger.info('connecting to ', config.MONGODB_URI)

mongoose
    .connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((err) => {
        logger.error('error connecting to MongoDB: ', err.message)
    })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/notes', notesRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
