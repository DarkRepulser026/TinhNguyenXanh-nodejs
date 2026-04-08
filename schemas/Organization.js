const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },

    city: { type: String, default: null },
    district: { type: String, default: null },
    ward: { type: String, default: null },
    address: { type: String, default: null },

    contactEmail: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    website: { type: String, default: null },

    organizationType: { type: String, default: null },

    taxCode: { type: String, default: null },
    foundedDate: { type: Date, default: null },
    legalRepresentative: { type: String, default: null },

    documentType: { type: String, default: null },
    verificationDocsUrl: { type: String, default: null },

    facebookUrl: { type: String, default: null },
    zaloNumber: { type: String, default: null },

    achievements: { type: String, default: null },
    focusAreas: { type: [String], default: [] },

    avatarUrl: { type: String, default: null },

    memberCount: { type: Number, default: 0 },
    eventsOrganized: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppUser',
      default: null,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', OrganizationSchema);