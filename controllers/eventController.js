// controllers/eventController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

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

module.exports = {
  GetAllEvents: async function (keyword, location, category, page, pageSize) {
    keyword = typeof keyword === 'string' ? keyword.trim().toLowerCase() : '';
    location = typeof location === 'string' ? location.trim().toLowerCase() : '';
    category = typeof category === 'string' ? category.trim() : '';
    page = Math.max(1, Number(page || 1));
    pageSize = Math.min(100, Math.max(1, Number(pageSize || 12)));

    const docs = await models.event
      .find({ status: 'approved', isHidden: false })
      .populate('organizationId')
      .populate('categoryId')
      .lean();

    const eventIds = docs.map((item) => item._id);
    const registrationRows = await models.eventRegistration
      .find({ eventId: { $in: eventIds }, status: { $in: ['Pending', 'Confirmed'] } })
      .select('eventId')
      .lean();

    const registrationCountByEventId = {};
    registrationRows.forEach((item) => {
      const key = String(item.eventId);
      registrationCountByEventId[key] = (registrationCountByEventId[key] || 0) + 1;
    });

    let rows = mongo.toPlain(docs).map((item) => ({
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
    }));

    rows = rows.filter((item) => {
      const keywordOk = !keyword || (item.title || '').toLowerCase().includes(keyword) || (item.description || '').toLowerCase().includes(keyword);
      const locationOk = !location || (item.location || '').toLowerCase().includes(location);
      const categoryOk = !category || item.categoryId === category;
      return keywordOk && locationOk && categoryOk;
    });

    const totalCount = rows.length;
    const paged = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

    return {
      items: paged.map(toViewEvent),
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  },

  GetEventById: async function (id) {
    id = typeof id === 'string' ? id.trim() : '';
    if (!id) {
      throw { status: 400, message: 'Invalid event id.' };
    }

    let row = await models.event.findOne({ _id: mongo.toObjectId(id) }).populate('organizationId').populate('categoryId').lean();
    row = mongo.toPlain(row);

    if (!row || row.isHidden || row.status !== 'approved') {
      throw { status: 404, message: 'Event not found.' };
    }

    const registeredCount = await models.eventRegistration.countDocuments({ eventId: mongo.toObjectId(row.id), status: { $in: ['Pending', 'Confirmed'] } });

    return {
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
      registeredCount,
      maxVolunteers: row.maxVolunteers,
      images: row.images,
      status: row.status,
    };
  },

  RegisterEvent: async function (eventId, userId, fullName, phone, reason) {
    eventId = typeof eventId === 'string' ? eventId.trim() : '';
    fullName = typeof fullName === 'string' ? fullName.trim() : null;
    phone = typeof phone === 'string' ? phone.trim() : null;
    reason = typeof reason === 'string' ? reason.trim() : null;

    if (!eventId || !userId) {
      throw { status: 400, message: 'eventId and userId are required.' };
    }

    let event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);

    if (!event || event.status !== 'approved' || event.isHidden) {
      throw { status: 404, message: 'Event not available for registration.' };
    }

    let user = await models.appUser.findOne({ _id: mongo.toObjectId(userId) }).lean();
    user = mongo.toPlain(user);

    fullName = fullName || (user ? user.fullName : 'Volunteer');
    phone = phone || (user ? user.phone : null);

    let volunteer = await models.volunteer.findOneAndUpdate(
      { userId: mongo.toObjectId(userId) },
      {
        $set: { fullName, phone },
      },
      { new: true }
    ).lean();

    if (!volunteer) {
      volunteer = await models.volunteer.create({
        userId: mongo.toObjectId(userId),
        fullName,
        phone,
      });
      volunteer = volunteer.toObject();
    }

    volunteer = mongo.toPlain(volunteer);

    const existing = await models.eventRegistration.findOne({ eventId: mongo.toObjectId(eventId), volunteerId: mongo.toObjectId(volunteer.id) }).lean();
    if (existing) {
      throw { status: 409, message: 'Already registered.' };
    }

    const activeCount = await models.eventRegistration.countDocuments({ eventId: mongo.toObjectId(eventId), status: { $in: ['Pending', 'Confirmed'] } });
    if (activeCount >= event.maxVolunteers) {
      throw { status: 400, message: 'Event is full.' };
    }

    await models.eventRegistration.create({
      eventId: mongo.toObjectId(eventId),
      volunteerId: mongo.toObjectId(volunteer.id),
      fullName,
      phone,
      reason: reason || null,
      status: 'Pending',
    });

    return { message: 'Registration created.' };
  },

  ToggleFavorite: async function (eventId, userId) {
    eventId = typeof eventId === 'string' ? eventId.trim() : '';
    if (!eventId || !userId) {
      throw { status: 400, message: 'eventId and userId are required.' };
    }

    let event = await models.event.findOne({ _id: mongo.toObjectId(eventId) }).lean();
    event = mongo.toPlain(event);

    if (!event || event.isHidden) {
      throw { status: 404, message: 'Event not found.' };
    }

    let volunteer = await models.volunteer.findOneAndUpdate(
      { userId: mongo.toObjectId(userId) },
      { $set: { fullName: 'Volunteer', phone: null } },
      { new: true }
    ).lean();

    if (!volunteer) {
      volunteer = await models.volunteer.create({
        userId: mongo.toObjectId(userId),
        fullName: 'Volunteer',
        phone: null,
      });
      volunteer = volunteer.toObject();
    }

    volunteer = mongo.toPlain(volunteer);

    const existing = await models.eventFavorite.findOne({ eventId: mongo.toObjectId(eventId), volunteerId: mongo.toObjectId(volunteer.id) }).lean();
    if (existing) {
      await models.eventFavorite.findOneAndDelete({ _id: mongo.toObjectId(existing._id || existing.id) });
      return { status: 'removed', isFavorited: false };
    }

    await models.eventFavorite.create({
      eventId: mongo.toObjectId(eventId),
      volunteerId: mongo.toObjectId(volunteer.id),
    });

    return { status: 'added', isFavorited: true };
  },
};
