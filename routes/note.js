const express = require('express');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();
const noteController = require('../controllers/note');
const validation = require('../validations/note');

router.post(
    '/create',
    isAuth,
    validation.createNote,
    noteController.createNote
);

router.post('/getNotes', isAuth, validation.getNotes, noteController.getNotes);

router.get(
    '/getNote/:noteId',
    isAuth,
    validation.getNote,
    noteController.getNote
);

router.patch(
    '/:noteId',
    isAuth,
    validation.updateNote,
    noteController.updateNote
);

router.delete('/:noteId', isAuth, validation.delete, noteController.deleteNote);

router.post(
    '/search',
    isAuth,
    validation.searchNote,
    noteController.searchNotes
);

router.post(
    '/assignToUser',
    isAuth,
    validation.assignToUser,
    noteController.assignToUser
);

router.post(
    '/toggleNotePrivate',
    isAuth,
    validation.toggleNotePrivate,
    noteController.toggleNotePrivate
);

module.exports = router;
