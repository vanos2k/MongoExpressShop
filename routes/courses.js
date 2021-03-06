const {Router} = require('express');
const Course = require('../models/course');
const Currency = require('../models/currency');
const Discount = require('../models/discount');
const isAuth = require('../middleware/authChecker');
const {coursesValidator} = require('../utils/validators');
const {validationResult} = require('express-validator');

const router = Router();

function isOwner(course, req) {
    return course.userId.toString() === req.params.id.toString()
}

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('userId', 'email name');
        const updatedCourses = courses.map(async course => {
            return await Discount.discountCounter(course);
        });
        Promise
            .all(updatedCourses)
            .then(courses => {
                res.render('courses', {
                    title: 'Courses',
                    isCourses: true,
                    userId: req.user ? req.user._id.toString() : null,
                    courses
                });
            });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id/edit', isAuth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/courses');
    }

    try {
        const course = await Course.findById(req.params.id);

        if (!isOwner(course, req)) {
            res.redirect('/courses');
        }

        res.render('course-edit', {
            title: `Edit ${course.title}`,
            course: course
        });
    } catch (e) {
        console.log(e);
    }


});

router.post('/edit', isAuth, coursesValidator, async (req, res) => {
    const {id} = req.body;
    delete req.body.id;
    const errors = validationResult();

    if (!errors.isEmpty()) {
        res.status(422).redirect(`/${id}/edit`);
    }


    try {
        const course = await Course.findById(id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }

        Object.assign(course, req.body);
        await course.save();

        res.redirect(`/courses/${id}`);
    } catch (e) {
        console.log(e);
    }

});

router.post('/delete', isAuth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        });
        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const currencyList = await Currency.find();
        const course = await Course.findById(req.params.id);
        // const discount = new Discount({courseId: '5f0c6c213b223938f809383b', percent: 10, type: 2, hourseFrom: '13:00', hourseTo: '20:00'});
        // await discount.save();
        const updatedCourse = await Discount.discountCounter(course);

        res.render('course', {
            title: `Course ${course.title}`,
            course: updatedCourse,
            currencyList
        })
    } catch (e) {
        console.log(e);
        next();
    }
});

module.exports = router;