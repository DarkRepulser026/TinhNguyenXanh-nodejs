const mongoose = require('mongoose');

const EventRegistrationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    fullName: { type: String, required: true },
    phone: { type: String, default: null },
    reason: { type: String, default: null },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Unique: một volunteer chỉ đăng ký một event một lần
EventRegistrationSchema.index({ eventId: 1, volunteerId: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);