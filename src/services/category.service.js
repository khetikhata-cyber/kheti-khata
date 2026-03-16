const ExpenseCategory = require('../models/ExpenseCategory.model');
const AppError = require('../utils/AppError');
const { v4: uuidv4 } = require('uuid');

// 15 system default categories from the PRD
const SYSTEM_CATEGORIES = [
  { name: 'Tractor / Machine', nameHindi: 'ट्रैक्टर / मशीन', phase: 'pre_sowing', iconKey: 'tractor',       hasSubCategory: false, hasLabourFields: false },
  { name: 'Labour',            nameHindi: 'मजदूरी',           phase: 'pre_sowing', iconKey: 'labour',        hasSubCategory: false, hasLabourFields: true  },
  { name: 'Seed',              nameHindi: 'बीज',               phase: 'sowing',     iconKey: 'seed',          hasSubCategory: true,  hasLabourFields: false },
  { name: 'Nursery',           nameHindi: 'नर्सरी',            phase: 'sowing',     iconKey: 'nursery',       hasSubCategory: false, hasLabourFields: false },
  { name: 'Irrigation',        nameHindi: 'सिंचाई',            phase: 'management', iconKey: 'irrigation',    hasSubCategory: true,  hasLabourFields: false },
  { name: 'Fertilizer',        nameHindi: 'खाद',               phase: 'management', iconKey: 'fertilizer',    hasSubCategory: true,  hasLabourFields: false },
  { name: 'Micronutrient',     nameHindi: 'सूक्ष्म पोषक',      phase: 'management', iconKey: 'micronutrient', hasSubCategory: false, hasLabourFields: false },
  { name: 'Pesticide',         nameHindi: 'कीटनाशक',           phase: 'management', iconKey: 'pesticide',     hasSubCategory: true,  hasLabourFields: false },
  { name: 'Weedicide',         nameHindi: 'खरपतवार नाशक',      phase: 'management', iconKey: 'weed',          hasSubCategory: false, hasLabourFields: false },
  { name: 'Spray Labour',      nameHindi: 'स्प्रे मजदूरी',     phase: 'management', iconKey: 'spray_labour',  hasSubCategory: false, hasLabourFields: true  },
  { name: 'Harvesting',        nameHindi: 'कटाई',              phase: 'harvest',    iconKey: 'harvesting',    hasSubCategory: true,  hasLabourFields: false },
  { name: 'Transport',         nameHindi: 'ढुलाई',             phase: 'harvest',    iconKey: 'transport',     hasSubCategory: false, hasLabourFields: false },
  { name: 'Mandi Sale',        nameHindi: 'मंडी बिक्री',       phase: 'sale',       iconKey: 'mandi',         hasSubCategory: false, hasLabourFields: false },
  { name: 'Trader Sale',       nameHindi: 'व्यापारी',          phase: 'sale',       iconKey: 'trader',        hasSubCategory: false, hasLabourFields: false },
  { name: 'Other',             nameHindi: 'अन्य',              phase: 'any',        iconKey: 'other',         hasSubCategory: false, hasLabourFields: false },
];

/**
 * Seed system categories — run once on app startup
 */
const seedSystemCategories = async () => {
  const count = await ExpenseCategory.countDocuments({ isSystem: true });
  if (count >= SYSTEM_CATEGORIES.length) return;

  const docs = SYSTEM_CATEGORIES.map((cat) => ({
    categoryId:      uuidv4(),
    farmerId:        null,
    isSystem:        true,
    isActive:        true,
    ...cat,
  }));

  await ExpenseCategory.insertMany(docs, { ordered: false }).catch(() => {});
  console.log('✅ System expense categories seeded');
};

/**
 * Get categories for a farmer — system defaults + their custom ones
 */
const getCategoriesForFarmer = async (farmerId, phase = null) => {
  const query = {
    $or: [{ farmerId: null }, { farmerId }],
    isActive: true,
  };

  if (phase) {
    query.$and = [{ $or: [{ phase }, { phase: 'any' }] }];
  }

  return ExpenseCategory.find(query).sort({ isSystem: -1, createdAt: 1 });
};

/**
 * Create a custom category for a specific farmer
 */
const createCustomCategory = async (farmerId, data) => {
  const category = await ExpenseCategory.create({
    categoryId:      uuidv4(),
    farmerId,
    isSystem:        false,
    isActive:        true,
    ...data,
  });

  return category;
};

/**
 * Toggle visibility (farmer can hide system categories)
 */
const toggleCategoryVisibility = async (categoryId, farmerId) => {
  const category = await ExpenseCategory.findOne({ categoryId });
  if (!category) throw new AppError('Category not found', 404);

  // System categories can only be hidden, not deleted
  if (category.isSystem) {
    const updated = await ExpenseCategory.findOneAndUpdate(
      { categoryId },
      { isActive: !category.isActive },
      { new: true }
    );
    return updated;
  }

  // Custom categories must belong to this farmer
  if (category.farmerId !== farmerId) throw new AppError('Forbidden', 403);

  const updated = await ExpenseCategory.findOneAndUpdate(
    { categoryId },
    { isActive: !category.isActive },
    { new: true }
  );
  return updated;
};

/**
 * Delete custom category (only non-system ones)
 */
const deleteCustomCategory = async (categoryId, farmerId) => {
  const category = await ExpenseCategory.findOne({ categoryId, farmerId });
  if (!category) throw new AppError('Category not found', 404);
  if (category.isSystem) throw new AppError('System categories cannot be deleted', 403);

  await ExpenseCategory.deleteOne({ categoryId });
  return { deleted: true };
};

module.exports = {
  seedSystemCategories,
  getCategoriesForFarmer,
  createCustomCategory,
  toggleCategoryVisibility,
  deleteCustomCategory,
};
