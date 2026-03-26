var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var db = require('../utils/db');

var prisma = db.prisma;

function toTrimmed(value) {
    if (Array.isArray(value)) {
        return (value[0] || '').trim();
    }

    return (value || '').trim();
}

function assertAccess(reqUserId, authUser) {
    return authUser && (reqUserId === authUser.userId || authUser.role === 'Admin');
}

router.get('/volunteers/:userId/profile', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;

    if (!assertAccess(userId, authUser)) {
        res.status(403).send({ message: 'You do not have access to this profile.' });
        return;
    }

    if (!userId) {
        res.status(400).send({ message: 'userId is required.' });
        return;
    }

    var user = await prisma.appUser.findUnique({
        where: {
            id: userId,
        },
    });

    var volunteer = await prisma.volunteer.upsert({
        where: {
            userId: userId,
        },
        create: {
            userId: userId,
            fullName: user ? user.fullName : 'Volunteer',
            phone: user ? user.phone : null,
        },
        update: {},
    });

    var totalEvents = await prisma.eventRegistration.count({ where: { volunteerId: volunteer.id } });
    var completedEvents = await prisma.eventRegistration.count({ where: { volunteerId: volunteer.id, status: 'Confirmed' } });
    var pendingEvents = await prisma.eventRegistration.count({ where: { volunteerId: volunteer.id, status: 'Pending' } });
    var favoriteEvents = await prisma.eventFavorite.count({ where: { volunteerId: volunteer.id } });

    res.send({
        userId: volunteer.userId,
        fullName: volunteer.fullName,
        phone: volunteer.phone,
        stats: {
            totalEvents: totalEvents,
            completedEvents: completedEvents,
            pendingEvents: pendingEvents,
            favoriteEvents: favoriteEvents,
        },
    });
        })
        .catch(next);
});

router.get('/volunteers/:userId/registrations', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;

    if (!assertAccess(userId, authUser)) {
        res.status(403).send({ message: 'You do not have access to these registrations.' });
        return;
    }

    var volunteer = await prisma.volunteer.findUnique({
        where: {
            userId: userId,
        },
    });
    if (!volunteer) {
        res.send([]);
        return;
    }

    var rows = await prisma.eventRegistration.findMany({
        where: {
            volunteerId: volunteer.id,
        },
        orderBy: {
            registeredAt: 'desc',
        },
        include: {
            event: true,
        },
    });

    rows = rows
        .map(function (item) {
            var event = item.event;
            if (!event) {
                return null;
            }

            return {
                id: item.id,
                eventId: item.eventId,
                eventTitle: event.title,
                thumbnail: event.images,
                registrationDate: item.registeredAt,
                status: item.status,
                eventLocation: event.location,
                eventDate: event.startTime,
            };
        })
        .filter(function (item) { return !!item; });

    res.send(rows);
        })
        .catch(next);
});

router.delete('/volunteers/:userId/registrations/:registrationId', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;
    var registrationId = toTrimmed(req.params.registrationId);

    if (!assertAccess(userId, authUser)) {
        res.status(403).send({ message: 'You do not have access to these registrations.' });
        return;
    }

    var volunteer = await prisma.volunteer.findUnique({ where: { userId: userId } });
    if (!volunteer || !registrationId) {
        res.status(404).send({ message: 'Registration not found.' });
        return;
    }

    var registration = await prisma.eventRegistration.findFirst({
        where: {
            id: registrationId,
            volunteerId: volunteer.id,
        },
    });

    if (!registration) {
        res.status(404).send({ message: 'Registration not found.' });
        return;
    }

    await prisma.eventRegistration.delete({
        where: {
            id: registration.id,
        },
    });

    res.send({ message: 'Registration removed.' });
        })
        .catch(next);
});

router.get('/volunteers/:userId/favorites', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;

    if (!assertAccess(userId, authUser)) {
        res.status(403).send({ message: 'You do not have access to these favorites.' });
        return;
    }

    var volunteer = await prisma.volunteer.findUnique({ where: { userId: userId } });
    if (!volunteer) {
        res.send([]);
        return;
    }

    var rows = await prisma.eventFavorite.findMany({
        where: {
            volunteerId: volunteer.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            event: {
                include: {
                    category: true,
                },
            },
        },
    });

    rows = rows
        .map(function (item) {
            var event = item.event;
            if (!event) {
                return null;
            }

            var category = event.category;

            return {
                id: event.id,
                title: event.title,
                thumbnail: event.images,
                category: category ? category.name : 'Chung',
                location: event.location,
                date: event.startTime,
                status: event.status,
            };
        })
        .filter(function (item) { return !!item; });

    res.send(rows);
        })
        .catch(next);
});

router.delete('/volunteers/:userId/favorites/:eventId', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;
    var eventId = toTrimmed(req.params.eventId);

    if (!assertAccess(userId, authUser)) {
        res.status(403).send({ message: 'You do not have access to these favorites.' });
        return;
    }

    var volunteer = await prisma.volunteer.findUnique({ where: { userId: userId } });
    if (!volunteer || !eventId) {
        res.status(404).send({ message: 'Favorite not found.' });
        return;
    }

    var favorite = await prisma.eventFavorite.findUnique({
        where: {
            eventId_volunteerId: {
                eventId: eventId,
                volunteerId: volunteer.id,
            },
        },
    });

    if (!favorite) {
        res.status(404).send({ message: 'Favorite not found.' });
        return;
    }

    await prisma.eventFavorite.delete({
        where: {
            id: favorite.id,
        },
    });

    res.send({ message: 'Favorite removed.' });
        })
        .catch(next);
});

module.exports = router;
