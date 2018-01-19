const mongoose = require('mongoose');

module.exports.getAllUsers = (req, res) => {
    const users = mongoose.model('users');

    users.find()
    .then(items => res.send(items))
    .catch(e => console.error(e));
}