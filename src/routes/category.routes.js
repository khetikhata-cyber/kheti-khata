const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createCategorySchema } = require('../validations/category.validation');

router.use(protect);

// GET /categories?phase=management
router.get('/',                                          categoryController.getCategories);
router.post('/', validate(createCategorySchema),         categoryController.createCategory);
router.patch('/:categoryId/toggle',                      categoryController.toggleCategory);
router.delete('/:categoryId',                            categoryController.deleteCategory);

module.exports = router;
