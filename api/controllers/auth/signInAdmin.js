const express = require('express')
const mongoose = require('mongoose')
const Groups = mongoose.model('groups')
const cryptoPass = require('../../../lib/cryptoPass')
const jwt = require('jwt-simple')
const config = require('../../../config')

module.exports = (req, res) => {
    Groups.findOne({ $or: [ { 'users.login': req.body.userLogin }, { 'users.email': req.body.userLogin } ] },
    (err, group) => {
        //console.log(group)
        if (err) { res.status(400).json({ error: 'Виникла помилка! ' + err}); return }
        if (!group) {
            res.status(400).json({ error: 'Користувач не знайден!'})
            return
        }
        const user = group.users.find(user => user.login === req.body.userLogin || user.email === req.body.userLogin)

        if (cryptoPass.validPassword(user.hash, user.salt, req.body.userPassword)) {
            // create token
            let token = jwt.encode({
                isAuth: true,
                userId: user._id,
                userGroup: group.groupInvite
            }, config.token.secretKey)
            // and send response
            res.status(200).json({ message: 'Ви успішно авторизувались!', token })
        } else {
            res.status(403).json({ error: 'Невірний пароль!'})
        }
    })
}