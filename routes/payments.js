var express = require('express');
var router = express.Router();
var paymentController = require('../controllers/paymentController');

router.post('/payments/momo/create', async function (req, res, next) {
	try {
		const result = await paymentController.createMomoPayment(req.body);
		res.status(201).send(result);
	} catch (error) {
		next(error);
	}
});

router.post('/payments/momo/ipn', async function (req, res, next) {
	try {
		const result = await paymentController.handleMomoIpn(req.body);
		res.send(result);
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
