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
module.exports.registration = (req, res) => {
    // 
    Groups.findOne({ groupInvite: req.body.groupInvite })
        .then(findedGroup => {
            if (!findedGroup) {
                res.status(400).json({ error: 'Такой группы не существует!' });
            } else {
                console.log(req.body.userLogin, req.body.userInvite)
                Groups.find({ $and: [{"users.login": req.body.userLogin}, {"users.token": req.body.userInvite }] },{ users: 1 })
                    .then(findedUser => {
                        console.log(findedUser);
                        if (!findedUser.length) {
                            res.status(400).send({ message: 'такого пользователя не существует!'});
                        } else {
                            findedUser[0].author = req.body.userName,
                            findedUser[0].setPassword(req.body.userPassword[0]);
                            findedUser[0].save()
                            .then(() => 
                                res.status(200).send({ message: 'Вы успешно зарегистрировались!'}))
                            .catch(err => res.status(400).json({
                                error: `При добавлении пользователя произошла ошибка:  + ${err.message}`
                            }));
                        }
                    });
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