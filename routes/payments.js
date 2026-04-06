const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const paymentController = require('../controllers/paymentController');

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value || String(value).trim() === '') {
    throw { status: 500, message: `Missing MOMO configuration: ${key}` };
  }
  return String(value).trim();
}

function buildMomoSignature({ accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType }, secretKey) {
  const rawHash =
    'accessKey=' + accessKey +
    '&amount=' + amount +
    '&extraData=' + extraData +
    '&ipnUrl=' + ipnUrl +
    '&orderId=' + orderId +
    '&orderInfo=' + orderInfo +
    '&partnerCode=' + partnerCode +
    '&redirectUrl=' + redirectUrl +
    '&requestId=' + requestId +
    '&requestType=' + requestType;

  return crypto.createHmac('sha256', secretKey).update(rawHash).digest('hex');
}

router.post('/payments/momo/create', async function (req, res, next) {
  try {
    const { userId, donorName, phoneNumber, message, method, amount } = req.body;
    
    const donation = await paymentController.createDonation(userId, donorName, phoneNumber, message, method, amount);

    if (donation.paymentMethod === 'momo') {
      const momoApiUrl = getRequiredEnv('MOMO_API_URL');
      const partnerCode = getRequiredEnv('MOMO_PARTNER_CODE');
      const accessKey = getRequiredEnv('MOMO_ACCESS_KEY');
      const secretKey = getRequiredEnv('MOMO_SECRET_KEY');
      const notifyUrl = getRequiredEnv('MOMO_NOTIFY_URL');
      const returnUrl = getRequiredEnv('MOMO_RETURN_URL');
      const orderInfo = donation.message || 'Ủng hộ Tinh Nguyen Xanh';
      const extraData = JSON.stringify({ transactionCode: donation.transactionCode });
      const redirectUrl = returnUrl.includes('?') ? `${returnUrl}&txn=${encodeURIComponent(donation.transactionCode)}` : `${returnUrl}?txn=${encodeURIComponent(donation.transactionCode)}`;
      const requestType = 'captureWallet';

      const signature = buildMomoSignature({ accessKey, amount: String(donation.amount), extraData, ipnUrl: notifyUrl, orderId: donation.transactionCode, orderInfo, partnerCode, redirectUrl, requestId: donation.providerRef, requestType }, secretKey);

      const momoRequest = { partnerCode, partnerName: 'Tinh Nguyen Xanh', storeId: 'MomoTestStore', requestId: donation.providerRef, amount: String(donation.amount), orderId: donation.transactionCode, orderInfo, redirectUrl, ipnUrl: notifyUrl, lang: 'vi', extraData, requestType, signature };

      const momoResponse = await axios.post(momoApiUrl, momoRequest, { headers: { 'Content-Type': 'application/json' } });

      const momoData = momoResponse.data;
      if (momoData && momoData.payUrl) {
        return res.status(201).send({ donationId: donation.id, transactionCode: donation.transactionCode, status: donation.status, paymentUrl: momoData.payUrl, message: 'Payment request created. Continue to MoMo checkout.' });
      }

      const errorMessage = momoData && momoData.message ? momoData.message : 'Không thể tạo yêu cầu thanh toán MoMo.';
      throw { status: 502, message: errorMessage, detail: momoData };
    }

    const paymentUrl = '/payment-result?status=pending&txn=' + encodeURIComponent(donation.transactionCode) + '&amount=' + encodeURIComponent(String(donation.amount)) + '&method=' + encodeURIComponent(donation.paymentMethod);

    res.status(201).send({ donationId: donation.id, transactionCode: donation.transactionCode, status: donation.status, paymentUrl, message: 'Payment request created. Continue to provider checkout.' });
  } catch (error) {
    next(error);
  }
});

router.post('/payments/momo/ipn', async function (req, res, next) {
  try {
    const { orderId, resultCode, transId } = req.body;
    
    if (!orderId) {
      throw { status: 400, message: 'orderId (transactionCode) is required.' };
    }

    const status = String(resultCode) === '0' ? 'Success' : 'Failed';
    const updatedDonation = await paymentController.updateDonationStatus(orderId, status, transId);

    res.send({ transactionCode: updatedDonation.transactionCode, status: updatedDonation.status, amount: updatedDonation.amount, method: updatedDonation.paymentMethod });
  } catch (error) {
    next(error);
  }
});

router.get('/payments/:transactionCode', async function (req, res, next) {
  try {
    const result = await paymentController.getPaymentStatus(req.params.transactionCode);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
