import signIn from './signIn'
import signInAdmin from './signInAdmin'

module.exports.signIn = signIn
module.exports.signInAdmin = signInAdmin
module.exports.logout = (req, res) => {
    res.send('/');
};