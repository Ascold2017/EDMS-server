const mongoose = require("mongoose");
const Groups = mongoose.model("groups");

module.exports = (req, res) => {
    Groups.findOne({ 'users._id': req.params.adminId })
        .then(group => {
            console.log(req.params)
            console.log(group)
            if (!group.users.find(user => user._id == req.params.adminId)) {
                throw new Error('Такого администратора не существует!')
            } 
            group.users = group.users.filter(user => user._id != req.params.adminId)
            return group.save()
        })
        .then(() => {
            res.status(200).json({ message: 'Администратор успешно удален!' })
        })
        .catch(e => res.status(400).json({ message: 'При удалени администратора произошла ошибка: ' + e.message }))
}