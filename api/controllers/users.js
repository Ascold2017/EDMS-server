const mongoose = require('mongoose');
const users = mongoose.model('users');
module.exports.getAllUsers = (req, res) => {
    users.find({}, { token: 0, salt: 0, hash: 0 })
    .then(items => res.send(items))
    .catch(e => console.error(e));
}

module.exports.getCurrentUser = (req, res) => {
    console.log('userId', req.session.userId);
    users.findById(req.session.userId, { salt: 0, hash: 0 })
        .then(user => res.send(user))
        .catch(e => console.error(e));
}