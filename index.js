require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')
const { response } = require('express')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

const requestLogger = (req, res, next) => {
    console.log('Method: ', req.method)
    console.log('Path: ', req.path)
    console.log('Body: ', req.body)
    console.log('---')
    next()
}
app.use(requestLogger)

app.get('/', (req, res) => {
    console.log({ headers: req.headers })
    const singleHeader = req.get('accept')
    console.log({ singleHeader })
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes/', (req, res) => {
    Note.find({}).then((notes) => {
        console.log({ notes })
        res.json(notes)
    })
})

app.get('/api/notes/:id', (req, res, next) => {
    Note.findById(req.params.id)
        .then((note) => {
            if (!!note) {
                res.json(note)
            } else {
                res.status(404).end()
            }
        })
        .catch((err) => next(err))
})

app.delete('/api/notes/:id', (req, res) => {
    Note.findByIdAndRemove(req.params.id)
        .then((result) => {
            res.status(204).end()
        })
        .catch((err) => next(err))
})

app.post('/api/notes', (req, res, next) => {
    const body = req.body
    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })

    note.save()
        .then((savedNote) => {
            res.json(savedNote)
        })
        .catch((err) => next(err))
})

app.put('/api/notes/:id', (req, res, next) => {
    const { content, important } = req.body

    const note = {
        content,
        important,
    }

    Note.findByIdAndUpdate(req.params.id, note, {
        new: true,
        runValidators: true,
        context: 'query',
    })
        .then((updatedNote) => {
            res.json(updatedNote)
        })
        .catch((err) => next(err))
})

const unknownEndpoint = (req, res, next) => {
    res.status(404).send({ error: 'unknown endpoint' })
    next()
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: `malformatted id` })
    } else if (error.name === 'ValidationError') {
        return res.status(400).send({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
