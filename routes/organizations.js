const express = require('express');
const router = express.Router();
const authHandler = require('../utils/authHandler');
const organizationController = require('../controllers/organizationController');

router.get('/organizations', async function (req, res, next) {
    try {
        const result = await organizationController.getOrganizations(req.query.keyword, req.query.city, req.query.page, req.query.pageSize);
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

router.post('/organizations/register', authHandler.requireAuth, async function (req, res, next) {
    try {
        const result = await organizationController.registerOrganization(req.authUser, req.body);
        res.status(201).send(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
