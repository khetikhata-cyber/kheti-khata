const express = require('express');
const router = express.Router();
const productionController = require('../controllers/production.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createProductionSchema, updateProductionSchema } = require('../validations/production.validation');

router.use(protect);

router.get('/crop/:cropId',                                        productionController.getProduction);
router.post('/', validate(createProductionSchema),                 productionController.createProduction);
router.patch('/:productionId', validate(updateProductionSchema),   productionController.updateProduction);
router.delete('/:productionId',                                    productionController.deleteProduction);
router.patch('/:productionId/restore',                             productionController.restoreProduction);

module.exports = router;
