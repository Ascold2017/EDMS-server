const mongoose = require('mongoose');

module.exports.getAllUsers = (req, res) => {
    const users = mongoose.model('users');

    users.find({}, { token: 0, salt: 0, hash: 0 })
    .then(items => res.send(items))
    .catch(e => console.error(e));
}