var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var organizationController = require('../controllers/organizationController');

router.get('/organizations', organizationController.getOrganizations);
router.get('/organizations/:id', organizationController.getOrganizationById);
router.post('/organizations/register', authHandler.requireAuth, organizationController.registerOrganization);

module.exports = router;
