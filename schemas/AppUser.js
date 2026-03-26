const mongoose = require('mongoose');

const AppUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, default: null },
    role: { type: String, enum: ['Admin', 'Organizer', 'Volunteer'], default: 'Volunteer' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AppUser', AppUserSchema);