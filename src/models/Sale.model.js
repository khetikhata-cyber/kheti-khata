const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    saleId:       { type: String, required: true, unique: true },
    productionId: { type: String, required: true, index: true },
    cropId:       { type: String, required: true, index: true },
    farmerId:     { type: String, required: true },
    quantity:     { type: Number, required: true, min: 0 },
    ratePerUnit:  { type: Number, required: true, min: 0 },
    totalAmount:  { type: Number, required: true, min: 0 },
    buyerType:    { type: String, required: true, enum: ['mandi', 'trader', 'fpo', 'direct', 'other'] },
    buyerName:    { type: String, default: null },
    marketName:   { type: String, default: null },
    saleDate:     { type: Number, required: true },
    deletedAt:    { type: Number, default: null },
    deletedBy:    { type: String, default: null },
    deletedParentType: { type: String, default: null },
    deletedParentId: { type: String, default: null },
    createdAt:    { type: Number, default: () => Date.now() },
    updatedAt:    { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

saleSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });
saleSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });
saleSchema.pre('findOneAndUpdate', function (next) { this.set({ updatedAt: Date.now() }); next(); });

module.exports = mongoose.model('Sale', saleSchema);
