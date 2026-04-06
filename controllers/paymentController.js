// controllers/paymentController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toPaymentMethod(value) {
  if (value === 'momo' || value === 'bank') {
    return value;
  }
  return 'momo';
}

exports.createDonation = async (userId, donorNameInput, phoneNumberInput, messageInput, methodInput, amountInput) => {
  const donorName = typeof donorNameInput === 'string' ? donorNameInput.trim() : null;
  const phoneNumber = typeof phoneNumberInput === 'string' ? phoneNumberInput.trim() : null;
  const message = typeof messageInput === 'string' ? messageInput.trim() : null;
  const paymentMethod = toPaymentMethod(methodInput);
  const amount = Number(amountInput);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw { status: 400, message: 'amount must be a positive number.' };
  }

  const transactionCode = 'VH_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
  const requestId = transactionCode;

  let donation = await models.donation.create({
      userId: userId ? mongo.toObjectId(userId) : null,
      donorName,
      amount,
      phoneNumber,
      message,
      paymentMethod,
      transactionCode,
      status: 'Pending',
      providerRef: requestId,
  });
  return mongo.toPlain(donation.toObject());
};

exports.updateDonationStatus = async (transactionCode, status, providerRef) => {
  let donation = await models.donation.findOne({ transactionCode }).lean();
  donation = mongo.toPlain(donation);

  if (!donation) {
    throw { status: 404, message: 'Donation transaction not found.' };
  }

  donation = await models.donation.findOneAndUpdate(
    { _id: mongo.toObjectId(donation.id) },
    { $set: { status, providerRef } },
    { new: true },
  ).lean();
  return mongo.toPlain(donation);
};

exports.getPaymentStatus = async (transactionCodeInput) => {
  const transactionCode = typeof transactionCodeInput === 'string' ? transactionCodeInput.trim() : '';

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
};
