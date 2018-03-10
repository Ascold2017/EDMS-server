const chai = require('chai')
const chaiHttp  = require('chai-http')
const app = require('../../app')

const should = chai.should()
chai.use(chaiHttp)

describe('Test index', () => {
    it('get index', (done) => {
        chai.request(app).get('/').end((err, res) => {
            if (err) console.log(err)
            res.should.have.status(200)
            res.should.have.header('content-type', 'text/html; charset=UTF-8');
            done()
        })
    })
    
})