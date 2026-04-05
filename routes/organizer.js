const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizerController');

router.get('/dashboard', organizerController.getDashboard);
router.get('/profile', organizerController.getOrganizationProfile);
router.put('/profile', organizerController.updateOrganization);
router.post('/claim', organizerController.claimOrganization);
router.get('/events', organizerController.getEvents);
router.get('/events/:id', organizerController.getEventById);
router.post('/events', organizerController.createEvent);
router.put('/events/:id', organizerController.updateEvent);
router.patch('/events/:id/hide', organizerController.hideEvent);
router.patch('/events/:id/unhide', organizerController.unhideEvent);
router.get('/volunteers', organizerController.getVolunteers);
router.get('/registrations/:id', organizerController.getRegistrationById);
router.patch('/registrations/:id/status', organizerController.updateRegistrationStatus);
router.get('/registrations/:id/evaluation', organizerController.getRegistrationEvaluation);
router.get('/volunteers/:id/history', organizerController.getVolunteerHistory);

module.exports = router;
