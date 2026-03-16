const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema(
  {
    dealerId:           { type: String, required: true, unique: true },
    farmerId:           { type: String, required: true, index: true },
    shopName:           { type: String, required: true, trim: true },
    ownerName:          { type: String, default: null },
    phone:              { type: String, default: null },
    outstandingBalance: { type: Number, default: 0 },
    createdAt:          { type: Number, default: () => Date.now() },
    updatedAt:          { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

dealerSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });
dealerSchema.pre('findOneAndUpdate', function (next) { this.set({ updatedAt: Date.now() }); next(); });

module.exports = mongoose.model('Dealer', dealerSchema);
