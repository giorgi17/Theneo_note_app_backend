const { body, param } = require('express-validator');
const Category = require('../models/category');

exports.createCategory = [
    body('title')
        .trim()
        .notEmpty()
        .custom(async (value, { req }) => {
            const count = await Category.countDocuments({
                title: value,
            });

            if (count) {
                return Promise.reject(`"${value}" already exists!`);
            }
        }),
];

exports.getCategories = [
    body('page').isInt(),
    body('perPage').isInt(),
    body('noPaginate').custom(async (value, { req }) => {
        if (value !== undefined && typeof value !== 'boolean') {
            return Promise.reject('"noPaginate" should be of type boolean.');
        }
    }),
];

exports.updateCategory = [
    param('categoryId').trim().isString().isLength({ min: 24, max: 24 }),
    body('title')
        .trim()
        .notEmpty()
        .custom(async (value, { req }) => {
            const count = await Category.countDocuments({
                title: value,
            });

            if (count) {
                return Promise.reject(`"${value}" already exists!`);
            }
        }),
];

exports.delete = [
    param('categoryId').trim().isString().isLength({ min: 24, max: 24 }),
];
