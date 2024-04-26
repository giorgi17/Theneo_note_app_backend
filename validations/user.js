const { body } = require('express-validator');

const User = require('../models/user');

exports.signup = [
    body('firstname')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Firstname should be at least 2 characters.'),
    body('lastname')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Lastname should be at least 2 characters.'),
    body('username')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Username should be at least 5 characters.'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom(async (value, { req }) => {
            const foundUser = await User.findOne({ email: value });
            if (foundUser) {
                return Promise.reject('E-Mail address already exist!');
            }
        })
        .normalizeEmail(),
    body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters.'
    )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        })
        .trim(),
];

exports.login = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
];
