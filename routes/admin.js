var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var db = require('../utils/db');

var prisma = db.prisma;

router.use('/admin', authHandler.requireAuth, authHandler.requireRole('Admin'));

function toPageParams(query, defaultPageSize) {
    var page = Math.max(1, Number(query.page || 1));
    var pageSize = Math.min(100, Math.max(1, Number(query.pageSize || defaultPageSize || 10)));
    return { page: page, pageSize: pageSize };
}

router.get('/admin/dashboard', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var totalUsers = await prisma.appUser.count();
            var activeUsers = await prisma.appUser.count({ where: { isActive: true } });
            var totalEvents = await prisma.event.count();
            var pendingApprovals = await prisma.event.count({ where: { status: { in: ['draft', 'pending'] } } });
            var totalOrganizations = await prisma.organization.count();
            var totalCategories = await prisma.eventCategory.count();
            var totalVolunteers = await prisma.volunteer.count();
            var pendingRegistrations = await prisma.eventRegistration.count({ where: { status: 'Pending' } });

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

            var rows = await prisma.event.findMany({
                where: {
                    status: {
                        in: ['draft', 'pending'],
                    },
                },
                include: {
                    organization: true,
                    category: true,
                },
            });

            rows = rows.filter(function (event) {
                if (!search) {
                    return true;
                }

                return (event.title || '').toLowerCase().includes(search) ||
                    (event.description || '').toLowerCase().includes(search) ||
                    (event.organization && (event.organization.name || '').toLowerCase().includes(search));
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
                    organizationId: event.organizationId,
                    organizationName: event.organization ? event.organization.name : null,
                    categoryId: event.categoryId,
                    categoryName: event.category ? event.category.name : null,
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

            var event = await prisma.event.findUnique({ where: { id: id } });
            if (!event) {
                res.status(404).send({ message: 'Event not found.' });
                return;
            }

            if (action === 'approve') {
                event = await prisma.event.update({ where: { id: event.id }, data: { status: 'approved' } });
            } else if (action === 'reject') {
                event = await prisma.event.update({ where: { id: event.id }, data: { status: 'rejected' } });
            } else {
                res.status(400).send({ message: "action must be 'approve' or 'reject'." });
                return;
            }

            res.send({ id: event.id, status: event.status });
        })
        .catch(next);
});

router.get('/admin/users', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
            var paging = toPageParams(req.query, 10);

            var rows = await prisma.appUser.findMany();

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

            var user = await prisma.appUser.findUnique({ where: { id: id } });
            if (!user) {
                res.status(404).send({ message: 'User not found.' });
                return;
            }

            user = await prisma.appUser.update({ where: { id: user.id }, data: { isActive: isActive } });
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

            var user = await prisma.appUser.findUnique({ where: { id: id } });
            if (!user) {
                res.status(404).send({ message: 'User not found.' });
                return;
            }

            user = await prisma.appUser.update({ where: { id: user.id }, data: { role: role } });
            res.send({ id: user.id, role: user.role });
        })
        .catch(next);
});

router.get('/admin/categories', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
            var paging = toPageParams(req.query, 10);

            var rows = await prisma.eventCategory.findMany();

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

            var item = await prisma.eventCategory.create({
                data: {
                    name: name,
                },
            });

            res.status(201).send(item);
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

            var item = await prisma.eventCategory.findUnique({ where: { id: id } });
            if (!item) {
                res.status(404).send({ message: 'Category not found.' });
                return;
            }

            item = await prisma.eventCategory.update({ where: { id: item.id }, data: { name: name } });
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

            var item = await prisma.eventCategory.findUnique({ where: { id: id } });
            if (!item) {
                res.status(404).send({ message: 'Category not found.' });
                return;
            }

            await prisma.eventCategory.delete({ where: { id: item.id } });
            res.send({ message: 'Category deleted.' });
        })
        .catch(next);
});

router.get('/admin/moderation', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var queue = await prisma.eventReport.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                take: 100,
            });

            var rejectedEvents = await prisma.event.count({ where: { status: 'rejected' } });
            var hiddenEvents = await prisma.event.count({ where: { isHidden: true } });
            var inactiveUsers = await prisma.appUser.count({ where: { isActive: false } });

            res.send({
                queue: queue,
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
