const express = require('express');
const router = express.Router();
const bataidaarController = require('../controllers/bataidaar.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createBataidaarSchema, updateBataidaarSchema } = require('../validations/bataidaar.validation');

router.use(protect);

// Get bataidaar for a specific crop
router.get('/crop/:cropId',                                   bataidaarController.getBataidaarByCrop);

// Create, update, delete
router.post('/', validate(createBataidaarSchema),             bataidaarController.createBataidaar);
router.patch('/:bataidaarId', validate(updateBataidaarSchema),bataidaarController.updateBataidaar);
router.delete('/:bataidaarId',                                bataidaarController.deleteBataidaar);
router.patch('/:bataidaarId/restore',                         bataidaarController.restoreBataidaar);

module.exports = router;
