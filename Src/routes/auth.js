const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

const getUser = (email) => {
    return User.findOne({ email });
};

router.get('/login', authController.getLogin);
router.post(
    '/login',
    body('email', 'Please enter a valid email.').isEmail().normalizeEmail(),
    authController.postLogin
);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post(
    '/signup',
    [
        body('email', 'a valid email')
            .isEmail()
            .custom(async (value) => {
                const user = await getUser(value);
                return user ? Promise.reject('non-existed emails') : true;
            })
            .normalizeEmail(),
        body('password', 'a password with at least 5 characters').isLength({
            min: 5,
        }),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                return Promise.reject('matched passwords');
            }
            return true;
        }),
    ],
    authController.postSignup
);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
