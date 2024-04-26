const { body, query, param } = require('express-validator');
const Category = require('../models/category');

exports.createCategory = [
    body('title')
        .trim()
        .notEmpty()
        .custom(async (value, { req }) => {
            const count = await Category.countDocuments({
                title: { $regex: new RegExp(`^${value}`, 'i') },
            });

            if (count) {
                return Promise.reject(`"${value}" already exists!`);
            }
        }),
];

exports.getCategories = [query('page').isInt(), query('perPage').isInt()];

exports.updateCategory = [
    param('categoryId').trim().isString().isLength({ min: 24, max: 24 }),
    body('title')
        .trim()
        .notEmpty()
        .custom(async (value, { req }) => {
            const count = await Category.countDocuments({
                title: { $regex: new RegExp(`^${value}`, 'i') },
            });

            if (count) {
                return Promise.reject(`"${value}" already exists!`);
            }
        }),
];

exports.delete = [
    param('categoryId').trim().isString().isLength({ min: 24, max: 24 }),
];
