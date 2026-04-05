var express = require('express');
var router = express.Router();
var paymentController = require('../controllers/paymentController');

router.post('/payments/momo/create', paymentController.createMomoPayment);
router.post('/payments/momo/ipn', paymentController.handleMomoIpn);
router.get('/payments/:transactionCode', paymentController.getPaymentStatus);

module.exports = router;
