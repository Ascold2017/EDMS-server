const mongoose = require('mongoose');

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
            },
            login: {
                type: String,
                required: true,
            },
            hash: String,
            salt: String
        }
    ]
});



mongoose.model('groups', GroupsShema);