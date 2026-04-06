// controllers/moderationController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

module.exports = {
  async GetEventComments(eventId) {
    eventId = typeof eventId === 'string' ? eventId.trim() : '';
    if (!eventId) {
      throw { status: 400, code: 'INVALID_EVENT_ID', message: 'Invalid event id.' };
    }

    let event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);

    if (!event || event.isHidden) {
      throw { status: 404, code: 'EVENT_NOT_FOUND', message: 'Event not found.' };
    }

    let items = await models.eventComment.find({ eventId: mongo.toObjectId(eventId), isHidden: false }).sort({ createdAt: -1 }).limit(100).lean();
    items = mongo.toPlain(items);

    return { items, totalCount: items.length };
  },

  async CreateEventComment(eventId, userId, content) {
    eventId = typeof eventId === 'string' ? eventId.trim() : '';
    content = typeof content === 'string' ? content.trim() : '';

    if (!eventId) {
      throw { status: 400, code: 'INVALID_EVENT_ID', message: 'Invalid event id.' };
    }

    if (!content) {
      throw { status: 400, code: 'COMMENT_CONTENT_REQUIRED', message: 'content is required.' };
    }

    let event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);

    if (!event || event.isHidden) {
      throw { status: 404, code: 'EVENT_NOT_FOUND', message: 'Event not found.' };
    }

    let row = await models.eventComment.create({ eventId: mongo.toObjectId(eventId), userId: mongo.toObjectId(userId), content, isHidden: false });
    row = mongo.toPlain(row.toObject());

    return row;
  },

  async GetOrganizationReviews(organizationId) {
    organizationId = typeof organizationId === 'string' ? organizationId.trim() : '';
    if (!organizationId) {
      throw { status: 400, code: 'INVALID_ORGANIZATION_ID', message: 'Invalid organization id.' };
    }

    let org = await models.organization.findOne({ _id: mongo.toObjectId(organizationId) }).lean();
    org = mongo.toPlain(org);
    if (!org) {
      throw { status: 404, code: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found.' };
    }

    let items = await models.organizationReview.find({ organizationId: mongo.toObjectId(organizationId), status: 'Approved' }).sort({ createdAt: -1 }).limit(100).lean();
    items = mongo.toPlain(items);

    const averageRating = items.length > 0 ? items.reduce((sum, item) => sum + item.rating, 0) / items.length : 0;

    return { items, totalCount: items.length, averageRating };
  },

  async CreateOrganizationReview(organizationId, userId, rating, title, content) {
    organizationId = typeof organizationId === 'string' ? organizationId.trim() : '';
    rating = Number(rating);
    title = typeof title === 'string' ? title.trim() : null;
    content = typeof content === 'string' ? content.trim() : null;

    if (!organizationId) {
      throw { status: 400, code: 'INVALID_ORGANIZATION_ID', message: 'Invalid organization id.' };
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw { status: 400, code: 'INVALID_REVIEW_RATING', message: 'rating must be between 1 and 5.' };
    }

    let org = await models.organization.findOne({ _id: mongo.toObjectId(organizationId) }).lean();
    org = mongo.toPlain(org);
    if (!org) {
      throw { status: 404, code: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found.' };
    }

    let existing = await models.organizationReview.findOne({ organizationId: mongo.toObjectId(organizationId), userId: mongo.toObjectId(userId) }).lean();
    existing = mongo.toPlain(existing);

    if (!existing) {
      existing = await models.organizationReview.create({ organizationId: mongo.toObjectId(organizationId), userId: mongo.toObjectId(userId), rating, title, content, status: 'Pending' });
      existing = mongo.toPlain(existing.toObject());
    } else {
      existing = await models.organizationReview.findOneAndUpdate({ _id: mongo.toObjectId(existing.id) }, { $set: { rating, title, content, status: 'Pending' } }, { new: true }).lean();
      existing = mongo.toPlain(existing);
    }

    return existing;
  },

  async ReportEvent(eventId, userId, reason, details) {
    eventId = typeof eventId === 'string' ? eventId.trim() : '';
    reason = typeof reason === 'string' ? reason.trim() : '';
    details = typeof details === 'string' ? details.trim() : null;

    if (!eventId) {
      throw { status: 400, code: 'INVALID_EVENT_ID', message: 'Invalid event id.' };
    }

    if (!reason) {
      throw { status: 400, code: 'REPORT_REASON_REQUIRED', message: 'reason is required.' };
    }

    let event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);
    if (!event) {
      throw { status: 404, code: 'EVENT_NOT_FOUND', message: 'Event not found.' };
    }

    let row = await models.eventReport.create({ eventId: mongo.toObjectId(eventId), reporterUserId: mongo.toObjectId(userId), reason, details, status: 'Pending' });
    row = mongo.toPlain(row.toObject());

    return row;
  }
};
