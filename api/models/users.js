const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;
const UsersShema = new Schema({
    author: {
        type: String
    },
    role: {
        type: String
    },
    token: {
        type: String
    },
    login: {
        type: String,
        unique: true,
        required: true
    },
    hash: String,
    salt: String
});

UsersShema.methods.setPassword = function (password) {
    this.salt = crypto
        .randomBytes(16)
        .toString('hex');
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 512, 'sha512')
        .toString('hex');
};

UsersShema.methods.validPassword = function (password) {
    var hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 512, 'sha512')
        .toString('hex');
    return this.hash === hash;
};

mongoose.model('users', UsersShema);