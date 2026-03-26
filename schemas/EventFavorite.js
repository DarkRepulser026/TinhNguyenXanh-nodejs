const mongoose = require('mongoose');

const EventFavoriteSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

EventFavoriteSchema.index({ eventId: 1, volunteerId: 1 }, { unique: true });

module.exports = mongoose.model('EventFavorite', EventFavoriteSchema);