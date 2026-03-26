var express = require('express');
var router = express.Router();
var models = require('../utils/models');
var mongo = require('../utils/mongo');

function toPaymentMethod(value) {
    if (value === 'momo' || value === 'bank') {
        return value;
    }

    return 'momo';
}

router.post('/payments/momo/create', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var donorName = typeof req.body.donorName === 'string' ? req.body.donorName.trim() : null;
    var phoneNumber = typeof req.body.phoneNumber === 'string' ? req.body.phoneNumber.trim() : null;
    var message = typeof req.body.message === 'string' ? req.body.message.trim() : null;
    var paymentMethod = toPaymentMethod(req.body.method);
    var amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        res.status(400).send({ message: 'amount must be a positive number.' });
        return;
    }

    var transactionCode = 'VH_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
    var donation = await models.donation.create({
        donorName: donorName,
        amount: amount,
        phoneNumber: phoneNumber,
        message: message,
        paymentMethod: paymentMethod,
        transactionCode: transactionCode,
        status: 'Pending',
        providerRef: null,
    });
    donation = mongo.toPlain(donation.toObject());

    var paymentUrl = '/payment-result?status=pending&txn=' + encodeURIComponent(transactionCode) + '&amount=' + encodeURIComponent(String(amount)) + '&method=' + encodeURIComponent(paymentMethod);

    res.status(201).send({
        donationId: donation.id,
        transactionCode: transactionCode,
        status: donation.status,
        paymentUrl: paymentUrl,
        message: 'Payment request created. Continue to provider checkout.',
    });
        })
        .catch(next);
});

router.post('/payments/momo/ipn', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var transactionCode = typeof req.body.transactionCode === 'string' ? req.body.transactionCode.trim() : '';
    var resultCode = typeof req.body.resultCode === 'string' ? req.body.resultCode : '';
    var providerRef = typeof req.body.providerRef === 'string' ? req.body.providerRef.trim() : null;

    if (!transactionCode) {
        res.status(400).send({ message: 'transactionCode is required.' });
        return;
    }

    var donation = await models.donation.findOne({ transactionCode: transactionCode }).lean();
    donation = mongo.toPlain(donation);

    if (!donation) {
        res.status(404).send({ message: 'Donation transaction not found.' });
        return;
    }

    donation = await models.donation.findOneAndUpdate(
        {
            _id: mongo.toObjectId(donation.id),
        },
        {
            $set: {
                status: resultCode === '0' ? 'Success' : 'Failed',
                providerRef: providerRef,
            },
        },
        { new: true }
    ).lean();
    donation = mongo.toPlain(donation);

    res.send({
        transactionCode: donation.transactionCode,
        status: donation.status,
        amount: donation.amount,
        method: donation.paymentMethod,
    });
        })
        .catch(next);
});

router.get('/payments/:transactionCode', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var transactionCode = typeof req.params.transactionCode === 'string' ? req.params.transactionCode.trim() : '';

    if (!transactionCode) {
        res.status(400).send({ message: 'transactionCode is required.' });
        return;
    }

    var donation = await models.donation.findOne({ transactionCode: transactionCode }).lean();
    donation = mongo.toPlain(donation);

    if (!donation) {
        res.status(404).send({ message: 'Donation transaction not found.' });
        return;
    }

    res.send({
        transactionCode: donation.transactionCode,
        status: donation.status,
        amount: donation.amount,
        method: donation.paymentMethod,
        createdAt: donation.createdAt,
        updatedAt: donation.updatedAt,
    });
        })
        .catch(next);
});

module.exports = router;
