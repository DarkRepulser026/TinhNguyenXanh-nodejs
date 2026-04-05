var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var moderationController = require('../controllers/moderationController');

// Get event comments
router.get('/events/:id/comments', async function (req, res, next) {
  try {
    const result = await moderationController.GetEventComments(req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

// Create event comment
router.post('/events/:id/comments', authHandler.CheckLogin, async function (req, res, next) {
  try {
    const result = await moderationController.CreateEventComment(
      req.params.id,
      req.authUser.userId,
      req.body.content
    );
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});

// Get organization reviews
router.get('/organizations/:id/reviews', async function (req, res, next) {
  try {
    const result = await moderationController.GetOrganizationReviews(req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

// Create organization review
router.post('/organizations/:id/reviews', authHandler.CheckLogin, async function (req, res, next) {
  try {
    const result = await moderationController.CreateOrganizationReview(
      req.params.id,
      req.authUser.userId,
      req.body.rating,
      req.body.title,
      req.body.content
    );
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});

// Report event
router.post('/events/:id/reports', authHandler.CheckLogin, async function (req, res, next) {
  try {
    const result = await moderationController.ReportEvent(
      req.params.id,
      req.authUser.userId,
      req.body.reason,
      req.body.details
    );
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
