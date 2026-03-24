// src/services/otp.service.js

const crypto = require('crypto');
const Otp = require('../models/Otp.model');
const AppError = require('../utils/AppError');

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const OTP_LENGTH = 6;

// ─── Generate a 6-digit OTP ───────────────────────────────────────────────────
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ─── Send OTP ─────────────────────────────────────────────────────────────────
const sendOtp = async (mobile) => {
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new AppError('Enter a valid 10-digit Indian mobile number', 400);
  }

  // ── Resend throttle: 60 seconds ──────────────────────────────────────────
  const existing = await Otp.findOne({ mobile });
  if (existing) {
    const secondsLeft = Math.ceil((existing.expiresAt - Date.now()) / 1000);
    const cooldown = OTP_EXPIRY_MS / 1000 - 60; // 540 seconds
    if (secondsLeft > cooldown) {
      const waitSeconds = secondsLeft - cooldown;
      throw new AppError(`Please wait ${waitSeconds} seconds before requesting a new OTP`, 429, {
        remainingSeconds: waitSeconds,
      });
    }
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  // ── Save to MongoDB (upsert — replaces old OTP for same mobile) ──────────
  await Otp.findOneAndUpdate(
    { mobile },
    { otp, expiresAt, attempts: 0, createdAt: new Date() },
    { upsert: true, new: true }
  );

  // ── Send SMS via Twilio ───────────────────────────────────────────────────
  await sendViaTwilio(mobile, otp);

  console.log(`\n📱 OTP for +91${mobile}: ${otp}\n`);

  return {
    message: `OTP sent to +91${mobile}`,
    expiresInMinutes: OTP_EXPIRY_MS / 60000,
    ...(process.env.NODE_ENV === 'development' && { otp }),
  };
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
const verifyOtp = async (mobile, enteredOtp) => {
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new AppError('Enter a valid 10-digit Indian mobile number', 400);
  }

  if (!enteredOtp || enteredOtp.length !== OTP_LENGTH) {
    throw new AppError(`OTP must be ${OTP_LENGTH} digits`, 400);
  }

  const record = await Otp.findOne({ mobile });

  // OTP not found
  if (!record) {
    throw new AppError('OTP not found or expired. Please request a new one.', 400);
  }

  // OTP expired
  if (new Date() > record.expiresAt) {
    await Otp.deleteOne({ mobile });
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  // Too many attempts
  if (record.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteOne({ mobile });
    throw new AppError('Too many incorrect attempts. Please request a new OTP.', 429);
  }

  // Wrong OTP
  if (record.otp !== enteredOtp.trim()) {
    await Otp.findOneAndUpdate({ mobile }, { $inc: { attempts: 1 } });

    const remaining = MAX_ATTEMPTS - (record.attempts + 1);
    throw new AppError(
      remaining > 0
        ? `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many incorrect attempts. Please request a new OTP.',
      400
    );
  }

  // ✅ OTP correct — delete it (one-time use)
  await Otp.deleteOne({ mobile });

  return { verified: true, mobile };
};

// ─── Twilio SMS ───────────────────────────────────────────────────────────────
const sendViaTwilio = async (mobile, otp) => {
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: `Your Krishi Khata OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
    from: '+14787074965',
    to: `+91${mobile}`,
  });
};

module.exports = { sendOtp, verifyOtp };
