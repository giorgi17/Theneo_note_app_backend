const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const Note = require('../models/note');
const User = require('../models/user');

exports.createNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, invalid data was entered!');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
        logger.error(`createNote error - ${error}`);
        return error;
    }

    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.category;
    const isPrivate = req.body.isPrivate;
    const assignedTo = req.body.assignedTo;
    const creator = req.userId;

    const note = new Note({
        title,
        description,
        category,
        isPrivate,
        assignedTo,
        creator,
    });

    try {
        await note.save();
        const user = await User.findById(req.userId);
        user.notes.push(note);
        const savedUser = await user.save();

        logger.info(`Note created - ${note._id}`);
        res.status(201).json({
            message: 'Note created successfully!',
            note,
            creator: { _id: user._id, username: user.username },
        });

        return savedUser;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`createNote error - ${err}`);
        next(err);
        return err;
    }
};

exports.getNotes = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, invalid data was entered!');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
        logger.error(`getNotes error - ${error}`);
        return error;
    }

    const currentPage = parseInt(req.body.page) || 1;
    const perPage = parseInt(req.body.perPage) || 5;
    const sortType = req.body.sort.name;
    const sortOrder = req.body.sort.order;

    try {
        let notes = await Note.aggregate([
            {
                $match: {
                    $or: [
                        {
                            creator:
                                mongoose.Types.ObjectId.createFromHexString(
                                    req.userId
                                ),
                        },
                        { isPrivate: false },
                    ],
                },
            },
            {
                $addFields: {
                    isCreator: {
                        $eq: [
                            '$creator',
                            mongoose.Types.ObjectId.createFromHexString(
                                req.userId
                            ),
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creator',
                    foreignField: '_id',
                    as: 'creator',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedTo',
                },
            },
            {
                $sort: { [sortType]: sortOrder },
            },
        ]);

        const totalItems = notes.length;
        const hasNext = totalItems - currentPage * perPage > 0;

        const startIndex = (currentPage - 1) * perPage;
        const slicedData = notes.slice(startIndex, startIndex + perPage);

        logger.info(`Fetched notes - totalItems: ${totalItems}`);

        res.status(200).json({
            message: 'Fetched notes successfully.',
            notes: slicedData,
            totalItems,
            currentPage,
            hasNext,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`getNotes error - ${err}`);
        next(err);
        return err;
    }
};

exports.getNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, invalid data was entered!');
        error.statusCode = 422;
        logger.error(`updateNote error - ${errors}`);
        next(error);
        return error;
    }

    const noteId = req.params.noteId;

    try {
        const note = await Note.findById(noteId)
            .populate('category')
            .populate('assignedTo');

        if (!note) {
            const error = new Error('Cound not find note.');
            error.statusCode = 404;
            throw error;
        }

        logger.info(`Fetched note - totalItems: ${note._id}`);
        res.status(200).json({ message: 'Note fetched.', note });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`getNote error - ${err}`);
        next(err);
        return err;
    }
};

exports.updateNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, invalid data was entered!');
        error.statusCode = 422;
        logger.error(`updateNote error - ${errors}`);
        next(error);
        return error;
    }

    const noteId = req.params.noteId;
    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.category;
    const isPrivate = req.body.isPrivate;
    const assignedTo = req.body.assignedTo;

    try {
        const note = await Note.findById(noteId);
        if (!note) {
            const error = new Error('Cound not find note.');
            error.statusCode = 404;
            throw error;
        }

        if (note.creator.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }

        note.title = title;
        note.description = description;
        note.category = category;
        note.isPrivate = isPrivate;
        note.assignedTo = assignedTo;

        const savedNote = await note.save();

        logger.info(`Note updated - ${note._id}`);
        res.status(200).json({ message: 'Note updated!', savedNote });
        return { savedNote };
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`updateNote error - ${err}`);
        next(err);
        return err;
    }
};

exports.deleteNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, invalid data was entered!');
        error.statusCode = 422;
        logger.error(`updateNote error - ${errors}`);
        next(error);
        return error;
    }

    const noteId = req.params.noteId;

    try {
        const note = await Note.findById(noteId);
        if (!note) {
            const error = new Error('Cound not find note.');
            error.statusCode = 404;
            throw error;
        }
        if (note.creator.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }

        await Note.findByIdAndDelete(noteId);
        const user = await User.findById(req.userId);
        user.notes.pull(noteId);
        await user.save();

        logger.info(`Deleted note - ${noteId}`);
        res.status(200).json({ message: 'Deleted note.' });
        return user;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`deleteNote error - ${err}`);
        next(err);
        return err;
    }
};

exports.searchNotes = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, invalid data was entered!');
        error.statusCode = 422;
        error.data = errors.array();
        logger.error(`searchNotes error - ${error}`);
        next(error);
        return error;
    }

    const searchText = req.body.searchText || '';
    const currentPage = parseInt(req.body.page) || 1;
    const perPage = parseInt(req.body.perPage) || 5;

    const searchTextRegExp = new RegExp(searchText, 'i');

    // Filter values
    const createdAtFilter = req.body?.filters?.createdAt;
    const updatedAtFilter = req.body?.filters?.updatedAt;
    const categoryFilter = req.body?.filters?.categories;
    const creatorsFilter = req.body?.filters?.creators;

    let matchConditions = [
        {
            $or: [
                { title: { $regex: searchTextRegExp } },
                { description: { $regex: searchTextRegExp } },
            ],
        },
        {
            $or: [
                {
                    creator: mongoose.Types.ObjectId.createFromHexString(
                        req.userId
                    ),
                },
                { isPrivate: false },
            ],
        },
    ];

    // Conditional filter values
    if (createdAtFilter) {
        matchConditions.push({
            createdAt: {
                $gte: new Date(createdAtFilter.from),
                $lte: new Date(createdAtFilter.to),
            },
        });
    }

    if (updatedAtFilter) {
        matchConditions.push({
            updatedAt: {
                $gte: new Date(updatedAtFilter.from),
                $lte: new Date(updatedAtFilter.to),
            },
        });
    }

    if (categoryFilter) {
        matchConditions.push({
            category: {
                $in: categoryFilter.map(item =>
                    mongoose.Types.ObjectId.createFromHexString(item)
                ),
            },
        });
    }

    if (creatorsFilter) {
        if (!creatorsFilter.selectAll) {
            matchConditions.push({
                creator: {
                    $in: creatorsFilter.selected.map(item =>
                        mongoose.Types.ObjectId.createFromHexString(item)
                    ),
                },
            });
        }
    } else {
        matchConditions.push({
            creator: mongoose.Types.ObjectId.createFromHexString(req.userId),
        });
    }

    try {
        let notes = await Note.aggregate([
            {
                $match: {
                    $and: matchConditions,
                },
            },
            {
                $addFields: {
                    isCreator: {
                        $eq: [
                            '$creator',
                            mongoose.Types.ObjectId.createFromHexString(
                                req.userId
                            ),
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creator',
                    foreignField: '_id',
                    as: 'creator',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedTo',
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: (currentPage - 1) * perPage,
            },
            {
                $limit: perPage,
            },
        ]);

        // Fetching users data with property indicating wether this user's one of the notes met the filter criteria or not with new property - "matchedFilter"
        let usersWithMatchedFilter;
        if (creatorsFilter?.selectAll) {
            usersWithMatchedFilter = await User.aggregate([
                {
                    $lookup: {
                        from: 'notes',
                        let: { userId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$creator', '$$userId'] },
                                    $and: matchConditions,
                                },
                            },
                        ],
                        as: 'notes',
                    },
                },
                {
                    $addFields: {
                        matchedFilter: {
                            $cond: {
                                if: { $gt: [{ $size: '$notes' }, 0] },
                                then: true,
                                else: false,
                            },
                        },
                    },
                },
            ]);
        }

        const totalItems = notes.length;
        const hasNext = totalItems - currentPage * perPage > 0;

        logger.info(`Fetched searched notes - totalItems: ${totalItems}`);
        res.status(200).json({
            message: 'Fetched notes successfully.',
            notes,
            totalItems,
            currentPage,
            hasNext,
            ...(usersWithMatchedFilter && { usersWithMatchedFilter }),
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`searchNotes error - ${err}`);
        next(err);
        return err;
    }
};

exports.assignToUser = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('AssignToUser failed.');
        error.statusCode = 422;
        error.data = errors.array();
        logger.error(`AssignToUser error - ${error}`);
        next(error);
        return error;
    }

    const assignToId = req.body.assignToId;
    const noteId = req.body.noteId;

    try {
        const user = await User.findById(assignToId);

        if (!user) {
            const error = new Error('A user could not be found.');
            error.statusCode = 401;
            throw error;
        }

        const note = await Note.findById(noteId);

        if (!note) {
            const error = new Error('A note could not be found.');
            error.statusCode = 401;
            throw error;
        }

        const alreadyAssigned = note.assignedTo.includes(assignToId);

        if (alreadyAssigned) {
            note.assignedTo.pull(user);
        } else {
            note.assignedTo.push(user);
        }

        const savedNote = await note.save();

        logger.info(
            `${
                alreadyAssigned
                    ? 'Removed assignment for this user'
                    : 'Assigned'
            } ${savedNote._id} to user ${user._id}`
        );
        res.status(201).json({
            message: `${
                alreadyAssigned
                    ? 'Removed assignment for this user'
                    : 'Assigned'
            }`,
            savedNote,
            user,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`AssignToUser error - ${err}`);
        next(err);
        return err;
    }
};

exports.toggleNotePrivate = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, invalid data was entered!');
        error.statusCode = 422;
        error.data = errors.array();
        logger.error(`toggleNotePrivate error - ${error}`);
        next(error);
        return error;
    }

    const noteId = req.body.noteId;

    try {
        const note = await Note.findById(noteId);

        if (!note) {
            const error = new Error('Cound not find note.');
            error.statusCode = 404;
            throw error;
        }

        if (note.creator.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }

        note.isPrivate = !note.isPrivate;
        const savedNode = await note.save();

        logger.info(`Toggled note privacy - ${noteId}`);
        res.status(200).json({ message: 'Toggled note privacy.' });
        return savedNode;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        logger.error(`toggleNotePrivate error - ${err}`);
        next(err);
        return err;
    }
};
