const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizerController');
const authHandler = require('../utils/authHandler');

// Apply Organizer authentication middleware to all /organizer routes
router.use('/organizer', authHandler.requireAuth, authHandler.requireRole('Organizer'));

// Dashboard & Profile
router.get('/organizer/dashboard', organizerController.getDashboard);
router.get('/organizer/profile', organizerController.getOrganizationProfile);
router.put('/organizer/profile', organizerController.updateOrganization);
router.post('/organizer/claim', organizerController.claimOrganization);

// Events
router.get('/organizer/events', organizerController.getEvents);
router.get('/organizer/events/:id', organizerController.getEventById);
router.post('/organizer/events', organizerController.createEvent);
router.put('/organizer/events/:id', organizerController.updateEvent);
router.patch('/organizer/events/:id/hide', organizerController.hideEvent);
router.patch('/organizer/events/:id/unhide', organizerController.unhideEvent);

// Volunteers & Registrations
router.get('/organizer/volunteers', organizerController.getVolunteers);
router.get('/organizer/registrations/:id', organizerController.getRegistrationById);
router.patch('/organizer/registrations/:id/status', organizerController.updateRegistrationStatus);
router.get('/organizer/registrations/:id/evaluation', organizerController.getRegistrationEvaluation);
router.get('/organizer/volunteers/:id/history', organizerController.getVolunteerHistory);

module.exports = router;
