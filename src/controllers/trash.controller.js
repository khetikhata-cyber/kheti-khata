const trashService   = require('../services/trash.service');
const fieldService   = require('../services/field.service');
const cropService    = require('../services/crop.service');
const expenseService = require('../services/expense.service');
const loanService    = require('../services/loan.service');
const bataidaarService  = require('../services/bataidaar.service');
const productionService = require('../services/production.service');
const saleService       = require('../services/sale.service');
const asyncHandler   = require('../utils/asyncHandler');
const AppError       = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

// GET /trash — all deleted items across all collections
const getAllTrash = asyncHandler(async (req, res) => {
  const trash = await trashService.getAllTrash(req.farmer.farmerId);
  return sendSuccess(res, {
    message: 'Trash fetched',
    data: trash,
    meta: { totalItems: trash.summary.totalItems },
  });
});

// PATCH /trash/restore — restore any single item by type + id
const restoreItem = asyncHandler(async (req, res) => {
  const { type, id } = req.body;
  const farmerId = req.farmer.farmerId;
  let result;

  switch (type) {
    case 'field':      result = await fieldService.restoreField(id, farmerId);           break;
    case 'crop':       result = await cropService.restoreCrop(id, farmerId);             break;
    case 'expense':    result = await expenseService.restoreExpense(id, farmerId);       break;
    case 'loan':       result = await loanService.restoreLoan(id, farmerId);             break;
    case 'bataidaar':  result = await bataidaarService.restoreBataidaar(id, farmerId);   break;
    case 'production': result = await productionService.restoreProduction(id, farmerId); break;
    case 'sale':       result = await saleService.restoreSale(id, farmerId);             break;
    default:
      throw new AppError(`Unknown item type: ${type}`, 400);
  }

  return sendSuccess(res, {
    message: `${type} restored successfully`,
    data: result,
  });
});

module.exports = { getAllTrash, restoreItem };
