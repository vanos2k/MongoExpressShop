const {Router} = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user');
const {validationResult} = require('express-validator');
const {TRANSPORTER} = require('../keys/configuration');
const reqEmail = require('../email/registration');
const resetEmail = require('../email/reset');
const {registerValidator} = require('../utils/validators');

const router = Router();

router.get('/login', (req, res) => {
   res.render('auth/login', {
       title: 'Login page',
       isLogin: true,
       loginError: req.flash('loginError'),
       registerError: req.flash('registerError')
   });
});

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if (user) {
            if (await bcrypt.compare(password, user.password)) {
                req.session.user = user;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) {
                        throw err;
                    }
                    res.redirect('/courses');
                });
            } else {
                req.flash('loginError', 'Wrong password');
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', `Email doesn't exists`);
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }
});

router.get('/logout', (req, res) => {
   req.session.destroy(() => {
       res.redirect('/auth/login#login');
   });
});

router.post('/register', registerValidator, async (req, res) => {
    try {
        const {email, name, password} = req.body;

        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name, email, password: hashedPassword, cart: {items: []}
        });

        await user.save();
        res.redirect('/auth/login#login');
        await TRANSPORTER.sendMail(reqEmail(email));
    } catch (e) {
        console.log(e);
    }
});

router.get('/reset', (req ,res) => {
   res.render('auth/reset', {
       title: 'Reset password page',
       error: req.flash('error')
   })
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Something goes wrong, try again later');
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');

            const user = await User.findOne({email: req.body.email});
            if (user) {
                user.resetToken = token;
                user.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await user.save();
                TRANSPORTER.sendMail(resetEmail(user.email, token));
                res.redirect('/auth/login')
            } else {
                req.flash('error', "This email doesn't exist");
                res.redirect('/auth/reset');
            }
        })
    } catch (e) {
        console.log(e);
    }
});

router.get('/password/:token', async (req ,res) => {
    const token = req.params.token;

    if (!token) {
        res.redirect('/auth/login');
    }

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExp: {$gt: Date.now()}
        });
        console.log(user);
        if(!user) {
            res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
                title: 'Reset password page',
                error: req.flash('error'),
                userId: user._id.toString(),
                token
            });
        }
    } catch (e) {
        console.log(e);
    }
});

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login');
        } else {
            req.flash('loginError', 'Token expired');
            res.redirect('/auth/login');
        }
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;