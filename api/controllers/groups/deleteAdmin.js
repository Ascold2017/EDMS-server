const mongoose = require("mongoose");
const Groups = mongoose.model("groups");

module.exports = (req, res) => {
  Groups.findOne({ 'users._id': req.params.adminId })
    .then(group => {
      if (!group.users.find(user => user._id == req.params.adminId)) {
        throw new Error('Такого адміністратора не існує!')
      } 
      group.users = group.users.filter(user => user._id != req.params.adminId)
      return group.save()
    })
    .then(() => {
      res.status(200).json({ message: 'Адміністратор успішно видален!' })
    })
    .catch(e => res.status(400).json({ message: 'При видаленні адміністратора виникла помилка: ' + e.message }))
}