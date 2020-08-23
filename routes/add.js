const {Router} = require('express');
const Course = require('../models/course');
const isAuth = require('../middleware/authChecker');
const {coursesValidator} = require('../utils/validators');
const {validationResult} = require('express-validator');

const router = Router();

router.get('/', isAuth, (req, res) => {
    res.render('add', {
        title: 'Add page',
        isAdd: true
    });
});

router.post('/', isAuth, coursesValidator, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).render('add', {
            title: 'Add page',
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img,
            }
        })
    }

    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        userId: req.user._id
    });

    try {
        await course.save();
        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;