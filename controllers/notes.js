const jwt = require('jsonwebtoken')
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async (req, res) => {
    const notes = await Note.find({}).populate('user', {
        username: 1,
        name: 1,
    })
    res.json(notes)
})

notesRouter.get('/:id', async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id)
        if (note) {
            res.json(note)
        } else {
            res.status(404).end()
        }
    } catch (exception) {
        next(exception)
    }
})

const getTokenFrom = (req) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

notesRouter.post('/', async (req, res, next) => {
    const { content, important, userId } = req.body
    const token = getTokenFrom(req)
    if (!token) {
        return res.status(401).json({ error: 'token missing' })
    }

    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken?.id) {
        return res.status(401).json({ error: 'invalid token' })
    }

    const user = await User.findById(decodedToken.id)

    const note = new Note({
        content,
        important: important || false,
        date: new Date(),
        user: userId,
    })

    try {
        const savedNote = await note.save()
        user.notes = user.notes.concat(savedNote._id)
        await user.save()

        res.status(201).json(savedNote)
    } catch (exception) {
        next(exception)
    }
})

notesRouter.delete('/:id', async (req, res, next) => {
    try {
        await Note.findByIdAndRemove(req.params.id)
        res.status(204).end()
    } catch (exception) {
        next(exception)
    }
})

notesRouter.put('/:id', (req, res, next) => {
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

module.exports = notesRouter
