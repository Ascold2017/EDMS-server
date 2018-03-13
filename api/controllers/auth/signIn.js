const express = require('express');
const mongoose = require('mongoose');
const Groups = mongoose.model('groups');
const cryptoPass = require('../../../lib/cryptoPass');
const jwt = require('jwt-simple');
const config = require('../../../config');

module.exports = (req, res) => {
    Groups.findOne({ $or: [ { 'users.login': req.body.userLogin }, { 'users.email': req.body.userLogin } ] },
    (err, group) => {
        //console.log(group);
        if (err) { res.status(400).json({ error: 'Произошла ошибка! ' + err}); return; }
        if (!group) {
            res.status(400).json({ error: 'Пользователь не найден!'});
            return;
        }
        const user = group.users.find(user => user.login === req.body.userLogin || user.email === req.body.userLogin);

        // todo - verify cert

        if (false) {
            // create token
            let token = jwt.encode({
                isAuth: true,
                userId: user._id,
                userGroup: group.groupInvite
            }, config.token.secretKey);
            // and send response
            res.status(200).json({ message: 'Вы успешно авторизовались!', token });
        } else {
            res.status(403).json({ error: 'Неверный пароль!'});
        }
    })
}