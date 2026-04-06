// controllers/paymentController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toPaymentMethod(value) {
  if (value === 'momo' || value === 'bank') {
    return value;
  }
  return 'momo';
}

module.exports = {
  async createMomoPayment(body) {
    const donorName = typeof body.donorName === 'string' ? body.donorName.trim() : null;
    const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : null;
    const message = typeof body.message === 'string' ? body.message.trim() : null;
    const paymentMethod = toPaymentMethod(body.method);
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw { status: 400, message: 'amount must be a positive number.' };
    }

    const transactionCode = 'VH_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
    let donation = await models.donation.create({
      donorName,
      amount,
      phoneNumber,
      message,
      paymentMethod,
      transactionCode,
      status: 'Pending',
      providerRef: null,
    });
    donation = mongo.toPlain(donation.toObject());

    const paymentUrl = '/payment-result?status=pending&txn=' + encodeURIComponent(transactionCode) + '&amount=' + encodeURIComponent(String(amount)) + '&method=' + encodeURIComponent(paymentMethod);

    return {
      donationId: donation.id,
      transactionCode,
      status: donation.status,
      paymentUrl,
      message: 'Payment request created. Continue to provider checkout.',
    };
  },

  async handleMomoIpn(body) {
    const transactionCode = typeof body.transactionCode === 'string' ? body.transactionCode.trim() : '';
    const resultCode = typeof body.resultCode === 'string' ? body.resultCode : '';
    const providerRef = typeof body.providerRef === 'string' ? body.providerRef.trim() : null;

    if (!transactionCode) {
      throw { status: 400, message: 'transactionCode is required.' };
    }

    let donation = await models.donation.findOne({ transactionCode }).lean();
    donation = mongo.toPlain(donation);

    if (!donation) {
      throw { status: 404, message: 'Donation transaction not found.' };
    }

    donation = await models.donation.findOneAndUpdate(
      { _id: mongo.toObjectId(donation.id) },
      { $set: { status: resultCode === '0' ? 'Success' : 'Failed', providerRef } },
      { new: true }
    ).lean();
    donation = mongo.toPlain(donation);

    return {
      transactionCode: donation.transactionCode,
      status: donation.status,
      amount: donation.amount,
      method: donation.paymentMethod,
    };
  },

  async getPaymentStatus(transactionCode) {
    transactionCode = typeof transactionCode === 'string' ? transactionCode.trim() : '';

    if (!transactionCode) {
      throw { status: 400, message: 'transactionCode is required.' };
    }

    let donation = await models.donation.findOne({ transactionCode }).lean();
    donation = mongo.toPlain(donation);

    if (!donation) {
      throw { status: 404, message: 'Donation transaction not found.' };
    }

    return {
      transactionCode: donation.transactionCode,
      status: donation.status,
      amount: donation.amount,
      method: donation.paymentMethod,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
    };
  }
};
