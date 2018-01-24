const express = require('express');
const mongoose = require('mongoose');
const Users = mongoose.model('users');

module.exports.signIn = (req, res) => {
    Users.findOne({ login: req.body.userLogin })
        .then(findedUser => {
            // user with login exist
            if (findedUser) {
                // user with valid password
                if (findedUser.validPassword(req.body.userPassword)) {
                    // create cookies
                    req.session.isAuth = true;
                    req.session.userId = findedUser._id;
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
        })
        .catch(err => res.status(400).json({
            message: `При поиске пользователя произошла ошибка:  + ${err.message}`
        }));
}
module.exports.registration = (req, res) => {
    Users.findOne({ login: req.body.userLogin })
        .then(findedUser => {
            if (findedUser) {
                res.status(400).json({ error: 'Пользователь с таким логином существует!' });
            } else {
                const newUser = new Users({
                    login: req.body.userLogin,
                    author: req.body.userName,
                    role: req.body.userRole,
                    token: req.body.userInvite
                });
                newUser.setPassword(req.body.userPassword[0]);
                newUser.save()
                .then(() => 
                    res.status(200).send({ message: 'Вы успешно зарегистрировались!'}))
                .catch(err => res.status(400).json({
                    error: `При добавлении пользователя произошла ошибка:  + ${err.message}`
                }));
            }
        })
        .catch(err => res.status(400).json({
            error: `При регистрации пользователя произошла ошибка:  + ${err.message}`
        }));
};

module.exports.logout = (req, res) => {
    req.session.destroy();
    res.send('/');
};