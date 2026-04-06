const express = require('express');
const router = express.Router();
const authHandler = require('../utils/authHandler');
const volunteerController = require('../controllers/volunteerController');

router.get('/volunteers/:userId/profile', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await volunteerController.getVolunteerProfile(req.authUser, req.params.userId);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.get('/volunteers/:userId/registrations', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await volunteerController.getVolunteerRegistrations(req.authUser, req.params.userId);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.delete('/volunteers/:userId/registrations/:registrationId', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await volunteerController.removeVolunteerRegistration(req.authUser, req.params.userId, req.params.registrationId);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.get('/volunteers/:userId/favorites', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await volunteerController.getVolunteerFavorites(req.authUser, req.params.userId);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.delete('/volunteers/:userId/favorites/:eventId', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await volunteerController.removeVolunteerFavorite(req.authUser, req.params.userId, req.params.eventId);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.get('/volunteers/:userId/dashboard', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await volunteerController.getVolunteerDashboard(req.authUser, req.params.userId);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.get('/events/:eventId/comments', async function (req, res, next) {
    try {
        const result = await volunteerController.getEventComments(req.params.eventId);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.post('/events/:eventId/comments', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await volunteerController.createEventComment(req.authUser, req.params.eventId, req.body.content);
        res.status(201).send(result);
    } catch (error) {
        next(error);
    }
});

router.get('/events/:eventId/ratings', async function (req, res, next) {
    try {
        const result = await volunteerController.getEventRatings(req.params.eventId);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.post('/events/:eventId/ratings', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await volunteerController.createOrUpdateEventRating(req.authUser, req.params.eventId, req.body.rating, req.body.review);
        res.status(201).send(result);
    } catch (error) {
        next(error);
    }
});

router.put('/volunteers/:userId/profile', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await volunteerController.updateVolunteerProfile(req.authUser, req.params.userId, req.body.fullName, req.body.phone);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.post('/volunteers/:userId/avatar', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await volunteerController.uploadVolunteerAvatar(req.authUser, req.params.userId, req.body.avatarData);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
