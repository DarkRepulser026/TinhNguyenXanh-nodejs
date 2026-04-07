const express = require('express');
const router = express.Router();
const authHandler = require('../utils/authHandler');
const organizerController = require('../controllers/organizerController');

router.get('/organizer/dashboard', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.getDashboard(req.authUser.userId);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/organizer/profile', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.getOrganizationProfile(req.authUser.userId);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.put('/organizer/profile', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.updateOrganization(req.authUser.userId, req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post('/organizer/claim', authHandler.CheckLogin, async function (req, res, next) {
  try {
    const result = await organizerController.claimOrganization(req.authUser.userId, req.body.organizationId || req.body.claimId);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/organizer/events', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.getEvents(req.authUser.userId, req.query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/organizer/events/:id', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.getEventById(req.authUser.userId, req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post('/organizer/events', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.createEvent(req.authUser.userId, req.body);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});
router.put('/organizer/events/:id', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.updateEvent(req.authUser.userId, req.params.id, req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.patch('/organizer/events/:id/hide', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.hideEvent(req.authUser.userId, req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.patch('/organizer/events/:id/unhide', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.unhideEvent(req.authUser.userId, req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/organizer/volunteers', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.getVolunteers(req.authUser.userId, req.query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/organizer/registrations/:id', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.getRegistrationById(req.authUser.userId, req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.patch('/organizer/registrations/:id/status', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.updateRegistrationStatus(req.authUser.userId, req.params.id, req.body.action);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/organizer/registrations/:id/evaluation', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.getRegistrationEvaluation(req.authUser.userId, req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post('/organizer/registrations/:id/evaluation', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.saveRegistrationEvaluation(req.authUser.userId, req.params.id, req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/organizer/volunteers/:id/history', authHandler.CheckLogin, authHandler.CheckRole('Organizer', 'Admin'), async function (req, res, next) {
  try {
    const result = await organizerController.getVolunteerHistory(req.authUser.userId, req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
