var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var db = require('../utils/db');

var prisma = db.prisma;

function toViewEvent(row) {
    var registeredCount = row.registrations.filter(function (item) {
        return item.status === 'Pending' || item.status === 'Confirmed';
    }).length;

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        startTime: row.startTime,
        endTime: row.endTime,
        location: row.location,
        organizationName: row.organization ? row.organization.name : null,
        categoryName: row.category ? row.category.name : null,
        registeredCount: registeredCount,
        maxVolunteers: row.maxVolunteers,
        images: row.images,
        status: row.status,
    };
}

router.get('/events', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
    var location = typeof req.query.location === 'string' ? req.query.location.trim().toLowerCase() : '';
    var category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    var page = Math.max(1, Number(req.query.page || 1));
    var pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 12)));

    var rows = await prisma.event.findMany({
        where: {
            status: 'approved',
            isHidden: false,
        },
        include: {
            organization: true,
            category: true,
            registrations: {
                select: {
                    status: true,
                },
            },
        },
    });

    rows = rows.filter(function (item) {
        var keywordOk = !keyword ||
            (item.title || '').toLowerCase().includes(keyword) ||
            (item.description || '').toLowerCase().includes(keyword);
        var locationOk = !location || (item.location || '').toLowerCase().includes(location);
        var categoryOk = !category || item.categoryId === category;
        return keywordOk && locationOk && categoryOk;
    });

    var totalCount = rows.length;
    var paged = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

    var items = paged.map(toViewEvent);

    res.send({
        items: items,
        totalCount: totalCount,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
    });
        })
        .catch(next);
});

router.get('/events/:id', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
        res.status(400).send({ message: 'Invalid event id.' });
        return;
    }

    var row = await prisma.event.findUnique({
        where: {
            id: id,
        },
        include: {
            organization: true,
            category: true,
            registrations: {
                select: {
                    status: true,
                },
            },
        },
    });

    if (!row || row.isHidden || row.status !== 'approved') {
        res.status(404).send({ message: 'Event not found.' });
        return;
    }

    var registeredCount = row.registrations.filter(function (item) {
        return item.status === 'Pending' || item.status === 'Confirmed';
    }).length;

    res.send({
        id: row.id,
        title: row.title,
        description: row.description,
        startTime: row.startTime,
        endTime: row.endTime,
        location: row.location,
        organizationId: row.organizationId,
        organizationName: row.organization ? row.organization.name : null,
        categoryId: row.categoryId,
        categoryName: row.category ? row.category.name : null,
        registeredCount: registeredCount,
        maxVolunteers: row.maxVolunteers,
        images: row.images,
        status: row.status,
    });
        })
        .catch(next);
});

router.post('/events/:id/register', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var eventId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
            var authUser = req.authUser;

            if (!eventId || !authUser) {
                res.status(400).send({ message: 'eventId and userId are required.' });
                return;
            }

            var event = await prisma.event.findUnique({
                where: {
                    id: eventId,
                },
            });

            if (!event || event.status !== 'approved' || event.isHidden) {
                res.status(404).send({ message: 'Event not available for registration.' });
                return;
            }

            var user = await prisma.appUser.findUnique({ where: { id: authUser.userId } });

            var volunteer = await prisma.volunteer.upsert({
                where: {
                    userId: authUser.userId,
                },
                create: {
                    userId: authUser.userId,
                    fullName: typeof req.body.fullName === 'string' ? req.body.fullName : (user ? user.fullName : 'Volunteer'),
                    phone: typeof req.body.phone === 'string' ? req.body.phone : (user ? user.phone : null),
                },
                update: {
                    fullName: typeof req.body.fullName === 'string' ? req.body.fullName : (user ? user.fullName : 'Volunteer'),
                    phone: typeof req.body.phone === 'string' ? req.body.phone : (user ? user.phone : null),
                },
            });

            var existing = await prisma.eventRegistration.findUnique({
                where: {
                    eventId_volunteerId: {
                        eventId: eventId,
                        volunteerId: volunteer.id,
                    },
                },
            });

            if (existing) {
                res.status(409).send({ message: 'Already registered.' });
                return;
            }

            var activeCount = await prisma.eventRegistration.count({
                where: {
                    eventId: eventId,
                    status: {
                        in: ['Pending', 'Confirmed'],
                    },
                },
            });

            if (activeCount >= event.maxVolunteers) {
                res.status(400).send({ message: 'Event is full.' });
                return;
            }

            await prisma.eventRegistration.create({
                data: {
                    eventId: eventId,
                    volunteerId: volunteer.id,
                    fullName: volunteer.fullName,
                    phone: volunteer.phone,
                    reason: typeof req.body.reason === 'string' ? req.body.reason.trim() : null,
                    status: 'Pending',
                },
            });

            res.status(201).send({ message: 'Registration created.' });
        })
        .catch(next);
});

router.post('/events/:id/favorite', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var eventId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
            var authUser = req.authUser;

            if (!eventId || !authUser) {
                res.status(400).send({ message: 'eventId and userId are required.' });
                return;
            }

            var event = await prisma.event.findUnique({
                where: {
                    id: eventId,
                },
            });

            if (!event || event.isHidden) {
                res.status(404).send({ message: 'Event not found.' });
                return;
            }

            var volunteer = await prisma.volunteer.upsert({
                where: {
                    userId: authUser.userId,
                },
                create: {
                    userId: authUser.userId,
                    fullName: 'Volunteer',
                    phone: null,
                },
                update: {},
            });

            var existing = await prisma.eventFavorite.findUnique({
                where: {
                    eventId_volunteerId: {
                        eventId: eventId,
                        volunteerId: volunteer.id,
                    },
                },
            });

            if (existing) {
                await prisma.eventFavorite.delete({
                    where: {
                        id: existing.id,
                    },
                });
                res.send({ status: 'removed', isFavorited: false });
                return;
            }

            await prisma.eventFavorite.create({
                data: {
                    eventId: eventId,
                    volunteerId: volunteer.id,
                },
            });

            res.status(201).send({ status: 'added', isFavorited: true });
        })
        .catch(next);
});

module.exports = router;
