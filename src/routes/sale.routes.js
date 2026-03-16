const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createSaleSchema, updateSaleSchema } = require('../validations/sale.validation');

router.use(protect);

router.get('/production/:productionId',        saleController.getSalesByProduction);
router.get('/crop/:cropId',                    saleController.getSalesByCrop);
router.post('/', validate(createSaleSchema),   saleController.createSale);
router.patch('/:saleId', validate(updateSaleSchema), saleController.updateSale);
router.delete('/:saleId',                      saleController.deleteSale);
router.patch('/:saleId/restore',               saleController.restoreSale);

module.exports = router;
