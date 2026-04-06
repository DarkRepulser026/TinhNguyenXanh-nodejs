// controllers/paymentController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toPaymentMethod(value) {
  if (value === 'momo' || value === 'bank') return value;
  return 'momo';
}

module.exports = {
  createMomoPayment: async function (donorName, phoneNumber, message, method, amount) {
    donorName = typeof donorName === 'string' ? donorName.trim() : null;
    phoneNumber = typeof phoneNumber === 'string' ? phoneNumber.trim() : null;
    message = typeof message === 'string' ? message.trim() : null;
    const paymentMethod = toPaymentMethod(method);
    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0) throw { status: 400, message: 'amount must be a positive number.' };
    const transactionCode = 'VH_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
    let donation = await models.donation.create({ donorName, amount, phoneNumber, message, paymentMethod, transactionCode, status: 'Pending', providerRef: null });
    donation = mongo.toPlain(donation.toObject());
    const paymentUrl = '/payment-result?status=pending&txn=' + encodeURIComponent(transactionCode) + '&amount=' + encodeURIComponent(String(amount)) + '&method=' + encodeURIComponent(paymentMethod);
    return { donationId: donation.id, transactionCode, status: donation.status, paymentUrl, message: 'Payment request created. Continue to provider checkout.' };
  },

  handleMomoIpn: async function (transactionCode, resultCode, providerRef) {
    transactionCode = typeof transactionCode === 'string' ? transactionCode.trim() : '';
    providerRef = typeof providerRef === 'string' ? providerRef.trim() : null;
    if (!transactionCode) throw { status: 400, message: 'transactionCode is required.' };
    let donation = mongo.toPlain(await models.donation.findOne({ transactionCode }).lean());
    if (!donation) throw { status: 404, message: 'Donation transaction not found.' };
    donation = mongo.toPlain(await models.donation.findOneAndUpdate({ _id: mongo.toObjectId(donation.id) }, { $set: { status: resultCode === '0' ? 'Success' : 'Failed', providerRef } }, { new: true }).lean());
    return { transactionCode: donation.transactionCode, status: donation.status, amount: donation.amount, method: donation.paymentMethod };
  },

  getPaymentStatus: async function (transactionCode) {
    transactionCode = typeof transactionCode === 'string' ? transactionCode.trim() : '';
    if (!transactionCode) throw { status: 400, message: 'transactionCode is required.' };
    let donation = mongo.toPlain(await models.donation.findOne({ transactionCode }).lean());
    if (!donation) throw { status: 404, message: 'Donation transaction not found.' };
    return { transactionCode: donation.transactionCode, status: donation.status, amount: donation.amount, method: donation.paymentMethod, createdAt: donation.createdAt, updatedAt: donation.updatedAt };
  },
};
