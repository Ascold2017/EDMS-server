import signIn from './signIn'
import signInAdmin from './signInAdmin'
import createKeys from './createKeys'

module.exports.signIn = signIn
module.exports.signInAdmin = signInAdmin
module.exports.createKeys = createKeys
module.exports.logout = (req, res) => {
    res.send('/');
};