// controllers/paymentController.js
const axios = require('axios');
const crypto = require('crypto');
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toPaymentMethod(value) {
  if (value === 'momo' || value === 'bank') {
    return value;
  }
  return 'momo';
}

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

exports.createMomoPayment = async (userId, donorNameInput, phoneNumberInput, messageInput, methodInput, amountInput) => {
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
  donation = mongo.toPlain(donation.toObject());

  if (paymentMethod === 'momo') {
    const momoApiUrl = getRequiredEnv('MOMO_API_URL');
    const partnerCode = getRequiredEnv('MOMO_PARTNER_CODE');
    const accessKey = getRequiredEnv('MOMO_ACCESS_KEY');
    const secretKey = getRequiredEnv('MOMO_SECRET_KEY');
    const notifyUrl = getRequiredEnv('MOMO_NOTIFY_URL');
    const returnUrl = getRequiredEnv('MOMO_RETURN_URL');
    const orderInfo = message || 'Ủng hộ Tinh Nguyen Xanh';
    const extraData = JSON.stringify({ transactionCode });
    const redirectUrl = returnUrl.includes('?') ? `${returnUrl}&txn=${encodeURIComponent(transactionCode)}` : `${returnUrl}?txn=${encodeURIComponent(transactionCode)}`;
    const requestType = 'captureWallet';

    const signature = buildMomoSignature(
      {
        accessKey,
        amount: String(amount),
        extraData,
        ipnUrl: notifyUrl,
        orderId: transactionCode,
        orderInfo,
        partnerCode,
        redirectUrl,
        requestId,
        requestType,
      },
      secretKey,
    );

    const momoRequest = {
      partnerCode,
      partnerName: 'Tinh Nguyen Xanh',
      storeId: 'MomoTestStore',
      requestId,
      amount: String(amount),
      orderId: transactionCode,
      orderInfo,
      redirectUrl,
      ipnUrl: notifyUrl,
      lang: 'vi',
      extraData,
      requestType,
      signature,
    };

    const momoResponse = await axios.post(momoApiUrl, momoRequest, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const momoData = momoResponse.data;
    if (momoData && momoData.payUrl) {
      return {
        donationId: donation.id,
        transactionCode,
        status: donation.status,
        paymentUrl: momoData.payUrl,
        message: 'Payment request created. Continue to MoMo checkout.',
      };
    }

    const errorMessage = momoData && momoData.message ? momoData.message : 'Không thể tạo yêu cầu thanh toán MoMo.';
    throw { status: 502, message: errorMessage, detail: momoData };
  }

  const paymentUrl = '/payment-result?status=pending&txn=' + encodeURIComponent(transactionCode) + '&amount=' + encodeURIComponent(String(amount)) + '&method=' + encodeURIComponent(paymentMethod);

  return {
    donationId: donation.id,
    transactionCode,
    status: donation.status,
    paymentUrl,
    message: 'Payment request created. Continue to provider checkout.',
  };
};

exports.handleMomoIpn = async (ipnData) => {
  const {
    orderId, resultCode, transId, amount, extraData,
    message, orderInfo, orderType, partnerCode, payType,
    requestId, responseTime, signature
  } = ipnData;

  // Mã hóa và đối chiếu chữ ký để chống giả mạo
  const accessKey = getRequiredEnv('MOMO_ACCESS_KEY');
  const secretKey = getRequiredEnv('MOMO_SECRET_KEY');
  
  const rawHash = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
  const expectedSignature = crypto.createHmac('sha256', secretKey).update(rawHash).digest('hex');

  if (signature !== expectedSignature) {
    throw { status: 400, message: 'Invalid MoMo signature. Webhook giả mạo bị từ chối.' };
  }

  const transactionCode = orderId;

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
    { $set: { status: String(resultCode) === '0' ? 'Success' : 'Failed', providerRef: transId } },
    { new: true },
  ).lean();
  donation = mongo.toPlain(donation);

  return {
    transactionCode: donation.transactionCode,
    status: donation.status,
    amount: donation.amount,
    method: donation.paymentMethod,
  };
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