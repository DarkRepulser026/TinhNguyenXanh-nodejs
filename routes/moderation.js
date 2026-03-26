var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var models = require('../utils/models');
var mongo = require('../utils/mongo');

router.get('/events/:id/comments', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var eventId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!eventId) {
        res.status(400).send({ code: 'INVALID_EVENT_ID', message: 'Invalid event id.' });
        return;
    }

    var event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);

    if (!event || event.isHidden) {
        res.status(404).send({ code: 'EVENT_NOT_FOUND', message: 'Event not found.' });
        return;
    }

    var items = await models.eventComment
        .find({
            eventId: mongo.toObjectId(eventId),
            isHidden: false,
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    items = mongo.toPlain(items);

    res.send({
        items: items,
        totalCount: items.length,
    });
        })
        .catch(next);
});

router.post('/events/:id/comments', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var authUser = req.authUser;
    var eventId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    var content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

    if (!eventId) {
        res.status(400).send({ code: 'INVALID_EVENT_ID', message: 'Invalid event id.' });
        return;
    }

    if (!content) {
        res.status(400).send({ code: 'COMMENT_CONTENT_REQUIRED', message: 'content is required.' });
        return;
    }

    var event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);

    if (!event || event.isHidden) {
        res.status(404).send({ code: 'EVENT_NOT_FOUND', message: 'Event not found.' });
        return;
    }

    var row = await models.eventComment.create({
        eventId: mongo.toObjectId(eventId),
        userId: mongo.toObjectId(authUser.userId),
        content: content,
        isHidden: false,
    });
    row = mongo.toPlain(row.toObject());

    res.status(201).send(row);
        })
        .catch(next);
});

router.get('/organizations/:id/reviews', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var organizationId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!organizationId) {
        res.status(400).send({ code: 'INVALID_ORGANIZATION_ID', message: 'Invalid organization id.' });
        return;
    }

    var org = await models.organization.findOne({ _id: mongo.toObjectId(organizationId) }).lean();
    org = mongo.toPlain(org);

    if (!org) {
        res.status(404).send({ code: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found.' });
        return;
    }

    var items = await models.organizationReview
        .find({
            organizationId: mongo.toObjectId(organizationId),
            status: 'Approved',
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    items = mongo.toPlain(items);

    var averageRating = 0;
    if (items.length > 0) {
        averageRating = items.reduce(function (sum, item) {
            return sum + item.rating;
        }, 0) / items.length;
    }

    res.send({
        items: items,
        totalCount: items.length,
        averageRating: averageRating,
    });
        })
        .catch(next);
});

router.post('/organizations/:id/reviews', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var authUser = req.authUser;
    var organizationId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    var rating = Number(req.body.rating);
    var title = typeof req.body.title === 'string' ? req.body.title.trim() : null;
    var content = typeof req.body.content === 'string' ? req.body.content.trim() : null;

    if (!organizationId) {
        res.status(400).send({ code: 'INVALID_ORGANIZATION_ID', message: 'Invalid organization id.' });
        return;
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        res.status(400).send({ code: 'INVALID_REVIEW_RATING', message: 'rating must be between 1 and 5.' });
        return;
    }

    var org = await models.organization.findOne({ _id: mongo.toObjectId(organizationId) }).lean();
    org = mongo.toPlain(org);

    if (!org) {
        res.status(404).send({ code: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found.' });
        return;
    }

    var existing = await models.organizationReview.findOne({
        organizationId: mongo.toObjectId(organizationId),
        userId: mongo.toObjectId(authUser.userId),
    }).lean();
    existing = mongo.toPlain(existing);

    if (!existing) {
        existing = await models.organizationReview.create({
            organizationId: mongo.toObjectId(organizationId),
            userId: mongo.toObjectId(authUser.userId),
            rating: rating,
            title: title,
            content: content,
            status: 'Pending',
        });
        existing = mongo.toPlain(existing.toObject());
    } else {
        existing = await models.organizationReview.findOneAndUpdate(
            {
                _id: mongo.toObjectId(existing.id),
            },
            {
                $set: {
                    rating: rating,
                    title: title,
                    content: content,
                    status: 'Pending',
                },
            },
            { new: true }
        ).lean();
        existing = mongo.toPlain(existing);
    }

    res.status(201).send(existing);
        })
        .catch(next);
});

router.post('/events/:id/reports', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var authUser = req.authUser;
    var eventId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    var reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
    var details = typeof req.body.details === 'string' ? req.body.details.trim() : null;

    if (!eventId) {
        res.status(400).send({ code: 'INVALID_EVENT_ID', message: 'Invalid event id.' });
        return;
    }

    if (!reason) {
        res.status(400).send({ code: 'REPORT_REASON_REQUIRED', message: 'reason is required.' });
        return;
    }

    var event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);

    if (!event) {
        res.status(404).send({ code: 'EVENT_NOT_FOUND', message: 'Event not found.' });
        return;
    }

    var row = await models.eventReport.create({
        eventId: mongo.toObjectId(eventId),
        reporterUserId: mongo.toObjectId(authUser.userId),
        reason: reason,
        details: details,
        status: 'Pending',
    });
    row = mongo.toPlain(row.toObject());

    res.status(201).send(row);
        })
        .catch(next);
});

module.exports = router;
