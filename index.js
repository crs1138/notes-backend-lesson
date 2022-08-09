const express = require('express')
const cors = require('cors')
const app = express()
let notes = [
    {
        id: 1,
        content: 'HTML is easy',
        date: '2022-1-17T17:30:31.098Z',
        important: true,
    },
    {
        id: 2,
        content: 'Browser can execute only JavaScript',
        date: '2022-1-17T18:39:34.091Z',
        important: false,
    },
    {
        id: 3,
        content: 'GET and POST are the most important methods of HTTP protocol',
        date: '2022-1-17T19:20:14.298Z',
        important: false,
    },
    {
        content: 'Testing adding new note',
        date: '2022-08-06T10:27:56.106Z',
        important: true,
        id: 4,
    },
    {
        content:
            'This business of saving new data on the server seems much easier than I thought it would be.',
        date: '2022-08-06T10:32:24.111Z',
        important: true,
        id: 5,
    },
    {
        content: "Here's a new note after refactor",
        date: '2022-08-06T15:58:18.617Z',
        important: false,
        id: 6,
    },
    {
        content:
            'Refactoring, using the return of the promise.then() for the save functionality',
        date: '2022-08-06T16:09:14.916Z',
        important: false,
        id: 7,
    },
]

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

app.get('/', (req, res) => {
    console.log({ headers: req.headers })
    const singleHeader = req.get('accept')
    console.log({ singleHeader })
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes/', (req, res) => {
    console.log(req.headers)
    res.json(notes)
})

app.get('/api/notes/:id', (req, res) => {
    const id = Number(req.params.id)
    const note = notes.find((note) => note.id === id)
    if (!!note) {
        res.json(note)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/notes/:id', (req, res) => {
    const id = Number(req.params.id)
    notes = notes.filter((note) => note.id !== id)

    res.status(204).end()
})

const generateId = (nodes) => {
    const maxId = nodes.length > 0 ? Math.max(...nodes.map((n) => n.id)) : 0
    return maxId + 1
}

app.post('/api/notes', (req, res) => {
    const body = req.body
    if (!body.content) {
        return res.status(400).json({ error: `Content missing` })
    }
    const note = {
        content: body.content,
        important: body.important || false,
        date: new Date(),
        id: generateId(notes),
    }
    notes = notes.concat(note)
    res.json(note)
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

const PORT = process.env.port || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
