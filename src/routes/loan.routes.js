const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createLoanSchema, updateLoanSchema } = require('../validations/loan.validation');

router.use(protect);

// GET /loans?status=active|overdue|closed
router.get('/',                                            loanController.getAllLoans);
router.post('/',    validate(createLoanSchema),            loanController.createLoan);
router.get('/:loanId',                                     loanController.getLoan);
router.patch('/:loanId', validate(updateLoanSchema),       loanController.updateLoan);
router.delete('/:loanId',                                  loanController.deleteLoan);
router.patch('/:loanId/restore',                           loanController.restoreLoan);

module.exports = router;
