const express = require('express');
const router = express.Router();
const trashController = require('../controllers/trash.controller');
const { protect } = require('../middlewares/auth');

router.use(protect);

// GET  /trash          — view all deleted items grouped by type
// PATCH /trash/restore — restore any item { type: 'expense', id: 'uuid' }
router.get('/',         trashController.getAllTrash);
router.patch('/restore', trashController.restoreItem);

module.exports = router;
