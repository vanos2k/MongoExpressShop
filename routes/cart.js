const {Router} = require('express');
const Course = require('../models/course');
const Discount = require('../models/discount');

const router = Router();
const isAuth = require('../middleware/authChecker');

function mapCartItems (cart) {
    return cart.items.map(c => ({
        ...c.courseId._doc,
        price: c.price,
        id: c.courseId.id,
        count: c.count
    }));
}

function countPrice (courses) {
    return courses.reduce((sum, c) => {
        return sum + c.price * c.count;
    }, 0)
}

router.get('/', isAuth, async (req, res) => {
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate();

    const courses = mapCartItems(user.cart);

    res.render('cart', {
        title: 'cart',
        isCart: true,
        courses: courses,
        price: countPrice(courses)
    });
});

router.delete('/remove/:id', isAuth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);

    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate();
    const courses = mapCartItems(user.cart);
    const cart = {
        courses,
        price: countPrice(courses)
    };

    res.status(200).json(cart);
});

router.post('/add', isAuth, async (req, res) => {
    let course = await Course.findById(req.body.id);
    course = await Discount.discountCounter(course);
    await req.user.addToCart(course);
    res.redirect('/cart');
});

module.exports = router;