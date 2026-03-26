const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: null },
    city: { type: String, default: null },
    district: { type: String, default: null },
    address: { type: String, default: null },
    contactEmail: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    website: { type: String, default: null },
    organizationType: { type: String, default: null },
    memberCount: { type: Number, default: 0 },
    eventsOrganized: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    // Reference tới AppUser (owner)
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', default: null, unique: true, sparse: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Organization', OrganizationSchema);