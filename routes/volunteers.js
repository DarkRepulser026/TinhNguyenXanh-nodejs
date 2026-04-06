var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var volunteerController = require('../controllers/volunteerController');

function assertAccess(reqUserId, authUser) {
  if (!authUser) return false;
  return String(reqUserId || '').trim() === String(authUser.userId || '').trim() || authUser.role === 'Admin';
}

router.get('/volunteers/:userId/profile', authHandler.CheckLogin, async function (req, res, next) {
  try {
    if (!assertAccess(req.params.userId, req.authUser)) return res.status(403).send({ message: 'You do not have access to this profile.' });
    let result = await volunteerController.getProfile(req.params.userId);
    res.send(result);
  } catch (error) { next(error); }
});
router.put('/volunteers/:userId/profile', authHandler.CheckLogin, async function (req, res, next) {
  try {
    if (!assertAccess(req.params.userId, req.authUser)) return res.status(403).send({ message: 'You do not have access to this profile.' });
    let result = await volunteerController.updateProfile(req.params.userId, req.body.fullName, req.body.phone);
    res.send(result);
  } catch (error) { next(error); }
});
router.post('/volunteers/:userId/avatar', authHandler.CheckLogin, async function (req, res, next) {
  try {
    if (!assertAccess(req.params.userId, req.authUser)) return res.status(403).send({ message: 'You do not have access to upload avatar.' });
    let result = await volunteerController.uploadAvatar(req.params.userId, req.body.avatarData);
    res.send(result);
  } catch (error) { next(error); }
});
router.get('/volunteers/:userId/registrations', authHandler.CheckLogin, async function (req, res, next) {
  try {
    if (!assertAccess(req.params.userId, req.authUser)) return res.status(403).send({ message: 'You do not have access to these registrations.' });
    let result = await volunteerController.getRegistrations(req.params.userId);
    res.send(result);
  } catch (error) { next(error); }
});
router.delete('/volunteers/:userId/registrations/:registrationId', authHandler.CheckLogin, async function (req, res, next) {
  try {
    if (!assertAccess(req.params.userId, req.authUser)) return res.status(403).send({ message: 'You do not have access to these registrations.' });
    let result = await volunteerController.deleteRegistration(req.params.userId, req.params.registrationId);
    res.send(result);
  } catch (error) { next(error); }
});
router.get('/volunteers/:userId/favorites', authHandler.CheckLogin, async function (req, res, next) {
  try {
    if (!assertAccess(req.params.userId, req.authUser)) return res.status(403).send({ message: 'You do not have access to these favorites.' });
    let result = await volunteerController.getFavorites(req.params.userId);
    res.send(result);
  } catch (error) { next(error); }
});
router.delete('/volunteers/:userId/favorites/:eventId', authHandler.CheckLogin, async function (req, res, next) {
  try {
    if (!assertAccess(req.params.userId, req.authUser)) return res.status(403).send({ message: 'You do not have access to these favorites.' });
    let result = await volunteerController.deleteFavorite(req.params.userId, req.params.eventId);
    res.send(result);
  } catch (error) { next(error); }
});
router.get('/volunteers/:userId/dashboard', authHandler.CheckLogin, async function (req, res, next) {
  try {
    if (!assertAccess(req.params.userId, req.authUser)) return res.status(403).send({ message: 'You do not have access to this dashboard.' });
    let result = await volunteerController.getDashboard(req.params.userId);
    res.send(result);
  } catch (error) { next(error); }
});
router.get('/volunteers/:userId/donations', authHandler.CheckLogin, async function (req, res, next) {
  try {
    if (!assertAccess(req.params.userId, req.authUser)) return res.status(403).send({ message: 'You do not have access to these donations.' });
    let result = await volunteerController.getDonations(req.params.userId);
    res.send(result);
  } catch (error) { next(error); }
});
router.get('/events/:eventId/comments', async function (req, res, next) {
  try { let result = await volunteerController.getEventComments(req.params.eventId); res.send(result); } catch (error) { next(error); }
});
router.post('/events/:eventId/comments', authHandler.CheckLogin, async function (req, res, next) {
  try { let result = await volunteerController.createEventComment(req.params.eventId, req.authUser.userId, req.authUser.fullName, req.body.content); res.status(201).send(result); } catch (error) { next(error); }
});
router.get('/events/:eventId/ratings', async function (req, res, next) {
  try { let result = await volunteerController.getEventRatings(req.params.eventId); res.send(result); } catch (error) { next(error); }
});
router.post('/events/:eventId/ratings', authHandler.CheckLogin, async function (req, res, next) {
  try {
    let result = await volunteerController.createOrUpdateRating(req.params.eventId, req.authUser.userId, req.authUser.fullName, req.body.rating, req.body.review);
    if (result.updated) { res.send(result); } else { res.status(201).send(result); }
  } catch (error) { next(error); }
});

module.exports = router;
