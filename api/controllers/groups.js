const mongoose = require("mongoose");
const Groups = mongoose.model("groups");
const jwt = require('jwt-simple');
const config = require('../../config');

module.exports.getAllUsers = (req, res) => {

  let token = jwt.decode(req.headers['token'], config.token.secretKey);
  Groups.findOne({ users: { $elemMatch: { _id: token.userId }}})
    .select('users')
    .exec((err, usersObj) => {
      
      if (err) { res.status(400).json({ error: 'Произошла ошибка: ' + err}); return; }
      if(!usersObj) { res.status(400).json({ error: 'Такой группы нет!' }); return; }
      let users = [];
      usersObj.users.map(user => {
        if (user.role !== 'Admin') {
          const showUser = {
            _id: user._id,
            role: user.role,
            login: user.login,
            author: user.author,
            token: user.token,
            
          };
          users.push(showUser);
        }
      });

      res.status(201).json(users);
    });
};

module.exports.getCurrentUser = (req, res) => {

  let token = jwt.decode(req.headers['token'], config.token.secretKey);
  console.log(token.userId);
  Groups.findOne({ users: { $elemMatch: { _id: token.userId }}}, (err, doc) => {
    if (err) res.status(400).json({ error: 'Произошла ошибка: ' + err});
    if (!doc) {
      res.status(400).json({ error: 'Произошла ошибка - пользователь не найден' });
      return;
    }
    const user = doc.users.find(user => user._id == token.userId);
    const showUser = {
      _id: user._id,
      role: user.role,
      login: user.login,
      author: user.author,
      token: user.token,
      groupInvite: doc.groupInvite,
    };
    console.log(showUser);
    res.status(201).json(showUser)
  });
};

module.exports.getAllGroups = (req, res) => {
  Groups
    .find({}, { 'users.hash': 0, 'users.salt': 0 })
    .then(groups => res.status(201).json(groups))
    .catch(e => console.error(e));
};

module.exports.getGroupByToken = (req, res) => {
  Groups
    .find({ groupInvite: req.params.token },{ 'users.hash': 0, 'users.salt': 0 } )
    .then(groups => res.status(201).json(groups))
    .catch(e => console.error(e));
}

module.exports.createGroup = (req, res) => {
  const newGroupBody = {
    name: req.body.name,
    groupInvite: req.body.invite,
    users: [{
      author: '',
      role: 'Admin',
      token: req.body.adminInvite,
      login: req.body.adminLogin }]
  };
  const newGroup = new Groups(newGroupBody);
  console.log(newGroup);
  newGroup
    .save()
    .then(() => res.status(201).json({ message: "Группа успешно создана" }))
    .catch(e => {
      console.log(e.message);
      res.status(400).json({
        message: `При создании группы произошла ошибка:  + ${e.message}`
      })
    });
};

module.exports.createUser = (req, res) => {
  console.log(req.body);
  Groups
    .findById(req.body.group)
    .then(group => {
      group.users.push({ token: req.body.invite, role: req.body.role, login: req.body.login });
      group
        .save()
        .then(() =>
          res.status(201).json({ message: "Пользователь успешно создан" })
        )
        .catch(e =>
          res.status(400).json({
            message: `При создании пользователя произошла ошибка:  + ${
              e.message
            }`
          })
        );
    })
    .catch(e =>
      res.status(400).json({
        message: `При создании пользователя произошла ошибка (группа не найдена):  + ${
          e.message
        }`
      })
    );
};
