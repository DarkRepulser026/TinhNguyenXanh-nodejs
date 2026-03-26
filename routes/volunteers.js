var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var models = require('../utils/models');
var mongo = require('../utils/mongo');

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

    var user = await models.appUser.findOne({ _id: mongo.toObjectId(userId) }).lean();
    user = mongo.toPlain(user);

    var volunteer = await models.volunteer.findOneAndUpdate(
        {
            userId: mongo.toObjectId(userId),
        },
        {
            $set: {
                fullName: user ? user.fullName : 'Volunteer',
                phone: user ? user.phone : null,
            },
        },
        { new: true }
    ).lean();

    if (!volunteer) {
        volunteer = await models.volunteer.create({
            userId: mongo.toObjectId(userId),
            fullName: user ? user.fullName : 'Volunteer',
            phone: user ? user.phone : null,
        });
        volunteer = volunteer.toObject();
    }

    volunteer = mongo.toPlain(volunteer);

    var totalEvents = await models.eventRegistration.countDocuments({ volunteerId: mongo.toObjectId(volunteer.id) });
    var completedEvents = await models.eventRegistration.countDocuments({ volunteerId: mongo.toObjectId(volunteer.id), status: 'Confirmed' });
    var pendingEvents = await models.eventRegistration.countDocuments({ volunteerId: mongo.toObjectId(volunteer.id), status: 'Pending' });
    var favoriteEvents = await models.eventFavorite.countDocuments({ volunteerId: mongo.toObjectId(volunteer.id) });

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

    var volunteer = await models.volunteer.findOne({ userId: mongo.toObjectId(userId) }).lean();
    volunteer = mongo.toPlain(volunteer);
    if (!volunteer) {
        res.send([]);
        return;
    }

    var rows = await models.eventRegistration
        .find({ volunteerId: mongo.toObjectId(volunteer.id) })
        .sort({ registeredAt: -1 })
        .populate('eventId')
        .lean();
    rows = mongo.toPlain(rows);

    rows = rows
        .map(function (item) {
            var event = item.eventId;
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

    var volunteer = await models.volunteer.findOne({ userId: mongo.toObjectId(userId) }).lean();
    volunteer = mongo.toPlain(volunteer);
    if (!volunteer || !registrationId) {
        res.status(404).send({ message: 'Registration not found.' });
        return;
    }

    var registration = await models.eventRegistration.findOne({
        _id: mongo.toObjectId(registrationId),
        volunteerId: mongo.toObjectId(volunteer.id),
    }).lean();
    registration = mongo.toPlain(registration);

    if (!registration) {
        res.status(404).send({ message: 'Registration not found.' });
        return;
    }

    await models.eventRegistration.findOneAndDelete({ _id: mongo.toObjectId(registration.id) });

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

    var volunteer = await models.volunteer.findOne({ userId: mongo.toObjectId(userId) }).lean();
    volunteer = mongo.toPlain(volunteer);
    if (!volunteer) {
        res.send([]);
        return;
    }

    var rows = await models.eventFavorite
        .find({ volunteerId: mongo.toObjectId(volunteer.id) })
        .sort({ createdAt: -1 })
        .populate({
            path: 'eventId',
            populate: {
                path: 'categoryId',
            },
        })
        .lean();
    rows = mongo.toPlain(rows);

    rows = rows
        .map(function (item) {
            var event = item.eventId;
            if (!event) {
                return null;
            }

            var category = event.categoryId;

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

    var volunteer = await models.volunteer.findOne({ userId: mongo.toObjectId(userId) }).lean();
    volunteer = mongo.toPlain(volunteer);
    if (!volunteer || !eventId) {
        res.status(404).send({ message: 'Favorite not found.' });
        return;
    }

    var favorite = await models.eventFavorite.findOne({
        eventId: mongo.toObjectId(eventId),
        volunteerId: mongo.toObjectId(volunteer.id),
    }).lean();
    favorite = mongo.toPlain(favorite);

    if (!favorite) {
        res.status(404).send({ message: 'Favorite not found.' });
        return;
    }

    await models.eventFavorite.findOneAndDelete({ _id: mongo.toObjectId(favorite.id) });

    res.send({ message: 'Favorite removed.' });
        })
        .catch(next);
});

module.exports = router;
