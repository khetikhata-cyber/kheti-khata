const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema(
  {
    settlementId:          { type: String, required: true, unique: true },
    cropId:                { type: String, required: true },
    farmerId:              { type: String, required: true, index: true },
    totalExpense:          { type: Number, required: true },
    totalIncome:           { type: Number, required: true },
    profitLoss:            { type: Number, required: true },
    profitPerAcre:         { type: Number, required: true },
    bataidaarShareValue:   { type: Number, default: 0 },
    bataidaarExpensesPaid: { type: Number, default: 0 },
    netPayable:            { type: Number, default: 0 },
    payableDirection:      { type: String, enum: ['farmerPays', 'bataidaarPays', 'settled'], default: 'settled' },
    pdfUrl:                { type: String, default: null },
    settledAt:             { type: Number, default: () => Date.now() },
    createdAt:             { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

// Settlements are immutable snapshots — no soft delete, no updatedAt

module.exports = mongoose.model('Settlement', settlementSchema);
