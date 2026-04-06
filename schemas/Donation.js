const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', default: null },
    donorName: { type: String, default: null },
    amount: { type: mongoose.Types.Decimal128, required: true },
    phoneNumber: { type: String, default: null },
    message: { type: String, default: null },
    transactionCode: { type: String, required: true, unique: true },
    paymentMethod: { type: String, default: 'momo' },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Pending',
    },
    providerRef: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', DonationSchema);