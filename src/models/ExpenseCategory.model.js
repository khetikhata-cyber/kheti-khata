const mongoose = require('mongoose');

const expenseCategorySchema = new mongoose.Schema(
  {
    categoryId:      { type: String, required: true, unique: true },
    farmerId:        { type: String, default: null },   // null = system default
    name:            { type: String, required: true, trim: true },
    nameHindi:       { type: String, default: null },
    phase:           { type: String, required: true, enum: ['pre_sowing', 'sowing', 'management', 'harvest', 'sale', 'any'] },
    iconKey:         { type: String, default: null },
    hasSubCategory:  { type: Boolean, default: false },
    hasLabourFields: { type: Boolean, default: false },
    isSystem:        { type: Boolean, default: false },
    isActive:        { type: Boolean, default: true },
    createdAt:       { type: Number, default: () => Date.now() },
    updatedAt:       { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

expenseCategorySchema.index({ farmerId: 1, isActive: 1 });
expenseCategorySchema.index({ phase: 1, isSystem: 1 });
expenseCategorySchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('ExpenseCategory', expenseCategorySchema);
