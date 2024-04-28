const { body, param } = require('express-validator');

exports.createNote = [
    body('title')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Title should be at least 5 characters.'),
    body('description')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Description should be at least 5 characters.'),
    body('category').trim().notEmpty(),
    body('isPrivate').isBoolean(),
    body('assignedTo').isArray(),
];

exports.getNotes = [
    body('page').isInt(),
    body('perPage').isInt(),
    body('sort').custom(async (value, { req }) => {
        const sortTypes = ['createdAt', 'updatedAt', 'category', 'title'];
        const sortOrders = [1, -1];
        const validName = sortTypes.includes(value.name);
        const validOrder = sortOrders.includes(value.order);

        if (!validName || !validOrder) {
            return Promise.reject('Sort parameters are incorrect.');
        }
    }),
];

exports.getNote = [
    param('noteId').trim().isString().isLength({ min: 24, max: 24 }),
];

exports.updateNote = [
    param('noteId').trim().isString().isLength({ min: 24, max: 24 }),
    body('title')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Title should be at least 5 characters.'),
    body('description')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Description should be at least 5 characters.'),
    body('category').notEmpty(),
    body('isPrivate').isBoolean(),
    body('assignedTo').isArray(),
];

exports.delete = [
    param('noteId').trim().isString().isLength({ min: 24, max: 24 }),
];

exports.searchNote = [
    body('perPage').isInt(),
    body('page').isInt(),
    body('searchText').notEmpty(),
    body('filters').custom(async (value, { req }) => {
        if (value) {
            if (value?.createdAt) {
                const createdAtFrom = new Date(value.createdAt?.from);
                const createdAtTo = new Date(value.createdAt?.to);
                if (isNaN(createdAtFrom) || isNaN(createdAtTo)) {
                    return Promise.reject(
                        'Filter createdAt dates are in incorrect format'
                    );
                }
            }

            if (value?.updatedAt) {
                const updatedAtFrom = new Date(value.updatedAt?.from);
                const updatedAtTo = new Date(value.updatedAt?.to);
                if (isNaN(updatedAtFrom) || isNaN(updatedAtTo)) {
                    return Promise.reject(
                        'Filter - updatedAt dates are in incorrect format'
                    );
                }
            }

            if (value?.categories) {
                if (!Array.isArray(value?.categories)) {
                    return Promise.reject(
                        'Filter - categories are in incorrect format'
                    );
                }
            }

            if (value?.creators) {
                if (!Array.isArray(value?.creators?.selected)) {
                    return Promise.reject(
                        'Filter - creators.selected is in incorrect format'
                    );
                }

                if (typeof value?.creators?.selectAll !== 'boolean') {
                    return Promise.reject(
                        'Filter - creators.selectAll property is in incorrect format'
                    );
                }
            }
        }
    }),
];

exports.assignToUser = [
    body('assignToId').trim().isString().isLength({ min: 24, max: 24 }),
    body('noteId').trim().isString().isLength({ min: 24, max: 24 }),
];

exports.toggleNotePrivate = [
    body('noteId').trim().isString().isLength({ min: 24, max: 24 }),
];
