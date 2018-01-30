const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;
const GroupsShema = new Schema({
    name: {
        type: String,
        required: [ true, 'Укажите название группы']
    },
    groupInvite: {
        type: String,
        required: [ true, 'Укажите инвайт группы']
    },
    users: [
        {
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
            },
            hash: String,
            salt: String
        }
    ]
});

GroupsShema.methods.setPassword = function (password) {
    this.users.salt = crypto
        .randomBytes(16)
        .toString('hex');
    this.hash = crypto
        .pbkdf2Sync(password, this.users.salt, 1000, 512, 'sha512')
        .toString('hex');
};

GroupsShema.methods.validPassword = function (password) {
    var hash = crypto
        .pbkdf2Sync(password, this.users.salt, 1000, 512, 'sha512')
        .toString('hex');
    return this.users.hash === hash;
};

mongoose.model('groups', GroupsShema);