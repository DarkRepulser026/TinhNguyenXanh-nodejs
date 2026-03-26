const mongoose = require('mongoose');

const EventTaskAssignmentSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventTask', required: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    assignedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', default: null },
    status: {
      type: String,
      enum: ['Assigned', 'Accepted', 'Declined', 'Completed'],
      default: 'Assigned',
    },
    note: { type: String, default: null },
    assignedAt: { type: Date, default: Date.now },
    checkInAt: { type: Date, default: null },
    checkOutAt: { type: Date, default: null },
  },
  { timestamps: true }
);

EventTaskAssignmentSchema.index({ taskId: 1, volunteerId: 1 }, { unique: true });
EventTaskAssignmentSchema.index({ volunteerId: 1, status: 1 });

module.exports = mongoose.model('EventTaskAssignment', EventTaskAssignmentSchema);