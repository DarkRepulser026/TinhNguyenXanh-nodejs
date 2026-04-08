var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var adminController = require('../controllers/adminController');

router.get('/admin/dashboard', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.getDashboard();
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/admin/events/approvals', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.getEventApprovals(req.query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.patch('/admin/events/:id/status', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.updateEventStatus(req.params.id, req.body.action);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/admin/organizations/approvals', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.getOrganizationApprovals(req.query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.patch('/admin/organizations/:id/status', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.updateOrganizationApprovalStatus(req.params.id, req.body.action);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/admin/users', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.getUsers(req.query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.patch('/admin/users/:id/status', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.updateUserStatus(req.authUser.userId, req.params.id, Boolean(req.body.isActive));
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.patch('/admin/users/:id/role', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.updateUserRole(req.params.id, req.body.role);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/admin/categories', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.getCategories(req.query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.post('/admin/categories', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.createCategory(req.body.name);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});
router.patch('/admin/categories/:id', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.updateCategory(req.params.id, req.body.name);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.delete('/admin/categories/:id', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.deleteCategory(req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/admin/moderation', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.getModerationSummary();
    res.send(result);
  } catch (error) {
    next(error);
  }
});
router.get('/admin/event-reports', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.getEventReports();
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/event-reports/:id/approve', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.approveReport(req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/event-reports/:id/reject', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.rejectReport(req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.get('/admin/donations', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.getDonations(req.query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/donations/:id/status', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.updateDonationStatus(req.params.id, req.body.status);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.get('/admin/registrations', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.getRegistrations(req.query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/registrations/:id/status', authHandler.CheckLogin, authHandler.CheckRole('Admin'), async function (req, res, next) {
  try {
    const result = await adminController.updateRegistrationStatusByAdmin(req.params.id, req.body.status);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
