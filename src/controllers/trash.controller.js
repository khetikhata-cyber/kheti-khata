const trashService = require('../services/trash.service');
const asyncHandler = require('../utils/asyncHandler');
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

// PATCH /trash/restore — restore any single item by modalType + id
const restoreItem = asyncHandler(async (req, res) => {
  console.log('3======>');
  const { type, id } = req.body;
  const farmerId = req.farmer.farmerId;
  const result = await trashService.restoreTrashItem({ type, id, farmerId });

  return sendSuccess(res, {
    message: `${result.modalName} restored successfully`,
    data: result,
  });
});

module.exports = { getAllTrash, restoreItem };
