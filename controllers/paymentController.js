// controllers/paymentController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toPaymentMethod(value) {
  if (value === 'momo' || value === 'bank') {
    return value;
  }
  return 'momo';
}

exports.createMomoPayment = async (req, res, next) => {
  try {
    const donorName = typeof req.body.donorName === 'string' ? req.body.donorName.trim() : null;
    const phoneNumber = typeof req.body.phoneNumber === 'string' ? req.body.phoneNumber.trim() : null;
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : null;
    const paymentMethod = toPaymentMethod(req.body.method);
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).send({ message: 'amount must be a positive number.' });
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

    res.status(201).send({
      donationId: donation.id,
      transactionCode,
      status: donation.status,
      paymentUrl,
      message: 'Payment request created. Continue to provider checkout.',
    });
  } catch (error) {
    next(error);
  }
};

exports.handleMomoIpn = async (req, res, next) => {
  try {
    const transactionCode = typeof req.body.transactionCode === 'string' ? req.body.transactionCode.trim() : '';
    const resultCode = typeof req.body.resultCode === 'string' ? req.body.resultCode : '';
    const providerRef = typeof req.body.providerRef === 'string' ? req.body.providerRef.trim() : null;

    if (!transactionCode) {
      return res.status(400).send({ message: 'transactionCode is required.' });
    }

    let donation = await models.donation.findOne({ transactionCode }).lean();
    donation = mongo.toPlain(donation);

    if (!donation) {
      return res.status(404).send({ message: 'Donation transaction not found.' });
    }

    donation = await models.donation.findOneAndUpdate(
      { _id: mongo.toObjectId(donation.id) },
      { $set: { status: resultCode === '0' ? 'Success' : 'Failed', providerRef } },
      { new: true }
    ).lean();
    donation = mongo.toPlain(donation);

    res.send({
      transactionCode: donation.transactionCode,
      status: donation.status,
      amount: donation.amount,
      method: donation.paymentMethod,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const transactionCode = typeof req.params.transactionCode === 'string' ? req.params.transactionCode.trim() : '';

    if (!transactionCode) {
      return res.status(400).send({ message: 'transactionCode is required.' });
    }

    let donation = await models.donation.findOne({ transactionCode }).lean();
    donation = mongo.toPlain(donation);

    if (!donation) {
      return res.status(404).send({ message: 'Donation transaction not found.' });
    }

    res.send({
      transactionCode: donation.transactionCode,
      status: donation.status,
      amount: donation.amount,
      method: donation.paymentMethod,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
