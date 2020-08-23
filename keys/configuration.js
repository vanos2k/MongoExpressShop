const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = {
    MONGO_URI: process.env.MONGO_URI,
    SESSION_SECRET: process.env.SESSION_SECRET,
    EMAIL_LOGIN: process.env.EMAIL_LOGIN,
    BASE_URL: process.env.BASE_URL,
    TRANSPORTER: nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_LOGIN,
            pass: process.env.EMAIL_PASS
        }
    })
};

