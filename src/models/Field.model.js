const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
  {
    fieldId:        { type: String, required: true, unique: true },
    farmerId:       { type: String, required: true, index: true },
    name:           { type: String, required: true, trim: true },
    areaAcres:      { type: Number, required: true },
    areaUnit:       { type: String, required: true, enum: ['bigha', 'acre', 'guntha', 'hectare'] },
    irrigationType: { type: String, required: true, enum: ['borewell', 'canal', 'rainfed'] },
    khasraNumber:   { type: String, default: null },
    deletedAt:      { type: Number, default: null },
    deletedBy:      { type: String, default: null },
    createdAt:      { type: Number, default: () => Date.now() },
    updatedAt:      { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

fieldSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });
fieldSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });
fieldSchema.pre('findOneAndUpdate', function (next) { this.set({ updatedAt: Date.now() }); next(); });

module.exports = mongoose.model('Field', fieldSchema);
