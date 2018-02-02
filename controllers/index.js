const express = require('express');
const mongoose = require('mongoose');
const Groups = mongoose.model('groups');
const cryptoPass = require('../lib/cryptoPass');

module.exports.signIn = (req, res) => {
    Groups.findOne({ users: { $elemMatch: { login: req.body.userLogin }}})
        .select('users')
        .exec((err, usersObj) => {
            console.log(usersObj);
            if (err) res.status(400).json({ error: 'Произошла ошибка! ' + err});
            if (!usersObj) {
                res.status(400).json({ error: 'Пользователь не найден!'});
                return;
            }
            const user = usersObj.users.find(user => user.login === req.body.userLogin);
            if (err) res.status(400).json({ error: 'Произошла ошибка! ' + err});
            if (!user || !user.hash) {
                res.status(400).json({ error: 'Пользователь не найден!'});
                return;
            }
            if (cryptoPass.validPassword(user.hash, user.salt, req.body.userPassword)) {
                // create cookies
                req.session.isAuth = true;
                req.session.userId = user._id;
                // and send response
                res.status(200).json({ message: 'Вы успешно авторизовались!' });
            } else {
                res.status(400).json({ error: 'Неверный пароль!'});
            }
        });
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
    req.session.destroy();
    res.send('/');
};