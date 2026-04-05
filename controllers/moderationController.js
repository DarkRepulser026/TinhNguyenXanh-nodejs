// controllers/moderationController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

exports.getEventComments = async (req, res, next) => {
  try {
    const eventId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!eventId) {
      return res.status(400).send({ code: 'INVALID_EVENT_ID', message: 'Invalid event id.' });
    }

    let event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);

    if (!event || event.isHidden) {
      return res.status(404).send({ code: 'EVENT_NOT_FOUND', message: 'Event not found.' });
    }

    let items = await models.eventComment.find({ eventId: mongo.toObjectId(eventId), isHidden: false }).sort({ createdAt: -1 }).limit(100).lean();
    items = mongo.toPlain(items);

    res.send({ items, totalCount: items.length });
  } catch (error) {
    next(error);
  }
};

exports.createEventComment = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const eventId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

    if (!eventId) {
      return res.status(400).send({ code: 'INVALID_EVENT_ID', message: 'Invalid event id.' });
    }

    if (!content) {
      return res.status(400).send({ code: 'COMMENT_CONTENT_REQUIRED', message: 'content is required.' });
    }

    let event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);

    if (!event || event.isHidden) {
      return res.status(404).send({ code: 'EVENT_NOT_FOUND', message: 'Event not found.' });
    }

    let row = await models.eventComment.create({ eventId: mongo.toObjectId(eventId), userId: mongo.toObjectId(authUser.userId), content, isHidden: false });
    row = mongo.toPlain(row.toObject());

    res.status(201).send(row);
  } catch (error) {
    next(error);
  }
};

exports.getOrganizationReviews = async (req, res, next) => {
  try {
    const organizationId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!organizationId) {
      return res.status(400).send({ code: 'INVALID_ORGANIZATION_ID', message: 'Invalid organization id.' });
    }

    let org = await models.organization.findOne({ _id: mongo.toObjectId(organizationId) }).lean();
    org = mongo.toPlain(org);
    if (!org) {
      return res.status(404).send({ code: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found.' });
    }

    let items = await models.organizationReview.find({ organizationId: mongo.toObjectId(organizationId), status: 'Approved' }).sort({ createdAt: -1 }).limit(100).lean();
    items = mongo.toPlain(items);

    const averageRating = items.length > 0 ? items.reduce((sum, item) => sum + item.rating, 0) / items.length : 0;

    res.send({ items, totalCount: items.length, averageRating });
  } catch (error) {
    next(error);
  }
};

exports.createOrganizationReview = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organizationId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    const rating = Number(req.body.rating);
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : null;
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : null;

    if (!organizationId) {
      return res.status(400).send({ code: 'INVALID_ORGANIZATION_ID', message: 'Invalid organization id.' });
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).send({ code: 'INVALID_REVIEW_RATING', message: 'rating must be between 1 and 5.' });
    }

    let org = await models.organization.findOne({ _id: mongo.toObjectId(organizationId) }).lean();
    org = mongo.toPlain(org);
    if (!org) {
      return res.status(404).send({ code: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found.' });
    }

    let existing = await models.organizationReview.findOne({ organizationId: mongo.toObjectId(organizationId), userId: mongo.toObjectId(authUser.userId) }).lean();
    existing = mongo.toPlain(existing);

    if (!existing) {
      existing = await models.organizationReview.create({ organizationId: mongo.toObjectId(organizationId), userId: mongo.toObjectId(authUser.userId), rating, title, content, status: 'Pending' });
      existing = mongo.toPlain(existing.toObject());
    } else {
      existing = await models.organizationReview.findOneAndUpdate({ _id: mongo.toObjectId(existing.id) }, { $set: { rating, title, content, status: 'Pending' } }, { new: true }).lean();
      existing = mongo.toPlain(existing);
    }

    res.status(201).send(existing);
  } catch (error) {
    next(error);
  }
};

exports.reportEvent = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const eventId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
    const details = typeof req.body.details === 'string' ? req.body.details.trim() : null;

    if (!eventId) {
      return res.status(400).send({ code: 'INVALID_EVENT_ID', message: 'Invalid event id.' });
    }

    if (!reason) {
      return res.status(400).send({ code: 'REPORT_REASON_REQUIRED', message: 'reason is required.' });
    }

    let event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);
    if (!event) {
      return res.status(404).send({ code: 'EVENT_NOT_FOUND', message: 'Event not found.' });
    }

    let row = await models.eventReport.create({ eventId: mongo.toObjectId(eventId), reporterUserId: mongo.toObjectId(authUser.userId), reason, details, status: 'Pending' });
    row = mongo.toPlain(row.toObject());

    res.status(201).send(row);
  } catch (error) {
    next(error);
  }
};
