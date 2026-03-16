const express = require('express');
const router = express.Router();
const dealerController = require('../controllers/dealer.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createDealerSchema, updateDealerSchema, markPaymentSchema } = require('../validations/dealer.validation');

router.use(protect);

router.get('/',                                                    dealerController.getAllDealers);
router.post('/',   validate(createDealerSchema),                   dealerController.createDealer);
router.get('/:dealerId',                                           dealerController.getDealer);
router.get('/:dealerId/ledger',                                    dealerController.getDealerLedger);
router.patch('/:dealerId',    validate(updateDealerSchema),        dealerController.updateDealer);
router.post('/:dealerId/payment', validate(markPaymentSchema),     dealerController.markPayment);
router.delete('/:dealerId',                                        dealerController.deleteDealer);

module.exports = router;
