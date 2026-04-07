var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var moderationController = require('../controllers/moderationController');

router.get('/events/:id/comments', async function (req, res, next) {
  try {
    const result = await moderationController.getEventComments(req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post('/events/:id/comments', authHandler.CheckLogin, async function (req, res, next) {
  try {
    const result = await moderationController.createEventComment(req.params.id, req.authUser.userId, req.body.content);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/organizations/:id/reviews', async function (req, res, next) {
  try {
    const result = await moderationController.getOrganizationReviews(req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post('/organizations/:id/reviews', authHandler.CheckLogin, async function (req, res, next) {
  try {
    const result = await moderationController.createOrganizationReview(req.params.id, req.authUser.userId, req.body.rating, req.body.title, req.body.content);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});
router.post('/events/:id/reports', authHandler.CheckLogin, async function (req, res, next) {
  try {
    const result = await moderationController.reportEvent(req.params.id, req.authUser.userId, req.body.reason, req.body.details);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
