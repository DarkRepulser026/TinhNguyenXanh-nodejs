var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var adminController = require('../controllers/adminController');

router.use('/admin', authHandler.requireAuth, authHandler.requireRole('Admin'));
router.get('/admin/dashboard', async function (req, res, next) {
	try {
		const result = await adminController.getDashboard();
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/admin/events/approvals', async function (req, res, next) {
	try {
		const result = await adminController.getEventApprovals(req.query.search, req.query.page, req.query.pageSize);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.patch('/admin/events/:id/status', async function (req, res, next) {
	try {
		const result = await adminController.updateEventStatus(req.params.id, req.body.action);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/admin/users', async function (req, res, next) {
	try {
		const result = await adminController.getUsers(req.query.search, req.query.page, req.query.pageSize);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.patch('/admin/users/:id/status', async function (req, res, next) {
	try {
		const result = await adminController.updateUserStatus(req.params.id, req.body.isActive, req.authUser);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.patch('/admin/users/:id/role', async function (req, res, next) {
	try {
		const result = await adminController.updateUserRole(req.params.id, req.body.role);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/admin/categories', async function (req, res, next) {
	try {
		const result = await adminController.getCategories(req.query.search, req.query.page, req.query.pageSize);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.post('/admin/categories', async function (req, res, next) {
	try {
		const result = await adminController.createCategory(req.body.name);
		res.status(201).send(result);
	} catch (error) {
		next(error);
	}
});

router.patch('/admin/categories/:id', async function (req, res, next) {
	try {
		const result = await adminController.updateCategory(req.params.id, req.body.name);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.delete('/admin/categories/:id', async function (req, res, next) {
	try {
		const result = await adminController.deleteCategory(req.params.id);
		res.send(result);
	} catch (error) {
		next(error);
	}
});

router.get('/admin/moderation', async function (req, res, next) {
	try {
		const result = await adminController.getModerationSummary();
		res.send(result);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
