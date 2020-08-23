const {body} = require('express-validator');
const User = require('../models/user');

exports.registerValidator = [
    body('email')
        .isEmail()
        .withMessage('Type in correct email').custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email: value});
                if (user) {
                    return Promise.reject('User with this email already exist');
                }
            } catch (e) {
                console.log(e);
            }
        })
        .normalizeEmail(),
    body('password', 'Password length must be at least 6 characters')
        .isLength({min: 6, max: 60})
        .isAlphanumeric()
        .trim(),
    body('repeat')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords must equal');
            }
            return true;
        })
        .trim(),
    body('name')
        .isLength({min: 2})
        .withMessage('Name length must be at least 6 characters')
        .trim()
];

exports.coursesValidator = [
    body('title').isLength({min:3, max: 50}).withMessage('Min length is 3 symbols').trim(),
    body('price').isNumeric().withMessage('Type in correct price'),
    body('img').isURL().withMessage('Type in correct image url')
];