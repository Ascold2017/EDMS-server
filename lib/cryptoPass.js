const crypto = require('crypto');

module.exports.setPassword = function (password) {
    const salt = crypto
        .randomBytes(16)
        .toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, 1000, 512, 'sha512')
        .toString('hex');
    return { hash, salt };
};

module.exports.validPassword = function (incomingHash, incomingSalt, password) {
    let hash = crypto
        .pbkdf2Sync(password, incomingSalt, 1000, 512, 'sha512')
        .toString('hex');
    return incomingHash === hash;
};