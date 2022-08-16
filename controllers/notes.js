const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (req, res) => {
    const notes = await Note.find({})
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

notesRouter.post('/', async (req, res, next) => {
    const { body } = req
    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })

    try {
        const savedNote = await note.save()
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
