const {EMAIL_LOGIN, BASE_URL} = require('../keys/configuration');

module.exports = function (email, token) {
    return {
        to: email,
        from: EMAIL_LOGIN,
        subject: 'Reset password',
        html: `
            <h1>Do you forgot password?</h1>
            <p>If not, ignore that email</p>
            <p>In other case follow the link bellow</p>
            <p><a href="${BASE_URL}/auth/password/${token}">Reset password</a></p>
            <hr />
            <a href="${BASE_URL}">Course shop</a>
        `
    }
};