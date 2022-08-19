const mongoose = require('mongoose')
const helper = require('./test_helper')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

describe('user login', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        await helper.generateDefaultUser()
    })

    test('successful login', async () => {
        const result = await api
            .post('/api/login')
            .send({ username: 'root', password: 'Sekret' })
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(result.body).toMatchObject({
            username: 'root',
            name: 'Super User',
        })
    })

    test('access denied - wrong password', async () => {
        const result = await api
            .post('/api/login')
            .send({ username: 'root', password: 'wrongPassword' })
            .expect(401)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('invalid username or password')
    })
})

afterAll(() => {
    mongoose.connection.close()
})
