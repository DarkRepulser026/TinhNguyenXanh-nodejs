const mongoose = require('mongoose');

const EventCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model('EventCategory', EventCategorySchema);