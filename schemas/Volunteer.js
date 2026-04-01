const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', required: true, unique: true },
    fullName: { type: String, required: true },
    phone: { type: String, default: null },
    avatar: { type: String, default: null },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Volunteer', VolunteerSchema);