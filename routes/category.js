const express = require('express');
const isAuth = require('../middlewares/is-auth');
const router = express.Router();

const categoryController = require('../controllers/category');
const validation = require('../validations/category');

router.post(
    '/create',
    isAuth,
    validation.createCategory,
    categoryController.createCategory
);

router.get(
    '/getCategories',
    isAuth,
    validation.getCategories,
    categoryController.getCategories
);

router.patch(
    '/:categoryId',
    isAuth,
    validation.updateCategory,
    categoryController.updateCategory
);

router.delete(
    '/:categoryId',
    isAuth,
    validation.delete,
    categoryController.deleteCategory
);

module.exports = router;
