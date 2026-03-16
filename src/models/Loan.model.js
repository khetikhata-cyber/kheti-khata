const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    loanId:       { type: String, required: true, unique: true },
    farmerId:     { type: String, required: true, index: true },
    lenderName:   { type: String, required: true, trim: true },
    amount:       { type: Number, required: true, min: 0 },
    repaidAmount: { type: Number, default: 0, min: 0 },
    balance:      { type: Number, required: true, min: 0 },
    interestRate: { type: Number, default: 0, min: 0 },
    dueDate:      { type: Number, default: null },
    status:       { type: String, enum: ['active', 'closed', 'overdue'], default: 'active' },
    deletedAt:    { type: Number, default: null },
    deletedBy:    { type: String, default: null },
    createdAt:    { type: Number, default: () => Date.now() },
    updatedAt:    { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

loanSchema.index({ farmerId: 1, status: 1 });
loanSchema.index({ dueDate: 1 });
loanSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });
loanSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });
loanSchema.pre('findOneAndUpdate', function (next) { this.set({ updatedAt: Date.now() }); next(); });

module.exports = mongoose.model('Loan', loanSchema);
