const express = require('express');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const session = require('express-session');
const MongoSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const csrf = require('csurf');
const path = require('path');
const flash = require('connect-flash');

const {MONGO_URI, SESSION_SECRET} = require('./keys/configuration');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorMiddleware = require('./middleware/error');
const fileMiddleware = require('./middleware/file');
const User = require('./models/user');

const app = express();

//settings
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers')
});

const store = MongoSession({
    collection: 'session',
    uri: MONGO_URI
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

// app.use(async (req, res, next) => {
//     try {
//         const user = await User.findById('5f04ac2ff931797130e6ac18');
//         req.user = user;
//         next();
//     } catch (e) {
//         console.log(e);
//     }
// });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store
}));
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);


// routes
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const addRoutes = require('./routes/add');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const currencyRoutes = require('./routes/currency');

app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/currency', currencyRoutes);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

async function start () {
    try {
        const url = MONGO_URI;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
        // const candidate = await User.findOne();
        // if (!candidate) {
        //     const user = new User({
        //         email: 'vanos@gmail.com',
        //         name: 'Vanos',
        //         cart: {items: []}
        //     });
        //     await user.save();
        // }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        console.error(e);
    }
}

start();