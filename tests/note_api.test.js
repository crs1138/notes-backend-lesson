const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const Note = require('../models/note')
const api = supertest(app)

beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes)
})

describe('when there are initially some notes saved', () => {
    test('notes are returned as json', async () => {
        console.log('entered test')
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all notes are returned', async () => {
        const response = await api.get('/api/notes')
        expect(response.body).toHaveLength(helper.initialNotes.length)
    })

    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')
        const contents = response.body.map((r) => r.content)

        expect(contents).toContain('Browser can execute only Javascript')
    })
})

describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
        const notesAtStart = await helper.notesInDb()
        const noteToView = notesAtStart[0]

        const resultNote = await api
            .get(`/api/notes/${noteToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const processedNoteToView = JSON.parse(JSON.stringify(noteToView))

        expect(resultNote.body).toEqual(processedNoteToView)
    })

    test('fails with status code 404 if note does not exist', async () => {
        const validNonexistingId = await helper.nonExistingId()

        console.log(validNonexistingId)

        await api.get(`/api/notes/${validNonexistingId}`).expect(404)
    })

    test('fails with status code 400 if id is invalid', async () => {
        await api.get('/api/notes/invalidId').expect(400)
    })
})

describe('addition of a new note', () => {
    test('succeed with valid data', async () => {
        const newNote = {
            content: 'async/await simplifies making async calls',
            important: true,
        }

        await api
            .post('/api/notes')
            .send(newNote)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const notesAtEnd = await helper.notesInDb()
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

        const contents = notesAtEnd.map((n) => n.content)
        expect(contents).toContain('async/await simplifies making async calls')
    })

    test('fails with status code 400 if data invalid', async () => {
        const newNote = {
            important: true,
        }

        await api.post('/api/notes').send(newNote).expect(400)

        const notesAtEnd = await helper.notesInDb()

        expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
    })
})

describe('deletion of a note', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const notesAtStart = await helper.notesInDb()
        const noteToDelete = notesAtStart[0]

        await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

        const notesAtEnd = await helper.notesInDb()
        expect(notesAtEnd.length).toBe(notesAtStart.length - 1)

        const contents = notesAtEnd.map((r) => r.content)
        expect(contents).not.toContain(noteToDelete.content)
    })
})

afterAll(() => {
    mongoose.connection.close()
})
