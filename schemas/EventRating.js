const mongoose = require('mongoose');

const EventRatingSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, default: null },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventRating', EventRatingSchema);
