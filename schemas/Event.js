const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: null },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    location: { type: String, default: null },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    maxVolunteers: { type: Number, default: 0 },
    images: { type: String, default: null }, // URL hoặc JSON string danh sách ảnh
    isHidden: { type: Boolean, default: false },
    // References
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventCategory', default: null },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Event', EventSchema);