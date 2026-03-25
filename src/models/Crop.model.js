const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const cropPhotoSchema = new mongoose.Schema(
  { url: { type: String }, takenAt: { type: Number } },
  { _id: false }
);

const cropSchema = new mongoose.Schema(
  {
    cropId: { type: String, required: true, unique: true, default: uuidv4 },
    fieldId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    totalExpenses: { type: Number, default: 0 },
    variety: { type: String, default: null },
    cropPhotoKey: { type: String, default: null },
    sowingDate: { type: String, required: true },
    expectedDays: { type: Number, required: true },
    status: { type: String, enum: ['active', 'harvested', 'settled'], default: 'active' },
    hasBataidaar: { type: Boolean, default: false },
    bataidaarId: { type: String, default: null },
    cropPhotos: {
      type: [cropPhotoSchema],
      default: [],
      validate: [(v) => v.length <= 30, 'Max 30 photos allowed'],
    },
    deletedAt: { type: Number, default: null },
    deletedBy: { type: String, default: null },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

cropSchema.index({ farmerId: 1, status: 1 });
cropSchema.index({ bataidaarId: 1 });
cropSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });
cropSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
cropSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Crop', cropSchema);
