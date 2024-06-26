const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        logger.error(`Signup error - ${error}`);
        next(error);
        return error;
    }

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const hashedPw = await bcrypt.hash(password, 12);

        const user = new User({
            firstname,
            lastname,
            username,
            email,
            password: hashedPw,
        });
        await user.save();

        logger.info(`User - ${user._id} was created.`);
        res.status(201).json({ message: 'User created!', userId: user._id });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`Signup error - ${err}`);
        next(err);
        return err;
    }
};

exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        logger.error(`Login error - ${error}`);
        next(error);
        return error;
    }

    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error(
                'A user with this email could not be found.'
            );
            error.statusCode = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString(),
            },
            'theneoappsecret123',
            {
                expiresIn: '1h',
            }
        );

        logger.info(`User - ${user._id.toString()} logged in.`);
        res.status(200).json({ token, userId: user._id.toString() });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`Login error - ${err}`);
        next(err);
        return err;
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ username: 1 });

        logger.info(`Fetched users`);
        res.status(200).json({
            message: 'Fetched users successfully.',
            users,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`getUsers error - ${err}`);
        next(err);
        return err;
    }
};
