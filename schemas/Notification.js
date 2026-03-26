const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', required: true },
    type: {
      type: String,
      enum: ['System', 'Event', 'Organization', 'Moderation', 'Payment'],
      default: 'System',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    relatedEntityType: { type: String, default: null },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientUserId: 1, isRead: 1, sentAt: -1 });
NotificationSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);