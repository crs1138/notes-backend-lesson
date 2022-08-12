require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')
const { response } = require('express')
const app = express()

const requestLogger = (req, res, next) => {
    console.log('Method: ', req.method)
    console.log('Path: ', req.path)
    console.log('Body: ', req.body)
    console.log('---')
    next()
}

app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(express.static('build'))

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

app.get('/api/notes/:id', (req, res) => {
    Note.findById(req.params.id).then((note) => {
        console.log({ note })
        res.json(note)
    })
})

app.delete('/api/notes/:id', (req, res) => {
    const id = Number(req.params.id)
    notes = notes.filter((note) => note.id !== id)

    res.status(204).end()
})

app.post('/api/notes', (req, res) => {
    const body = req.body
    if (!body.content) {
        return res.status(400).json({ error: `Content missing` })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })

    note.save().then((savedNote) => {
        res.json(savedNote)
    })
})

app.put('/api/notes/:id', (req, res) => {
    const body = req.body
    const note = notes.find((note) => note.id === body.id)
    const changedNote = { ...note, important: body.important }
    notes = notes.map((note) => (note.id !== body.id ? note : changedNote))
    console.log('notes :', notes)
    console.log('changedNote :', changedNote)

    res.json(changedNote)
})

const unknownEndpoint = (req, res, next) => {
    res.status(404).send({ error: 'unknown endpoint' })
    next()
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
