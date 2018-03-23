const chai = require('chai')
const chaiHttp  = require('chai-http')
const app = require('../../app')

const should = chai.should()
chai.use(chaiHttp)

describe('Test response index.html', () => {
    it('get /', (done) => {
        chai.request(app).get('/').end((err, res) => {
            expect(err).toBe(null)
            res.should.have.status(200)
            res.should.have.header('content-type', 'text/html; charset=UTF-8');
            done()
        })
    })
    it('get /edms', (done) => {
        chai.request(app).get('/edms').end((err, res) => {
            expect(err).toBe(null)
            res.should.have.status(200)
            res.should.have.header('content-type', 'text/html; charset=UTF-8');
            done()
        })
    })
    it('get /asdsads', (done) => {
        chai.request(app).get('/asdsads').end((err, res) => {
            expect(err).toBe(null)
            res.should.have.status(200)
            res.should.have.header('content-type', 'text/html; charset=UTF-8');
            done()
        })
    })
})

describe('Test authentification USER', () => {
    it('All data is correct', (done) => {

    })
    it('Login invalid, cert is valid', (done) => {

    })
    it('Login is valid, cert is invalid', (done) => {

    })
    it('All is invalid', (done) => {

    })
})

describe('Test authentification ADMIN || SUPERADMIN', () => {
    it('Login, password valid', (done) => {

    })
    it('Login, invalid', (done) => {
        
    })
    it('Password invalid', (done) => {
        
    })
    it('Login, password invalid', (done) => {
        
    })
})