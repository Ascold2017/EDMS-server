const mongoose = require('mongoose');
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
});
mongoose.model('users', UsersShema);