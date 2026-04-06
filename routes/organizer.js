const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizerController');

router.get('/dashboard', async function (req, res, next) {
	try {
		const result = await organizerController.getDashboard(req.authUser);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/profile', async function (req, res, next) {
	try {
		const result = await organizerController.getOrganizationProfile(req.authUser);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.put('/profile', async function (req, res, next) {
	try {
		const result = await organizerController.updateOrganization(req.authUser, req.body);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.post('/claim', async function (req, res, next) {
	try {
		const result = await organizerController.claimOrganization(req.authUser, req.body.organizationId);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/events', async function (req, res, next) {
	try {
		const result = await organizerController.getEvents(req.authUser, req.query);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/events/:id', async function (req, res, next) {
	try {
		const result = await organizerController.getEventById(req.authUser, req.params.id);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.post('/events', async function (req, res, next) {
	try {
		const result = await organizerController.createEvent(req.authUser, req.body);
		res.status(201).send(result);
	} catch (error) {
		next(error);
	}
});

router.put('/events/:id', async function (req, res, next) {
	try {
		const result = await organizerController.updateEvent(req.authUser, req.params.id, req.body);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.patch('/events/:id/hide', async function (req, res, next) {
	try {
		const result = await organizerController.hideEvent(req.authUser, req.params.id);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.patch('/events/:id/unhide', async function (req, res, next) {
	try {
		const result = await organizerController.unhideEvent(req.authUser, req.params.id);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/volunteers', async function (req, res, next) {
	try {
		const result = await organizerController.getVolunteers(req.authUser, req.query);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/registrations/:id', async function (req, res, next) {
	try {
		const result = await organizerController.getRegistrationById(req.authUser, req.params.id);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.patch('/registrations/:id/status', async function (req, res, next) {
	try {
		const result = await organizerController.updateRegistrationStatus(req.authUser, req.params.id, req.body.action);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/registrations/:id/evaluation', async function (req, res, next) {
	try {
		const result = await organizerController.getRegistrationEvaluation(req.authUser, req.params.id);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/volunteers/:id/history', async function (req, res, next) {
	try {
		const result = await organizerController.getVolunteerHistory(req.authUser, req.params.id);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
