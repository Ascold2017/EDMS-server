const express = require('express');
const mongoose = require('mongoose');
const Groups = mongoose.model('groups');

module.exports.signIn = (req, res) => {
    Groups.findOne({ users: { $elemMatch: { login: req.body.userLogin }}})
        .then(findedGroup => {
            // user with login exist
            console.log(findedGroup);
            /*
            if (findedGroup.users.length) {
                // user with valid password
                if (findedUser[0].validPassword(req.body.userPassword)) {
                    // create cookies
                    req.session.isAuth = true;
                    req.session.userId = findedUser[0]._id;
                    // and send response
                    res.status(200).json({ message: 'Вы успешно авторизовались!' });
                }
                // password invalid
                else {
                    res.status(400).json({ error: 'Неверный пароль!'});
                }
            }
            // user with login not exist
            else {
                res.status(400).json({ error: 'Пользователь не найден!'});
            }
            */
        })
        .catch(err => res.status(400).json({
            message: `При поиске пользователя произошла ошибка:  + ${err.message}`
        }));
}
const cryptoPass = require('../lib/cryptoPass');
module.exports.registration = (req, res) => {
    
    Groups.findOne({ groupInvite: req.body.groupInvite, }, (err, doc) => {
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
                message: `При регистрации пользователя произошла ошибка:  + ${err.message}`
            }));

    })
    .catch(err => res.status(400).json({
        message: `При регистрации пользователя произошла ошибка (пользователя не существует):  + ${err.message}`
    }));;
}

module.exports.logout = (req, res) => {
    req.session.destroy();
    res.send('/');
};