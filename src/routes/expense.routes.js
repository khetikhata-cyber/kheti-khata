const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createExpenseSchema, updateExpenseSchema } = require('../validations/expense.validation');

router.use(protect);

// Trash — fetch all soft-deleted expenses for this farmer
router.get('/trash',                            expenseController.getTrash);

// Expenses by crop
router.get('/crop/:cropId',                     expenseController.getExpenses);
router.post('/',   validate(createExpenseSchema), expenseController.createExpense);
router.patch('/:expenseId', validate(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:expenseId',                    expenseController.deleteExpense);
router.patch('/:expenseId/restore',             expenseController.restoreExpense);

module.exports = router;
