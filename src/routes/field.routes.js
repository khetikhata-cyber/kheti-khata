const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/field.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createFieldSchema, updateFieldSchema } = require('../validations/field.validation');

// All field routes are protected
router.use(protect);

router.get('/',                       fieldController.getAllFields);
router.post('/',   validate(createFieldSchema), fieldController.createField);
router.get('/:fieldId',               fieldController.getField);
router.patch('/:fieldId', validate(updateFieldSchema), fieldController.updateField);
router.delete('/:fieldId',            fieldController.deleteField);
router.patch('/:fieldId/restore',     fieldController.restoreField);

module.exports = router;
