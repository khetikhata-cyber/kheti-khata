// src/models/Otp.model.js

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'],
    },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, timestamps: false }
);

// ── Auto-delete expired OTPs via MongoDB TTL index ────────────────────────────
// MongoDB will automatically remove documents when expiresAt is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ── One OTP per mobile — upsert replaces old OTP ─────────────────────────────
otpSchema.index({ mobile: 1 }, { unique: true });

module.exports = mongoose.model('Otp', otpSchema);
