const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bataidaarSchema = new mongoose.Schema(
  {
    bataidaarId: { type: String, required: true, unique: true, default: uuidv4 },
    farmerId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    // sharePercent: { type: Number, default: 0, min: 0, max: 99 },
    // responsibilities: { type: [String], default: [] },
    linkedCropIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }],
      default: [],
    },
    mobile: { type: String, trim: true, default: null },
    deletedAt: { type: Number, default: null },
    deletedBy: { type: String, default: null },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

bataidaarSchema.index({ linkedCropIds: 1 });
bataidaarSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });
bataidaarSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
bataidaarSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Bataidaar', bataidaarSchema);
