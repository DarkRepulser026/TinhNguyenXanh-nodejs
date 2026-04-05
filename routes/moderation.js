var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var moderationController = require('../controllers/moderationController');

router.get('/events/:id/comments', moderationController.getEventComments);
router.post('/events/:id/comments', authHandler.requireAuth, moderationController.createEventComment);
router.get('/organizations/:id/reviews', moderationController.getOrganizationReviews);
router.post('/organizations/:id/reviews', authHandler.requireAuth, moderationController.createOrganizationReview);
router.post('/events/:id/reports', authHandler.requireAuth, moderationController.reportEvent);

module.exports = router;
