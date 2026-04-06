var express = require('express');
var router = express.Router();
var paymentController = require('../controllers/paymentController');

router.post('/payments/momo/create', async function (req, res, next) {
  try { let result = await paymentController.createMomoPayment(req.body.donorName, req.body.phoneNumber, req.body.message, req.body.method, req.body.amount); res.status(201).send(result); } catch (error) { next(error); }
});
router.post('/payments/momo/ipn', async function (req, res, next) {
  try { let result = await paymentController.handleMomoIpn(req.body.transactionCode, req.body.resultCode, req.body.providerRef); res.send(result); } catch (error) { next(error); }
});
router.get('/payments/:transactionCode', async function (req, res, next) {
  try { let result = await paymentController.getPaymentStatus(req.params.transactionCode); res.send(result); } catch (error) { next(error); }
});

module.exports = router;
