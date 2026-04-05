var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var adminController = require('../controllers/adminController');

router.use('/admin', authHandler.requireAuth, authHandler.requireRole('Admin'));
router.get('/admin/dashboard', adminController.getDashboard);
router.get('/admin/events/approvals', adminController.getEventApprovals);
router.patch('/admin/events/:id/status', adminController.updateEventStatus);
router.get('/admin/users', adminController.getUsers);
router.patch('/admin/users/:id/status', adminController.updateUserStatus);
router.patch('/admin/users/:id/role', adminController.updateUserRole);
router.get('/admin/categories', adminController.getCategories);
router.post('/admin/categories', adminController.createCategory);
router.patch('/admin/categories/:id', adminController.updateCategory);
router.delete('/admin/categories/:id', adminController.deleteCategory);
router.get('/admin/moderation', adminController.getModerationSummary);

module.exports = router;
