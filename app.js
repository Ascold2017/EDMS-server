var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const compression = require("compression");
const mongoose = require("mongoose");
const jwt = require('jwt-simple');
const config = require('./config');
const multer = require('multer');
const cors = require('cors');
require("./api/models/db");

var api = require("./api/routes/index");

var app = express();


app.use(logger("dev"));

app.use(
  compression({
    // Сжимаем HTTP ответы, тело которых длиннее одного байта
    threshold: 1,
    // Сжимаем HTTP ответы независимо от их mime-типа
    filter: function() {
      return true;
    }
  })
);

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/upload');
  },
  filename: function (req, file, callback) {
    var fileUrl = file.originalname;
    callback(null, fileUrl);
  }
});

app.use(multer({ storage : storage }).single('file'));


app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public/dist")));

// Allow crossdomain requests
app.use(cors());

app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, token"
  );
  next();
});


const isAuth = (req, res, next) => {
  // если в сессии текущего пользователя есть пометка о том, что он является
  console.log(req.headers)
  if (!req.headers['token']) {
      console.log('no token');
      res.sendStatus(401);
  }
  else if (jwt.decode(req.headers['token'], config.token.secretKey).isAuth) {
    //то всё хорошо
    return next();
  }
};

app.use("/api", api);

app.use("/upload/:file", isAuth, (req, res) => { //
  console.log(req.params.file)
  res.sendFile(path.resolve(__dirname, "./public/upload", req.params.file));
});

app.use("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./public", "edms.html"));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});



module.exports = app;
