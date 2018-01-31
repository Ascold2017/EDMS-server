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



mongoose.model('groups', GroupsShema);