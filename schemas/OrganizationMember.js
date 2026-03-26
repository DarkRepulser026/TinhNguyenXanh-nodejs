const mongoose = require('mongoose');

const OrganizationMemberSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', required: true },
    role: {
      type: String,
      enum: ['Owner', 'Manager', 'Member'],
      default: 'Member',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Invited'],
      default: 'Active',
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
OrganizationMemberSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('OrganizationMember', OrganizationMemberSchema);