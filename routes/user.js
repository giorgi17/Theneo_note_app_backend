const express = require('express');

const userController = require('../controllers/user');
const validation = require('../validations/user');

const router = express.Router();

router.post('/signup', validation.signup, userController.signup);

router.post('/login', validation.login, userController.login);

router.get('/getUsers', validation.getUsers, userController.getUsers);

module.exports = router;
