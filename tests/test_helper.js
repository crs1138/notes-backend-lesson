const bcrypt = require('bcrypt')
const Note = require('../models/note')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const initialNotes = [
    {
        content: 'HTML is easy',
        date: new Date(),
        important: false,
    },
    {
        content: 'Browser can execute only Javascript',
        date: new Date(),
        important: false,
    },
]

const nonExistingId = async () => {
    const note = new Note({ content: 'willremovethissoon', date: new Date() })
    await note.save()
    await note.remove()

    return note._id.toString()
}

const notesInDb = async () => {
    const notes = await Note.find({})
    return notes.map((note) => note.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map((user) => user.toJSON())
}

const generateDefaultUser = async () => {
    const passwordHash = await bcrypt.hash('Sekret', 10)
    const user = new User({
        username: 'root',
        name: 'Super User',
        passwordHash,
    })
    await user.save()
    return user
}

const getAuthToken = async () => {
    const userLoggedIn = await api
        .post('/api/login')
        .send({ username: 'root', password: 'Sekret' })
        .expect(200)
    return userLoggedIn.body.token
}

module.exports = {
    initialNotes,
    nonExistingId,
    notesInDb,
    usersInDb,
    generateDefaultUser,
    getAuthToken,
}
