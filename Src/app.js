const mysql2mongo = require('./lib/mysql2mongo');

const express = require('express');
const multer = require('multer');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const MongoDbStore = require('connect-mongodb-session')(session);
const { v4: uuidv4 } = require('uuid');

const path = require('path');
const MONGODB_URI =
    'mongodb+srv://tan:a@cluster0.b8khd.mongodb.net/tiki?retryWrites=true&w=majority';
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const app = express();
const csrfProtection = csrf();

function NewMongoDbStore() {
	return new MongoDbStore({
		uri: MONGODB_URI,
		collection: 'sessions',
	});
};

const store = null;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + '.' + file.mimetype.split('/')[1]);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage, fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public'))); // this turns public into a static global folder (not includes /public when called)
app.use('/images', express.static(path.join(__dirname, 'images'))); // this turns images into a static global folder (includes /images when called)
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));
app.use(csrfProtection);
app.use(flash());
// every views that are rendered will have these variables
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use(async (req, res, next) => {
    try {
        if (req.session.user) {
            var user = null;
            //user = await User.findById(req.session.user._id);
            user = {
				_id: 1,
				name: "johndoe",
				email: "johndoe@mailer.ru"
			};
            if (user) {
                req.user = user;
            }
        }
        return next();
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get500);
app.use(errorController.get404); // this catches all unexpected URL

// this (middleware with 4 parameters) will be called when next(error) is called or an error is catched
app.use((error, req, res, next) => {
    console.log('WATCH ME');
    console.log(error);
    res.status(500).render('500', {
        pageTitle: '500',
        path: '/500',
    });
});

function InitMongoose() {
	mongoose
		.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		})
		.then(() => {
			app.listen(3000);
		})
		.catch((err) => {
			console.log(err);
		});
};

mysql2mongo.setup('localhost', 'caohoc_advdb', 'caohoc_advdb', '1');

app.listen(8001);

