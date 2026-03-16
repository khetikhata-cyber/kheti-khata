const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlement.controller');
const { protect } = require('../middlewares/auth');

router.use(protect);

// All settlements for yearly summary
router.get('/', settlementController.getAllSettlements);

// Per-crop settlement routes
router.get('/crop/:cropId/preview',   settlementController.previewSettlement);
router.post('/crop/:cropId/finalize', settlementController.finalizeSettlement);
router.get('/crop/:cropId',           settlementController.getSettlement);

module.exports = router;
