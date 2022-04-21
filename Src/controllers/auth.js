const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const User = require('../models/user');

sgMail.setApiKey('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');

exports.getLogin = async (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: req.flash('error')[0],
        enteredEmail: '',
        validationErrors: [],
    });
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            enteredEmail: email,
            validationErrors: errors.array(),
        });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }
        if (await bcrypt.compare(password, user.password)) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            await req.session.save(); // interact with sessions might take time, save() to make sure everything is done before calling redirect
            res.redirect('/'); // beside that reason, save() is not needed, all session information is written to database without calling save()
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postLogout = async (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: req.flash('error')[0],
        enteredEmail: '',
        validationErrors: [],
    });
};

exports.postSignup = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req); // an item in array contains all informations about the error (field, msg, ...)
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage:
                'Please enter ' +
                errors
                    .array()
                    .map((e) => e.msg)
                    .join(', ') +
                '.',
            enteredEmail: email,
            validationErrors: errors.array(),
        });
    }
    try {
        const user = new User({
            email,
            password: await bcrypt.hash(password, 12),
            cart: { items: [] },
        });
        await user.save();
        sgMail.send({
            to: email,
            from: 'tanpham1104@gmail.com',
            subject: 'Welcome On Board',
            html: "<h1>Welcome to My Shop. It's great to have you on board!</h1>",
        });
        res.redirect('/login');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error')[0],
    });
};

exports.postReset = (req, res, next) => {
    const { email } = req.body;
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        try {
            const user = await User.findOne({ email });
            if (!user) {
                req.flash('error', 'Email Not Valid');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            await user.save();
            res.redirect('/');
            sgMail.send({
                to: email,
                from: 'tanpham1104@gmail.com',
                subject: 'Password Reset',
                html: `
                    <p>You requested for a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `,
            });
        } catch (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        }
    });
};

exports.getNewPassword = async (req, res, next) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }, // $gt: greater than
        });
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: req.flash('error')[0],
            userId: user._id.toString(),
            token: token,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postNewPassword = async (req, res, next) => {
    const { userId, password, token } = req.body;
    try {
        const user = await User.findOne({
            _id: userId,
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });
        user.password = await bcrypt.hash(password, 12);
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();
        res.redirect('/login');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};
