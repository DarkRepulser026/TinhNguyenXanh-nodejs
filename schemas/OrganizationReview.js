const mongoose = require('mongoose');

const OrganizationReviewSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: null },
    content: { type: String, default: null },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

OrganizationReviewSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('OrganizationReview', OrganizationReviewSchema);