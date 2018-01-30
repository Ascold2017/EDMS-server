const mongoose = require("mongoose");
const groups = mongoose.model("groups");
module.exports.getAllUsers = (req, res) => {
  groups.users
    .find({}, { token: 0, salt: 0, hash: 0 })
    .then(items => res.send(items))
    .catch(e => console.error(e));
};

module.exports.getCurrentUser = (req, res) => {
  console.log("userId", req.session.userId);
  groups.users
    .findById(req.session.userId, { salt: 0, hash: 0 })
    .then(user => res.status(201).json(user))
    .catch(e => console.error(e));
};

module.exports.getAllGroups = (req, res) => {
  groups
    .find()
    .then(groups => res.status(201).json(groups))
    .catch(e => console.error(e));
};

module.exports.getGroupByToken = (req, res) => {
  groups
    .find({ groupInvite: req.params.token })
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
  const newGroup = new groups(newGroupBody);
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
  groups
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
