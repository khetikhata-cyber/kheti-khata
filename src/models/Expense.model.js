const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// const labourDetailsSchema = new mongoose.Schema(
//   {
//     numWorkers: { type: Number, min: 1 },
//     ratePerDay: { type: Number, min: 1 },
//     numDays: { type: Number, min: 0.5 },
//   },
//   { _id: false }
// );

const expenseSchema = new mongoose.Schema(
  {
    expenseId: { type: String, required: true, unique: true, default: () => uuidv4() },
    cropId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, index: true },
    // categoryId: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    // shopId: { type: String, default: null },
    description: { type: String, default: null },
    phase: {
      type: String,
      required: true,
      enum: ['pre_sowing', 'sowing', 'management', 'harvest', 'sale'],
    },
    subCategory: { type: String, default: null },
    date: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, default: 0, min: 0 },
    paidBy: { type: String, enum: ['farmer', 'bataidaar'], required: true },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'pending' },
    // labourDetails: { type: labourDetailsSchema, default: null },
    // receiptUrl: { type: String, default: null },
    // remarks: { type: String, default: null },
    // isOwnedAsset: { type: Boolean, default: false },
    deletedAt: { type: Number, default: null },
    deletedBy: { type: String, default: null },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

expenseSchema.index({ farmerId: 1, cropId: 1 });
expenseSchema.index({ cropId: 1, phase: 1 });
expenseSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30d TTL
expenseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
expenseSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
