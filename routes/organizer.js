var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var db = require('../utils/db');

var prisma = db.prisma;

router.use('/organizer', authHandler.requireAuth, authHandler.requireRole('Organizer', 'Admin'));

function toPageParams(query, defaultPageSize) {
    var page = Math.max(1, Number(query.page || 1));
    var pageSize = Math.min(100, Math.max(1, Number(query.pageSize || defaultPageSize || 10)));
    return { page: page, pageSize: pageSize };
}

async function getOwnedOrganization(userId) {
    return prisma.organization.findFirst({
        where: {
            ownerUserId: userId,
        },
    });
}

router.get('/organizer/dashboard', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            var events = await prisma.event.findMany({
                where: {
                    organizationId: organization.id,
                },
                select: {
                    id: true,
                    status: true,
                },
            });

            var eventIds = events.map(function (item) { return item.id; });
            var relatedRegistrations = await prisma.eventRegistration.findMany({
                where: {
                    eventId: {
                        in: eventIds,
                    },
                },
                select: {
                    status: true,
                },
            });

            res.send({
                organization: {
                    id: organization.id,
                    name: organization.name,
                },
                metrics: {
                    totalEvents: events.length,
                    approvedEvents: events.filter(function (item) { return item.status === 'approved'; }).length,
                    pendingEvents: events.filter(function (item) { return item.status === 'pending'; }).length,
                    draftEvents: events.filter(function (item) { return item.status === 'draft'; }).length,
                    totalRegistrations: relatedRegistrations.length,
                    pendingRegistrations: relatedRegistrations.filter(function (item) { return item.status === 'Pending'; }).length,
                    confirmedRegistrations: relatedRegistrations.filter(function (item) { return item.status === 'Confirmed'; }).length,
                },
            });
        })
        .catch(next);
});

router.get('/organizer/organization', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            res.send(organization);
        })
        .catch(next);
});

router.patch('/organizer/organization', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            var payload = {
                name: typeof req.body.name === 'string' ? req.body.name.trim() : organization.name,
                description: typeof req.body.description === 'string' ? req.body.description.trim() : organization.description,
                city: typeof req.body.city === 'string' ? req.body.city.trim() : organization.city,
                district: typeof req.body.district === 'string' ? req.body.district.trim() : organization.district,
                address: typeof req.body.address === 'string' ? req.body.address.trim() : organization.address,
                contactEmail: typeof req.body.contactEmail === 'string' ? req.body.contactEmail.trim().toLowerCase() : organization.contactEmail,
                phoneNumber: typeof req.body.phoneNumber === 'string' ? req.body.phoneNumber.trim() : organization.phoneNumber,
                website: typeof req.body.website === 'string' ? req.body.website.trim() : organization.website,
                organizationType: typeof req.body.organizationType === 'string' ? req.body.organizationType.trim() : organization.organizationType,
            };

            if (!payload.name) {
                res.status(400).send({ message: 'Organization name is required.' });
                return;
            }

            var updated = await prisma.organization.update({
                where: {
                    id: organization.id,
                },
                data: payload,
            });

            res.send(updated);
        })
        .catch(next);
});

router.post('/organizer/organization/claim', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organizationId = typeof req.body.organizationId === 'string' ? req.body.organizationId.trim() : '';

            if (!organizationId) {
                res.status(400).send({ message: 'organizationId is required.' });
                return;
            }

            var org = await prisma.organization.findUnique({ where: { id: organizationId } });

            if (!org) {
                res.status(404).send({ message: 'Organization not found.' });
                return;
            }

            org = await prisma.organization.update({
                where: {
                    id: org.id,
                },
                data: {
                    ownerUserId: authUser.userId,
                },
            });

            res.send(org);
        })
        .catch(next);
});

router.get('/organizer/events', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            var search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
            var status = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : '';
            var paging = toPageParams(req.query, 10);

            var rows = await prisma.event.findMany({
                where: {
                    organizationId: organization.id,
                },
                include: {
                    category: true,
                    registrations: {
                        select: {
                            status: true,
                        },
                    },
                },
            });

            rows = rows.filter(function (event) {
                var searchOk = !search ||
                    (event.title || '').toLowerCase().includes(search) ||
                    (event.description || '').toLowerCase().includes(search) ||
                    (event.location || '').toLowerCase().includes(search);
                var statusOk = !status || event.status === status;
                return searchOk && statusOk;
            });

            var totalCount = rows.length;
            var items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map(function (event) {
                var registrationCount = event.registrations.filter(function (item) {
                    return item.status === 'Pending' || item.status === 'Confirmed';
                }).length;

                return {
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    location: event.location,
                    status: event.status,
                    maxVolunteers: event.maxVolunteers,
                    categoryId: event.categoryId,
                    categoryName: event.category ? event.category.name : null,
                    registrationCount: registrationCount,
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

router.get('/organizer/events/:id', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            if (!id) {
                res.status(400).send({ message: 'Invalid event id.' });
                return;
            }

            var event = await prisma.event.findFirst({
                where: {
                    id: id,
                    organizationId: organization.id,
                },
                include: {
                    category: true,
                },
            });

            if (!event) {
                res.status(404).send({ message: 'Event not found.' });
                return;
            }

            res.send({
                id: event.id,
                title: event.title,
                description: event.description,
                startTime: event.startTime,
                endTime: event.endTime,
                location: event.location,
                status: event.status,
                maxVolunteers: event.maxVolunteers,
                images: event.images,
                categoryId: event.categoryId,
                categoryName: event.category ? event.category.name : null,
            });
        })
        .catch(next);
});

router.post('/organizer/events', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            var title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
            var description = typeof req.body.description === 'string' ? req.body.description.trim() : null;
            var location = typeof req.body.location === 'string' ? req.body.location.trim() : null;
            var categoryId = typeof req.body.categoryId === 'string' ? req.body.categoryId.trim() : null;
            var maxVolunteers = Number(req.body.maxVolunteers);
            var startTime = new Date(req.body.startTime);
            var endTime = new Date(req.body.endTime);

            if (!title || !Number.isFinite(startTime.valueOf()) || !Number.isFinite(endTime.valueOf())) {
                res.status(400).send({ message: 'title, startTime, and endTime are required.' });
                return;
            }

            if (endTime <= startTime) {
                res.status(400).send({ message: 'endTime must be later than startTime.' });
                return;
            }

            var event = await prisma.event.create({
                data: {
                    title: title,
                    description: description,
                    location: location,
                    categoryId: categoryId || null,
                    maxVolunteers: Number.isFinite(maxVolunteers) && maxVolunteers >= 0 ? maxVolunteers : 0,
                    startTime: startTime,
                    endTime: endTime,
                    organizationId: organization.id,
                    status: 'draft',
                    images: null,
                    isHidden: false,
                },
            });

            res.status(201).send(event);
        })
        .catch(next);
});

router.patch('/organizer/events/:id', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            if (!id) {
                res.status(400).send({ message: 'Invalid event id.' });
                return;
            }

            var event = await prisma.event.findFirst({
                where: {
                    id: id,
                    organizationId: organization.id,
                },
            });

            if (!event) {
                res.status(404).send({ message: 'Event not found.' });
                return;
            }

            var data = {};
            if (typeof req.body.title === 'string') {
                data.title = req.body.title.trim();
            }
            if (typeof req.body.description === 'string') {
                data.description = req.body.description.trim();
            }
            if (typeof req.body.location === 'string') {
                data.location = req.body.location.trim();
            }
            if (typeof req.body.categoryId === 'string') {
                data.categoryId = req.body.categoryId.trim() || null;
            }
            if (Number.isFinite(Number(req.body.maxVolunteers))) {
                data.maxVolunteers = Number(req.body.maxVolunteers);
            }
            if (req.body.startTime && Number.isFinite(new Date(req.body.startTime).valueOf())) {
                data.startTime = new Date(req.body.startTime);
            }
            if (req.body.endTime && Number.isFinite(new Date(req.body.endTime).valueOf())) {
                data.endTime = new Date(req.body.endTime);
            }

            event = await prisma.event.update({
                where: {
                    id: event.id,
                },
                data: data,
            });

            res.send(event);
        })
        .catch(next);
});

router.post('/organizer/events/:id/hide', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            var event = await prisma.event.findFirst({
                where: {
                    id: id,
                    organizationId: organization.id,
                },
            });

            if (!event) {
                res.status(404).send({ message: 'Event not found.' });
                return;
            }

            event = await prisma.event.update({ where: { id: event.id }, data: { isHidden: true } });
            res.send({ id: event.id, status: event.status, isHidden: event.isHidden });
        })
        .catch(next);
});

router.post('/organizer/events/:id/unhide', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            var event = await prisma.event.findFirst({
                where: {
                    id: id,
                    organizationId: organization.id,
                },
            });

            if (!event) {
                res.status(404).send({ message: 'Event not found.' });
                return;
            }

            event = await prisma.event.update({ where: { id: event.id }, data: { isHidden: false } });
            res.send({ id: event.id, status: event.status, isHidden: event.isHidden });
        })
        .catch(next);
});

router.get('/organizer/volunteers', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            var eventId = typeof req.query.eventId === 'string' ? req.query.eventId.trim() : '';
            var search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
            var status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
            var paging = toPageParams(req.query, 10);

            var ownedEvents = await prisma.event.findMany({
                where: {
                    organizationId: organization.id,
                },
                select: {
                    id: true,
                },
            });
            var ownedEventIds = ownedEvents.map(function (item) { return item.id; });

            var rows = await prisma.eventRegistration.findMany({
                where: {
                    eventId: {
                        in: ownedEventIds,
                    },
                },
                include: {
                    event: true,
                    volunteer: true,
                },
                orderBy: {
                    registeredAt: 'desc',
                },
            });

            rows = rows.filter(function (item) {
                if (eventId && item.eventId !== eventId) {
                    return false;
                }

                if (status && item.status !== status) {
                    return false;
                }

                if (!search) {
                    return true;
                }

                return (item.fullName || '').toLowerCase().includes(search) ||
                    (item.phone || '').toLowerCase().includes(search) ||
                    (item.volunteer && (item.volunteer.fullName || '').toLowerCase().includes(search));
            });

            var totalCount = rows.length;
            var items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map(function (item) {
                var event = item.event;
                var volunteer = item.volunteer;

                return {
                    id: item.id,
                    status: item.status,
                    fullName: item.fullName,
                    phone: item.phone,
                    reason: item.reason,
                    registeredAt: item.registeredAt,
                    event: {
                        id: item.eventId,
                        title: event ? event.title : '',
                        startTime: event ? event.startTime : null,
                        location: event ? event.location : null,
                    },
                    volunteer: {
                        id: volunteer ? volunteer.id : null,
                        userId: volunteer ? volunteer.userId : null,
                        fullName: volunteer ? volunteer.fullName : item.fullName,
                        phone: volunteer ? volunteer.phone : item.phone,
                    },
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

router.patch('/organizer/registrations/:id/status', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var organization = await getOwnedOrganization(authUser.userId);
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
            var action = typeof req.body.action === 'string' ? req.body.action : '';

            if (!organization) {
                res.status(404).send({ message: 'Organizer organization profile not found.' });
                return;
            }

            if (!id) {
                res.status(400).send({ message: 'Invalid registration id.' });
                return;
            }

            var registration = await prisma.eventRegistration.findUnique({
                where: {
                    id: id,
                },
                include: {
                    event: true,
                },
            });

            if (!registration) {
                res.status(404).send({ message: 'Registration not found.' });
                return;
            }

            var event = registration.event;

            if (!event || event.organizationId !== organization.id) {
                res.status(403).send({ message: 'You do not have access to this registration.' });
                return;
            }

            if (action === 'approve') {
                registration = await prisma.eventRegistration.update({ where: { id: registration.id }, data: { status: 'Confirmed' } });
            } else if (action === 'reject') {
                registration = await prisma.eventRegistration.update({ where: { id: registration.id }, data: { status: 'Rejected' } });
            } else {
                res.status(400).send({ message: "action must be 'approve' or 'reject'." });
                return;
            }

            res.send({ id: registration.id, status: registration.status });
        })
        .catch(next);
});

module.exports = router;
