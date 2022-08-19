const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'jpozivil',
            name: 'Jan Pozivil',
            password: 'Honza',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map((u) => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper status code and message if username already exists', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'SuperUser',
            password: 'Franta',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('username must be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
})

describe('viewing users', () => {
    test('view all users', async () => {
        const usersAtStart = await helper.usersInDb()

        const result = await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(result.body).toMatchObject([{ username: 'root', notes: [] }])
    })
})
