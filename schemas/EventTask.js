const mongoose = require('mongoose');

const EventTaskSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    requiredVolunteers: { type: Number, default: 1, min: 1 },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ['Open', 'InProgress', 'Completed', 'Cancelled'],
      default: 'Open',
    },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', default: null },
  },
  { timestamps: true }
);

EventTaskSchema.index({ eventId: 1, status: 1 });
EventTaskSchema.index({ eventId: 1, startTime: 1 });

module.exports = mongoose.model('EventTask', EventTaskSchema);