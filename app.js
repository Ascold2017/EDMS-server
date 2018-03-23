const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const compression = require('compression')
const mongoose = require('mongoose')
const jwt = require('jwt-simple')
const config = require('./config')
const multer = require('multer')
const cors = require('cors')
require('./api/models/db')

const api = require('./api/routes/index')

const app = express()

app.use(logger('dev'))

app.use(compression({ threshold: 1, filter: () => true }))

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/documents')
  },
  filename: function (req, file, callback) {
    var fileUrl = file.originalname + '?' + Date.now()
    callback(null, fileUrl)
  }
})

app.use(multer({ storage : storage }).single('file'))

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(express.static(path.join(__dirname, 'public/dist')))

// Allow crossdomain requests
app.use(cors())

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, token'
  )
  next()
})

const isAuth = (req, res, next) => {
  if (!req.headers['token']) { res.sendStatus(401) }
  else if (jwt.decode(req.headers['token'], config.token.secretKey)) {
    return next()
  }
}

app.use('/api', api)

app.use('/documents/:file', (req, res) => { // isAuth
  res.sendFile(path.resolve(__dirname, './public/documents', req.params.file + '?' + Object.keys(req.query)[0]))
})

app.use('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/dist', 'index.html'))
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

module.exports = app
