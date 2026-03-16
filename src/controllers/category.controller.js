const categoryService = require('../services/category.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getCategories = asyncHandler(async (req, res) => {
  const { phase } = req.query;
  const categories = await categoryService.getCategoriesForFarmer(req.farmer.farmerId, phase);
  return sendSuccess(res, {
    message: 'Categories fetched',
    data: categories,
    meta: { count: categories.length },
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCustomCategory(req.farmer.farmerId, req.body);
  return sendCreated(res, { message: 'Category created', data: category });
});

const toggleCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.toggleCategoryVisibility(
    req.params.categoryId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Category visibility updated', data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCustomCategory(
    req.params.categoryId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Category deleted', data: result });
});

module.exports = { getCategories, createCategory, toggleCategory, deleteCategory };
