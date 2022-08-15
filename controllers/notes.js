const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', (req, res) => {
    Note.find({}).then((notes) => {
        console.log({ notes })
        res.json(notes)
    })
})

notesRouter.get('/:id', (req, res, next) => {
    Note.findById(req.params.id)
        .then((note) => {
            if (note) {
                res.json(note)
            } else {
                res.status(404).end()
            }
        })
        .catch((err) => next(err))
})

notesRouter.post('/', (req, res, next) => {
    const { body } = req
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

notesRouter.delete('/:id', (req, res, next) => {
    Note.findByIdAndRemove(req.params.id)
        .then((result) => {
            res.status(204).end()
        })
        .catch((err) => next(err))
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
