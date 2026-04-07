// controllers/moderationController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

module.exports = {
  getEventComments: async function (eventId) {
    eventId = typeof eventId === 'string' ? eventId.trim() : '';
    if (!eventId) throw { status: 400, message: 'Invalid event id.' };
    let event = mongo.toPlain(await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean());
    if (!event || event.isHidden) throw { status: 404, message: 'Event not found.' };
    let items = mongo.toPlain(await models.eventComment.find({ eventId: mongo.toObjectId(eventId), isHidden: false }).sort({ createdAt: -1 }).limit(100).lean());
    return { items, totalCount: items.length };
  },

  createEventComment: async function (eventId, userId, content) {
    eventId = typeof eventId === 'string' ? eventId.trim() : '';
    content = typeof content === 'string' ? content.trim() : '';
    if (!eventId) throw { status: 400, message: 'Invalid event id.' };
    if (!content) throw { status: 400, message: 'content is required.' };
    let event = mongo.toPlain(await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean());
    if (!event || event.isHidden) throw { status: 404, message: 'Event not found.' };
    let row = await models.eventComment.create({ eventId: mongo.toObjectId(eventId), userId: mongo.toObjectId(userId), content, isHidden: false });
    return mongo.toPlain(row.toObject());
  },

  getOrganizationReviews: async function (organizationId) {
    organizationId = typeof organizationId === 'string' ? organizationId.trim() : '';
    if (!organizationId) throw { status: 400, message: 'Invalid organization id.' };
    let org = mongo.toPlain(await models.organization.findOne({ _id: mongo.toObjectId(organizationId) }).lean());
    if (!org) throw { status: 404, message: 'Organization not found.' };

    // Sử dụng MongoDB Aggregation để lấy tổng số đếm và tính trung bình chính xác trên TẤT CẢ bản ghi
    let stats = await models.organizationReview.aggregate([
      { $match: { organizationId: mongo.toObjectId(organizationId), status: 'Approved' } },
      { $group: { _id: null, averageRating: { $avg: "$rating" }, totalCount: { $sum: 1 } } }
    ]);
    const averageRating = stats.length > 0 ? stats[0].averageRating : 0;
    const totalCount = stats.length > 0 ? stats[0].totalCount : 0;

    let items = mongo.toPlain(await models.organizationReview.find({ organizationId: mongo.toObjectId(organizationId), status: 'Approved' }).sort({ createdAt: -1 }).limit(100).lean());
    
    return { items, totalCount, averageRating };
  },

  createOrganizationReview: async function (organizationId, userId, rating, title, content) {
    organizationId = typeof organizationId === 'string' ? organizationId.trim() : '';
    rating = Number(rating);
    title = typeof title === 'string' ? title.trim() : null;
    content = typeof content === 'string' ? content.trim() : null;
    if (!organizationId) throw { status: 400, message: 'Invalid organization id.' };
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) throw { status: 400, message: 'rating must be between 1 and 5.' };
    let org = mongo.toPlain(await models.organization.findOne({ _id: mongo.toObjectId(organizationId) }).lean());
    if (!org) throw { status: 404, message: 'Organization not found.' };

    // Tối ưu hóa: Dùng upsert để gộp thao tác Tìm & Cập nhật/Tạo mới thành 1 Query duy nhất
    let result = await models.organizationReview.findOneAndUpdate(
      { organizationId: mongo.toObjectId(organizationId), userId: mongo.toObjectId(userId) },
      { $set: { rating, title, content, status: 'Approved' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return mongo.toPlain(result);
  },

  reportEvent: async function (eventId, userId, reason, details) {
    eventId = typeof eventId === 'string' ? eventId.trim() : '';
    reason = typeof reason === 'string' ? reason.trim() : '';
    details = typeof details === 'string' ? details.trim() : null;
    if (!eventId) throw { status: 400, message: 'Invalid event id.' };
    if (!reason) throw { status: 400, message: 'reason is required.' };
    let event = mongo.toPlain(await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean());
    if (!event) throw { status: 404, message: 'Event not found.' };
    let row = await models.eventReport.create({ eventId: mongo.toObjectId(eventId), reporterUserId: mongo.toObjectId(userId), reason, details, status: 'Pending' });
    return mongo.toPlain(row.toObject());
  },
};
