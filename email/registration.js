const {EMAIL_LOGIN, BASE_URL} = require('../keys/configuration');

module.exports = function (email) {
    return {
        to: email,
        from: EMAIL_LOGIN,
        subject: 'Thanks for registration',
        html: `
            <h1>Glad to see you in our shop</h1>
            <p>You're successfully created account with email - ${email}</p>
            <hr />
            <a href="${BASE_URL}">Course shop</a>
        `
    }
};