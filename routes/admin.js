var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var adminController = require('../controllers/adminController');

router.get('/admin/dashboard', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.getDashboard(); res.send(result); } catch (error) { next(error); }
});
router.get('/admin/events/approvals', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.getEventApprovals(req.query); res.send(result); } catch (error) { next(error); }
});
router.patch('/admin/events/:id/status', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.updateEventStatus(req.params.id, req.body.action); res.send(result); } catch (error) { next(error); }
});
router.get('/admin/users', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.getUsers(req.query); res.send(result); } catch (error) { next(error); }
});
router.patch('/admin/users/:id/status', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.updateUserStatus(req.authUser.userId, req.params.id, Boolean(req.body.isActive)); res.send(result); } catch (error) { next(error); }
});
router.patch('/admin/users/:id/role', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.updateUserRole(req.params.id, req.body.role); res.send(result); } catch (error) { next(error); }
});
router.get('/admin/categories', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.getCategories(req.query); res.send(result); } catch (error) { next(error); }
});
router.post('/admin/categories', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.createCategory(req.body.name); res.status(201).send(result); } catch (error) { next(error); }
});
router.patch('/admin/categories/:id', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.updateCategory(req.params.id, req.body.name); res.send(result); } catch (error) { next(error); }
});
router.delete('/admin/categories/:id', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.deleteCategory(req.params.id); res.send(result); } catch (error) { next(error); }
});
router.get('/admin/moderation', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try { let result = await adminController.getModerationSummary(); res.send(result); } catch (error) { next(error); }
});

module.exports = router;
