var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var models = require('../utils/models');
var mongo = require('../utils/mongo');

router.use('/admin', authHandler.requireAuth, authHandler.requireRole('Admin'));

function toPageParams(query, defaultPageSize) {
    var page = Math.max(1, Number(query.page || 1));
    var pageSize = Math.min(100, Math.max(1, Number(query.pageSize || defaultPageSize || 10)));
    return { page: page, pageSize: pageSize };
}

router.get('/admin/dashboard', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var totalUsers = await models.appUser.countDocuments({});
            var activeUsers = await models.appUser.countDocuments({ isActive: true });
            var totalEvents = await models.event.countDocuments({});
            var pendingApprovals = await models.event.countDocuments({ status: { $in: ['draft', 'pending'] } });
            var totalOrganizations = await models.organization.countDocuments({});
            var totalCategories = await models.eventCategory.countDocuments({});
            var totalVolunteers = await models.volunteer.countDocuments({});
            var pendingRegistrations = await models.eventRegistration.countDocuments({ status: 'Pending' });

            res.send({
                totalUsers: totalUsers,
                activeUsers: activeUsers,
                totalEvents: totalEvents,
                pendingApprovals: pendingApprovals,
                totalOrganizations: totalOrganizations,
                totalCategories: totalCategories,
                totalVolunteers: totalVolunteers,
                pendingRegistrations: pendingRegistrations,
            });
        })
        .catch(next);
});

router.get('/admin/events/approvals', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
            var paging = toPageParams(req.query, 10);

            var rows = await models.event
                .find({ status: { $in: ['draft', 'pending'] } })
                .populate('organizationId')
                .populate('categoryId')
                .lean();
            rows = mongo.toPlain(rows);

            rows = rows.filter(function (event) {
                if (!search) {
                    return true;
                }

                return (event.title || '').toLowerCase().includes(search) ||
                    (event.description || '').toLowerCase().includes(search) ||
                    (event.organizationId && (event.organizationId.name || '').toLowerCase().includes(search));
            });

            var totalCount = rows.length;
            var items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map(function (event) {
                return {
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    status: event.status,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    location: event.location,
                    organizationId: event.organizationId && event.organizationId.id ? event.organizationId.id : event.organizationId,
                    organizationName: event.organizationId && event.organizationId.name ? event.organizationId.name : null,
                    categoryId: event.categoryId && event.categoryId.id ? event.categoryId.id : event.categoryId,
                    categoryName: event.categoryId && event.categoryId.name ? event.categoryId.name : null,
                };
            });

            res.send({
                items: items,
                totalCount: totalCount,
                page: paging.page,
                pageSize: paging.pageSize,
                totalPages: Math.ceil(totalCount / paging.pageSize),
            });
        })
        .catch(next);
});

router.patch('/admin/events/:id/status', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
            var action = typeof req.body.action === 'string' ? req.body.action : '';

            if (!id) {
                res.status(400).send({ message: 'Invalid event id.' });
                return;
            }

            var event = await models.event.findOne({ _id: mongo.toObjectId(id) }).lean();
            event = mongo.toPlain(event);
            if (!event) {
                res.status(404).send({ message: 'Event not found.' });
                return;
            }

            if (action === 'approve') {
                event = await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: { status: 'approved' } }, { new: true }).lean();
            } else if (action === 'reject') {
                event = await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: { status: 'rejected' } }, { new: true }).lean();
            } else {
                res.status(400).send({ message: "action must be 'approve' or 'reject'." });
                return;
            }

            event = mongo.toPlain(event);
            res.send({ id: event.id, status: event.status });
        })
        .catch(next);
});

router.get('/admin/users', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
            var paging = toPageParams(req.query, 10);

            var rows = await models.appUser.find({}).lean();
            rows = mongo.toPlain(rows);

            rows = rows.filter(function (item) {
                if (!search) {
                    return true;
                }

                return (item.email || '').toLowerCase().includes(search) ||
                    (item.fullName || '').toLowerCase().includes(search) ||
                    (item.phone || '').toLowerCase().includes(search);
            });

            var totalCount = rows.length;
            var items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map(function (item) {
                return {
                    id: item.id,
                    email: item.email,
                    fullName: item.fullName,
                    phone: item.phone,
                    role: item.role,
                    isActive: item.isActive,
                    createdAt: item.createdAt,
                };
            });

            res.send({
                items: items,
                totalCount: totalCount,
                page: paging.page,
                pageSize: paging.pageSize,
                totalPages: Math.ceil(totalCount / paging.pageSize),
            });
        })
        .catch(next);
});

router.patch('/admin/users/:id/status', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
            var isActive = Boolean(req.body.isActive);

            if (!id) {
                res.status(400).send({ message: 'Invalid user id.' });
                return;
            }

            if (authUser.userId === id && !isActive) {
                res.status(400).send({ message: 'Admin cannot disable own account.' });
                return;
            }

            var user = await models.appUser.findOne({ _id: mongo.toObjectId(id) }).lean();
            user = mongo.toPlain(user);
            if (!user) {
                res.status(404).send({ message: 'User not found.' });
                return;
            }

            user = await models.appUser.findOneAndUpdate({ _id: mongo.toObjectId(user.id) }, { $set: { isActive: isActive } }, { new: true }).lean();
            user = mongo.toPlain(user);
            res.send({ id: user.id, isActive: user.isActive });
        })
        .catch(next);
});

router.patch('/admin/users/:id/role', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
            var role = typeof req.body.role === 'string' ? req.body.role : '';

            if (!(role === 'Admin' || role === 'Organizer' || role === 'Volunteer')) {
                res.status(400).send({ message: 'Invalid role.' });
                return;
            }

            var user = await models.appUser.findOne({ _id: mongo.toObjectId(id) }).lean();
            user = mongo.toPlain(user);
            if (!user) {
                res.status(404).send({ message: 'User not found.' });
                return;
            }

            user = await models.appUser.findOneAndUpdate({ _id: mongo.toObjectId(user.id) }, { $set: { role: role } }, { new: true }).lean();
            user = mongo.toPlain(user);
            res.send({ id: user.id, role: user.role });
        })
        .catch(next);
});

router.get('/admin/categories', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
            var paging = toPageParams(req.query, 10);

            var rows = await models.eventCategory.find({}).lean();
            rows = mongo.toPlain(rows);

            rows = rows.filter(function (item) {
                return !search || (item.name || '').toLowerCase().includes(search);
            });

            var totalCount = rows.length;
            var items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize);

            res.send({
                items: items,
                totalCount: totalCount,
                page: paging.page,
                pageSize: paging.pageSize,
                totalPages: Math.ceil(totalCount / paging.pageSize),
            });
        })
        .catch(next);
});

router.post('/admin/categories', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
            if (!name) {
                res.status(400).send({ message: 'Category name is required.' });
                return;
            }

            var item = await models.eventCategory.create({
                name: name,
            });

            res.status(201).send(mongo.toPlain(item.toObject()));
        })
        .catch(next);
});

router.patch('/admin/categories/:id', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
            var name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

            if (!id) {
                res.status(400).send({ message: 'Invalid category id.' });
                return;
            }

            if (!name) {
                res.status(400).send({ message: 'Category name is required.' });
                return;
            }

            var item = await models.eventCategory.findOne({ _id: mongo.toObjectId(id) }).lean();
            item = mongo.toPlain(item);
            if (!item) {
                res.status(404).send({ message: 'Category not found.' });
                return;
            }

            item = await models.eventCategory.findOneAndUpdate({ _id: mongo.toObjectId(item.id) }, { $set: { name: name } }, { new: true }).lean();
            item = mongo.toPlain(item);
            res.send(item);
        })
        .catch(next);
});

router.delete('/admin/categories/:id', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';

            if (!id) {
                res.status(400).send({ message: 'Invalid category id.' });
                return;
            }

            var item = await models.eventCategory.findOne({ _id: mongo.toObjectId(id) }).lean();
            item = mongo.toPlain(item);
            if (!item) {
                res.status(404).send({ message: 'Category not found.' });
                return;
            }

            await models.eventCategory.findOneAndDelete({ _id: mongo.toObjectId(item.id) });
            res.send({ message: 'Category deleted.' });
        })
        .catch(next);
});

router.get('/admin/moderation', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var queue = await models.eventReport.find({}).sort({ createdAt: -1 }).limit(100).lean();

            var rejectedEvents = await models.event.countDocuments({ status: 'rejected' });
            var hiddenEvents = await models.event.countDocuments({ isHidden: true });
            var inactiveUsers = await models.appUser.countDocuments({ isActive: false });

            res.send({
                queue: mongo.toPlain(queue),
                summary: {
                    rejectedEvents: rejectedEvents,
                    hiddenEvents: hiddenEvents,
                    inactiveUsers: inactiveUsers,
                },
                message: 'Moderation queue loaded.',
            });
        })
        .catch(next);
});

module.exports = router;
