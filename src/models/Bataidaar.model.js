const mongoose = require('mongoose');

const bataidaarSchema = new mongoose.Schema(
  {
    bataidaarId:      { type: String, required: true, unique: true },
    cropId:           { type: String, required: true },
    farmerId:         { type: String, required: true, index: true },
    name:             { type: String, required: true, trim: true },
    sharePercent:     { type: Number, required: true, min: 1, max: 99 },
    responsibilities: { type: [String], default: [] },
    deletedAt:        { type: Number, default: null },
    deletedBy:        { type: String, default: null },
    createdAt:        { type: Number, default: () => Date.now() },
    updatedAt:        { type: Number, default: () => Date.now() },
  },
  { versionKey: false, timestamps: false }
);

// one bataidaar per active crop
bataidaarSchema.index(
  { cropId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);
bataidaarSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });
bataidaarSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });
bataidaarSchema.pre('findOneAndUpdate', function (next) { this.set({ updatedAt: Date.now() }); next(); });

module.exports = mongoose.model('Bataidaar', bataidaarSchema);
