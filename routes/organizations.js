var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var organizationController = require('../controllers/organizationController');

router.get('/organizations', async function (req, res, next) {
  try {
    const result = await organizationController.getOrganizations(req.query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/organizations/:id', async function (req, res, next) {
  try {
    const result = await organizationController.getOrganizationById(req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post('/organizations/register', authHandler.CheckLogin, async function (req, res, next) {
  try {
    const result = await organizationController.registerOrganization(req.authUser.userId, req.body);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
