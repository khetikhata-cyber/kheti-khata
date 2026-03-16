const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema(
  {
    farmerId:  { type: String, required: true, unique: true },
    mobile:    { type: String, required: true, unique: true, match: [/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'] },
    name:      { type: String, trim: true, default: null },
    village:   { type: String, trim: true, default: null },
    district:  { type: String, trim: true, default: null },
    state:     { type: String, trim: true, default: null },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

farmerSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });
farmerSchema.pre('findOneAndUpdate', function (next) { this.set({ updatedAt: Date.now() }); next(); });

module.exports = mongoose.model('Farmer', farmerSchema);
