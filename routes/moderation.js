var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var db = require('../utils/db');

var prisma = db.prisma;

router.get('/events/:id/comments', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var eventId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!eventId) {
        res.status(400).send({ code: 'INVALID_EVENT_ID', message: 'Invalid event id.' });
        return;
    }

    var event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
    });

    if (!event || event.isHidden) {
        res.status(404).send({ code: 'EVENT_NOT_FOUND', message: 'Event not found.' });
        return;
    }

    var items = await prisma.eventComment.findMany({
        where: {
            eventId: eventId,
            isHidden: false,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 100,
    });

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

    var event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
    });

    if (!event || event.isHidden) {
        res.status(404).send({ code: 'EVENT_NOT_FOUND', message: 'Event not found.' });
        return;
    }

    var row = await prisma.eventComment.create({
        data: {
            eventId: eventId,
            userId: authUser.userId,
            content: content,
            isHidden: false,
        },
    });

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

    var org = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!org) {
        res.status(404).send({ code: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found.' });
        return;
    }

    var items = await prisma.organizationReview.findMany({
        where: {
            organizationId: organizationId,
            status: 'Approved',
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 100,
    });

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

    var org = await prisma.organization.findUnique({
        where: {
            id: organizationId,
        },
    });

    if (!org) {
        res.status(404).send({ code: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found.' });
        return;
    }

    var existing = await prisma.organizationReview.findUnique({
        where: {
            organizationId_userId: {
                organizationId: organizationId,
                userId: authUser.userId,
            },
        },
    });

    if (!existing) {
        existing = await prisma.organizationReview.create({
            data: {
                organizationId: organizationId,
                userId: authUser.userId,
                rating: rating,
                title: title,
                content: content,
                status: 'Pending',
            },
        });
    } else {
        existing = await prisma.organizationReview.update({
            where: {
                id: existing.id,
            },
            data: {
                rating: rating,
                title: title,
                content: content,
                status: 'Pending',
            },
        });
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

    var event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
    });

    if (!event) {
        res.status(404).send({ code: 'EVENT_NOT_FOUND', message: 'Event not found.' });
        return;
    }

    var row = await prisma.eventReport.create({
        data: {
            eventId: eventId,
            reporterUserId: authUser.userId,
            reason: reason,
            details: details,
            status: 'Pending',
        },
    });

    res.status(201).send(row);
        })
        .catch(next);
});

module.exports = router;
