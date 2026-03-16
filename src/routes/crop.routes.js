const express = require('express');
const router = express.Router();
const cropController = require('../controllers/crop.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createCropSchema, updateCropSchema } = require('../validations/crop.validation');

router.use(protect);

// Crops by field
router.get('/field/:fieldId',                     cropController.getCropsByField);

// Single crop CRUD
router.post('/',   validate(createCropSchema),    cropController.createCrop);
router.get('/:cropId',                            cropController.getCrop);
router.patch('/:cropId', validate(updateCropSchema), cropController.updateCrop);
router.delete('/:cropId',                         cropController.deleteCrop);
router.patch('/:cropId/restore',                  cropController.restoreCrop);

// Crop photo diary
router.post('/:cropId/photos',                    cropController.addPhoto);
router.delete('/:cropId/photos',                  cropController.deletePhoto);

module.exports = router;
