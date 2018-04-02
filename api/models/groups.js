const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const GroupsShema = new Schema({
  name: {
    type: String
  },
  groupInvite: {
    type: String
  },
  users: [
    {
      dateRegistration: {
        type: String,
      },
      author: {
        type: String,
      },
      role: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      publicKey: {
        type: String
      },
      login: String,
      hash: String,
      salt: String
    }
  ]
});

GroupsShema.plugin(uniqueValidator)

mongoose.model('groups', GroupsShema);