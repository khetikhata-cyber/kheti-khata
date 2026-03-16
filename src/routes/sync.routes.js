const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');
const { protect } = require('../middlewares/auth');

router.use(protect);

// POST /sync/fields  { records: [...] }
router.post('/fields',      syncController.syncFields);
router.post('/crops',       syncController.syncCrops);
router.post('/expenses',    syncController.syncExpenses);
router.post('/bataidaars',  syncController.syncBataidaars);
router.post('/productions', syncController.syncProductions);
router.post('/sales',       syncController.syncSales);
router.post('/loans',       syncController.syncLoans);
router.post('/dealers',     syncController.syncDealers);

module.exports = router;
