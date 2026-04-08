// controllers/organizationController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

module.exports = {
  getOrganizations: async function (query) {
    const keyword = typeof query.keyword === 'string' ? query.keyword.trim().toLowerCase() : '';
    const city = typeof query.city === 'string' ? query.city.trim().toLowerCase() : '';
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || 12)));
    let rows = mongo.toPlain(await models.organization.find({
      $or: [
        { approvalStatus: 'approved' },
        { approvalStatus: { $exists: false }, verified: true },
      ],
    }).lean());
    rows = rows.filter((item) => {
      const keywordOk = !keyword || (item.name || '').toLowerCase().includes(keyword) || (item.description || '').toLowerCase().includes(keyword);
      const cityOk = !city || (item.city || '').toLowerCase().includes(city);
      return keywordOk && cityOk;
    });
    const totalCount = rows.length;
    let items = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    items = await Promise.all(items.map(async (org) => {
      const events = await models.event.find({ organizationId: mongo.toObjectId(org.id) }).select('_id').lean();
      const eventIds = events.map(e => e._id);
      const ratings = eventIds.length > 0 ? await models.eventRating.find({ eventId: { $in: eventIds }, isHidden: false }).select('rating').lean() : [];
      let totalRatingValue = 0;
      ratings.forEach(r => { totalRatingValue += r.rating; });
      const averageRating = ratings.length > 0 ? Number((totalRatingValue / ratings.length).toFixed(1)) : 0;
      return { ...org, eventsOrganized: events.length, totalReviews: ratings.length, averageRating };
    }));
    return { items, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  },

  getOrganizationById: async function (id) {
    id = typeof id === 'string' ? id.trim() : '';
    if (!id) throw { status: 400, message: 'Invalid organization id.' };
    let row = mongo.toPlain(await models.organization.findOne({
      _id: mongo.toObjectId(id),
      $or: [
        { approvalStatus: 'approved' },
        { approvalStatus: { $exists: false }, verified: true },
      ],
    }).lean());
    if (!row) throw { status: 404, message: 'Organization not found.' };
    const approvedEvents = await models.event.find({ organizationId: mongo.toObjectId(id), status: 'approved', isHidden: { $ne: true } }).select('title startTime endTime location status').sort({ startTime: 1 }).limit(5).lean();
    const allOrgEvents = await models.event.find({ organizationId: mongo.toObjectId(id) }).select('_id title').lean();
    const eventIds = allOrgEvents.map(e => e._id);
    const eventTitleMap = {};
    allOrgEvents.forEach(e => { eventTitleMap[e._id.toString()] = e.title; });
    let ratings = [];
    if (eventIds.length > 0) {
      ratings = await models.eventRating.find({ eventId: { $in: eventIds }, isHidden: false }).populate('userId', 'fullName').sort({ createdAt: -1 }).lean();
    }
    ratings = mongo.toPlain(ratings);
    let totalRatingValue = 0;
    const formattedReviews = ratings.map(r => {
      totalRatingValue += r.rating;
      return { id: r.id, rating: r.rating, review: r.review, createdAt: r.createdAt, eventId: r.eventId, eventName: eventTitleMap[r.eventId], userName: r.userId ? r.userId.fullName : 'Người ẩn danh' };
    });
    const averageRating = formattedReviews.length > 0 ? Number((totalRatingValue / formattedReviews.length).toFixed(1)) : 0;
    return { ...row, events: mongo.toPlain(approvedEvents), averageRating, totalReviews: formattedReviews.length, reviews: formattedReviews };
  },

  registerOrganization: async function (authUserId, body) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const organizationType = typeof body.organizationType === 'string' ? body.organizationType.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const contactEmail = typeof body.contactEmail === 'string' ? body.contactEmail.trim().toLowerCase() : '';
    const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : '';
    const website = typeof body.website === 'string' ? body.website.trim() : null;
    const city = typeof body.city === 'string' ? body.city.trim() : '';
    const district = typeof body.district === 'string' ? body.district.trim() : '';
    const ward = typeof body.ward === 'string' ? body.ward.trim() : null;
    const address = typeof body.address === 'string' ? body.address.trim() : '';
    const taxCode = typeof body.taxCode === 'string' ? body.taxCode.trim() : null;
    const foundedDate = body.foundedDate ? new Date(body.foundedDate) : null;
    const legalRepresentative = typeof body.legalRepresentative === 'string' ? body.legalRepresentative.trim() : null;
    const documentType = typeof body.documentType === 'string' ? body.documentType.trim() : null;
    const verificationDocsUrl = typeof body.verificationDocsUrl === 'string' ? body.verificationDocsUrl.trim() : null;
    const facebookUrl = typeof body.facebookUrl === 'string' ? body.facebookUrl.trim() : null;
    const zaloNumber = typeof body.zaloNumber === 'string' ? body.zaloNumber.trim() : null;
    const achievements = typeof body.achievements === 'string' ? body.achievements.trim() : null;
    const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : null;
    const memberCount = Math.max(0, Number(body.memberCount || 0));
    const eventsOrganized = Math.max(0, Number(body.eventsOrganized || 0));
    const focusAreas = Array.isArray(body.focusAreas)
      ? body.focusAreas.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
      : (typeof body.focusAreas === 'string' && body.focusAreas.trim() ? [body.focusAreas.trim()] : []);
    if (!name || !organizationType || !description || !contactEmail || !phoneNumber || !city || !district || !address) {
      throw { status: 400, message: 'Vui lòng điền đầy đủ các trường bắt buộc.' };
    }
    if (focusAreas.length === 0) throw { status: 400, message: 'Vui lòng chọn ít nhất một lĩnh vực hoạt động.' };
    const existingOwnedOrganization = await models.organization.findOne({ ownerUserId: mongo.toObjectId(authUserId) }).lean();
    if (existingOwnedOrganization) throw { status: 409, message: 'Tài khoản này đã sở hữu một tổ chức.' };
    const organization = await models.organization.create({
      name, organizationType, description, contactEmail, phoneNumber, website, city, district, ward, address, taxCode,
      foundedDate: foundedDate && !Number.isNaN(foundedDate.getTime()) ? foundedDate : null,
      legalRepresentative, documentType, verificationDocsUrl, facebookUrl, zaloNumber, achievements,
      memberCount: Number.isFinite(memberCount) ? memberCount : 0,
      eventsOrganized: Number.isFinite(eventsOrganized) ? eventsOrganized : 0,
      focusAreas, avatarUrl, verified: false, approvalStatus: 'pending', averageRating: 0, totalReviews: 0,
      ownerUserId: mongo.toObjectId(authUserId),
    });
    const plainOrganization = mongo.toPlain(organization.toObject());
    await models.appUser.findOneAndUpdate({ _id: mongo.toObjectId(authUserId) }, { $set: { role: 'Organizer' } }, { new: true }).lean();
    await models.organizationMember.findOneAndUpdate(
      { organizationId: mongo.toObjectId(plainOrganization.id), userId: mongo.toObjectId(authUserId) },
      { $set: { role: 'Owner', status: 'Active' }, $setOnInsert: { joinedAt: new Date() } },
      { upsert: true, new: true }
    ).lean();
    return { message: 'Đăng ký tổ chức thành công.', item: plainOrganization };
  },
};
