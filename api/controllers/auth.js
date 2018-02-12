const express = require('express');
const mongoose = require('mongoose');
const Groups = mongoose.model('groups');
const cryptoPass = require('../../lib/cryptoPass');
const jwt = require('jwt-simple');
const config = require('../../config');

module.exports.signIn = (req, res) => {
    console.log('reqbody: ', req.body);
    Groups.findOne({ users: { $elemMatch: { login: req.body.userLogin }}}, (err, group) => {
        //console.log(group);
            if (err) { res.status(400).json({ error: 'Произошла ошибка! ' + err}); return; }
            if (!group) {
                res.status(400).json({ error: 'Пользователь не найден!'});
                return;
            }
            const user = group.users.find(user => user.login === req.body.userLogin);
            console.log(user);
            if (err) res.status(400).json({ error: 'Произошла ошибка! ' + err});
            if (!user || !user.hash) {
                res.status(400).json({ error: 'Пользователь не найден!'});
                return;
            }
            if (cryptoPass.validPassword(user.hash, user.salt, req.body.userPassword)) {
                // create token
                let token = jwt.encode({
                    isAuth: true,
                    userId: user._id,
                    userGroup: group.groupInvite
                }, config.token.secretKey);
                // and send response
                res.status(200).json({ message: 'Вы успешно авторизовались!', token });
            } else {
                res.status(400).json({ error: 'Неверный пароль!'});
            }
    })
}

module.exports.registration = (req, res) => {
    
    Groups.findOne({ groupInvite: req.body.groupInvite, }, (err, doc) => {
        console.log(doc);
        if (doc) {
            doc.users.map(user => {
                if (user.login === req.body.userLogin && user.token === req.body.userInvite ) {
                    const crypto = cryptoPass.setPassword(req.body.userPassword[0]);
                    user.author = req.body.userName;
                    user.salt = crypto.salt
                    user.hash = crypto.hash;
                    console.log(user);
                }
                else return user;
            });
            console.log('Group: ', doc);
            doc.save()
                .then(response => res.status(200).json({ message: 'Вы успешно зарегистрировались!' }))
                .catch(err => res.status(400).json({
                    error: `При регистрации пользователя произошла ошибка:  + ${err.message}`
                }));
            
        } else {
            res.status(400).json({
                error: `Неверные инвайты!`
            })
        }
    })
    .catch(err => res.status(400).json({
        message: `При регистрации пользователя произошла ошибка (пользователя не существует):  + ${err.message}`
    }));;
}

module.exports.logout = (req, res) => {
    res.send('/');
};