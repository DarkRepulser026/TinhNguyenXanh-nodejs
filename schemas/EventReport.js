const mongoose = require('mongoose');

const EventReportSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    reporterUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', required: true },
    reason: { type: String, required: true },
    details: { type: String, default: null },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventReport', EventReportSchema);