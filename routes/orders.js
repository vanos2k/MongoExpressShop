const {Router} = require('express');
const Order = require('../models/order');
const isAuth = require('../middleware/authChecker');

const router = Router();

router.get('/', isAuth, async (req, res) => {
    try {
        const orders = await Order.find({'user.userId': req.user._id})
            .populate('user.userId');

        res.render('orders', {
            isOrder: true,
            title: 'Orders',
            orders: orders.map(o => {
                return {
                    ...o._doc,
                    price: o.courses.reduce((total, c) => {
                        return total + c.count * c.course.price;
                    }, 0)
                }
            })
        });
    } catch (e) {
        console.log(e);
    }

});

router.post('/', isAuth, async (req, res) => {
    try {
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();

        console.log(user.cart.items[0].courseId);

        const courses = user.cart.items.map(c => ({
            count: c.count,
            course: c.courseId._doc
        }));

        const order = new Order({
            user: {
                name: user.name,
                userId: user._id
            },
            courses: courses
        });

        await order.save();
        await req.user.clearCart();

        res.redirect('/orders');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;