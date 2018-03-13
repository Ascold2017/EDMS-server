const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
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
            dateRegistration: {
                type: String,
            },
            author: {
                type: String,
            },
            role: {
                type: String,
                required: true,
            },
            token: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            login: {
                type: String,
                required: true,
            },
            publicKey: {
                type: String
            },
            hash: String,
            salt: String
        }
    ]
});

GroupsShema.plugin(uniqueValidator)

mongoose.model('groups', GroupsShema);