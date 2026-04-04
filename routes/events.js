var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var models = require('../utils/models');
var mongo = require('../utils/mongo');

function toViewEvent(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        startTime: row.startTime,
        endTime: row.endTime,
        location: row.location,
        organizationName: row.organizationName,
        categoryName: row.categoryName,
        registeredCount: row.registeredCount,
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

    var docs = await models.event
        .find({
            status: 'approved',
            isHidden: false,
        })
        .populate('organizationId')
        .populate('categoryId')
        .lean();

    var eventIds = docs.map(function (item) { return item._id; });
    var registrationRows = await models.eventRegistration
        .find({
            eventId: { $in: eventIds },
            status: { $in: ['Pending', 'Confirmed'] },
        })
        .select('eventId')
        .lean();

    var registrationCountByEventId = {};
    registrationRows.forEach(function (item) {
        var key = String(item.eventId);
        registrationCountByEventId[key] = (registrationCountByEventId[key] || 0) + 1;
    });

    var rows = mongo.toPlain(docs).map(function (item) {
        return {
            id: item.id,
            title: item.title,
            description: item.description,
            startTime: item.startTime,
            endTime: item.endTime,
            location: item.location,
            status: item.status,
            maxVolunteers: item.maxVolunteers,
            images: item.images || item.image || null,
            organizationId: item.organizationId && item.organizationId.id ? item.organizationId.id : item.organizationId,
            organizationName: item.organizationId && item.organizationId.name ? item.organizationId.name : null,
            categoryId: item.categoryId && item.categoryId.id ? item.categoryId.id : item.categoryId,
            categoryName: item.categoryId && item.categoryId.name ? item.categoryId.name : null,
            registeredCount: registrationCountByEventId[item.id] || 0,
        };
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

    var row = await models.event
        .findOne({ _id: mongo.toObjectId(id) })
        .populate('organizationId')
        .populate('categoryId')
        .lean();
    row = mongo.toPlain(row);

    if (!row || row.isHidden || row.status !== 'approved') {
        res.status(404).send({ message: 'Event not found.' });
        return;
    }

    var registeredCount = await models.eventRegistration.countDocuments({
        eventId: mongo.toObjectId(row.id),
        status: { $in: ['Pending', 'Confirmed'] },
    });

    res.send({
        id: row.id,
        title: row.title,
        description: row.description,
        startTime: row.startTime,
        endTime: row.endTime,
        location: row.location,
        organizationId: row.organizationId && row.organizationId.id ? row.organizationId.id : row.organizationId,
        organizationName: row.organizationId && row.organizationId.name ? row.organizationId.name : null,
        categoryId: row.categoryId && row.categoryId.id ? row.categoryId.id : row.categoryId,
        categoryName: row.categoryId && row.categoryId.name ? row.categoryId.name : null,
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

            var event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
            event = mongo.toPlain(event);

            if (!event || event.status !== 'approved' || event.isHidden) {
                res.status(404).send({ message: 'Event not available for registration.' });
                return;
            }

            var user = await models.appUser.findOne({ _id: mongo.toObjectId(authUser.userId) }).lean();
            user = mongo.toPlain(user);

            var volunteer = await models.volunteer.findOneAndUpdate(
                {
                    userId: mongo.toObjectId(authUser.userId),
                },
                {
                    $set: {
                        fullName: typeof req.body.fullName === 'string' ? req.body.fullName : (user ? user.fullName : 'Volunteer'),
                        phone: typeof req.body.phone === 'string' ? req.body.phone : (user ? user.phone : null),
                    },
                },
                { new: true }
            ).lean();

            if (!volunteer) {
                volunteer = await models.volunteer.create({
                    userId: mongo.toObjectId(authUser.userId),
                    fullName: typeof req.body.fullName === 'string' ? req.body.fullName : (user ? user.fullName : 'Volunteer'),
                    phone: typeof req.body.phone === 'string' ? req.body.phone : (user ? user.phone : null),
                });
                volunteer = volunteer.toObject();
            }

            volunteer = mongo.toPlain(volunteer);

            var existing = await models.eventRegistration.findOne({
                eventId: mongo.toObjectId(eventId),
                volunteerId: mongo.toObjectId(volunteer.id),
            }).lean();

            if (existing) {
                res.status(409).send({ message: 'Already registered.' });
                return;
            }

            var activeCount = await models.eventRegistration.countDocuments({
                eventId: mongo.toObjectId(eventId),
                status: {
                    $in: ['Pending', 'Confirmed'],
                },
            });

            if (activeCount >= event.maxVolunteers) {
                res.status(400).send({ message: 'Event is full.' });
                return;
            }

            await models.eventRegistration.create({
                eventId: mongo.toObjectId(eventId),
                volunteerId: mongo.toObjectId(volunteer.id),
                fullName: volunteer.fullName,
                phone: volunteer.phone,
                reason: typeof req.body.reason === 'string' ? req.body.reason.trim() : null,
                status: 'Pending',
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

            var event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
            event = mongo.toPlain(event);

            if (!event || event.isHidden) {
                res.status(404).send({ message: 'Event not found.' });
                return;
            }

            var volunteer = await models.volunteer.findOneAndUpdate(
                {
                    userId: mongo.toObjectId(authUser.userId),
                },
                {
                    $set: {
                        fullName: 'Volunteer',
                        phone: null,
                    },
                },
                { new: true }
            ).lean();

            if (!volunteer) {
                volunteer = await models.volunteer.create({
                    userId: mongo.toObjectId(authUser.userId),
                    fullName: 'Volunteer',
                    phone: null,
                });
                volunteer = volunteer.toObject();
            }

            volunteer = mongo.toPlain(volunteer);

            var existing = await models.eventFavorite.findOne({
                eventId: mongo.toObjectId(eventId),
                volunteerId: mongo.toObjectId(volunteer.id),
            }).lean();
            existing = mongo.toPlain(existing);

            if (existing) {
                await models.eventFavorite.findOneAndDelete({ _id: mongo.toObjectId(existing.id) });
                res.send({ status: 'removed', isFavorited: false });
                return;
            }

            await models.eventFavorite.create({
                eventId: mongo.toObjectId(eventId),
                volunteerId: mongo.toObjectId(volunteer.id),
            });

            res.status(201).send({ status: 'added', isFavorited: true });
        })
        .catch(next);
});

module.exports = router;
