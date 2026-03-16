const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema(
  {
    productionId:  { type: String, required: true, unique: true },
    cropId:        { type: String, required: true, index: true },
    farmerId:      { type: String, required: true },
    totalQuantity: { type: Number, required: true, min: 0 },
    unit:          { type: String, required: true, enum: ['quintal', 'kg', 'maan', 'ton'] },
    unsoldBalance: { type: Number, required: true, min: 0 },
    harvestDate:   { type: Number, required: true },
    deletedAt:     { type: Number, default: null },
    deletedBy:     { type: String, default: null },
    createdAt:     { type: Number, default: () => Date.now() },
    updatedAt:     { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

productionSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });
productionSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });
productionSchema.pre('findOneAndUpdate', function (next) { this.set({ updatedAt: Date.now() }); next(); });

module.exports = mongoose.model('Production', productionSchema);
