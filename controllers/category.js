const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const Category = require('../models/category');
const Note = require('../models/note');

exports.createCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, invalid data was entered!');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
        logger.error(`createCategory error - ${error}`);
        return error;
    }

    const title = req.body.title;

    const category = new Category({
        title,
    });

    try {
        const createdCategory = await category.save();

        logger.info(`Category created - ${category._id}`);
        res.status(201).json({
            message: 'Category created successfully!',
            category,
        });

        return createdCategory;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`Category error - ${err}`);
        next(err);
        return err;
    }
};

exports.getCategories = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, invalid data was entered!');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
        logger.error(`getCategories error - ${error}`);
        return error;
    }

    const currentPage = parseInt(req.body.page) || 1;
    const perPage = parseInt(req.body.perPage) || 5;
    const noPaginate = req.body?.noPaginate;

    try {
        const totalItems = await Category.find().countDocuments();
        const hasNext = totalItems - currentPage * perPage > 0;

        let categories;

        if (noPaginate) {
            categories = await Category.find().sort({ createdAt: -1 });
        } else {
            categories = await Category.find()
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        }

        logger.info(`Fetched categories - totalItems: ${totalItems}`);
        res.status(200).json({
            message: 'Fetched categories successfully.',
            categories,
            totalItems,
            currentPage,
            hasNext,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`getCategories error - ${err}`);
        next(err);
        return err;
    }
};

exports.updateCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(
            `Validation failed, invalid data was entered!, ${errors.errors?.[0]?.msg}`
        );
        error.statusCode = 422;
        logger.error(`updateCategory error - ${errors}`);
        next(error);
        return error;
    }

    const categoryId = req.params.categoryId;
    const title = req.body.title;

    try {
        const category = await Category.findById(categoryId);

        if (!category) {
            const error = new Error('Cound not find category.');
            error.statusCode = 404;
            throw error;
        }

        category.title = title;
        const saveCategory = await category.save();
        logger.info(`Category updated - ${category._id}`);
        res.status(200).json({ message: 'Category updated!', category });
        return saveCategory;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`updateCategory error - ${err}`);
        next(err);
        return err;
    }
};

exports.deleteCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, invalid data was entered!');
        error.statusCode = 422;
        logger.error(`deleteCategory error - ${errors}`);
        next(error);
        return error;
    }

    const categoryId = req.params.categoryId;

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            const error = new Error('Cound not find category.');
            error.statusCode = 404;
            throw error;
        }

        const categoryAssignedToNotes = await Note.find({
            category: categoryId,
        }).countDocuments();

        if (categoryAssignedToNotes) {
            const error = new Error(
                'Cannot delete category that belongs to a Note(s)'
            );
            error.statusCode = 404;
            throw error;
        }

        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        logger.info(`Deleted Category - ${categoryId}`);
        res.status(200).json({ message: 'Deleted Category.' });
        return deletedCategory;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`deleteCategory error - ${err}`);
        next(err);
        return err;
    }
};
