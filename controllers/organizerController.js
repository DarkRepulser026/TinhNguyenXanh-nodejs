// controllers/organizerController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toPageParams(query, defaultPageSize) {
  const page = Math.max(1, Number(query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || defaultPageSize || 10)));
  return { page, pageSize };
}

async function getOwnedOrganization(userId) {
  const organization = await models.organization.findOne({ ownerUserId: mongo.toObjectId(userId) }).lean();
  return mongo.toPlain(organization);
}

module.exports = {
  getDashboard: async function (userId) {
    const organization = await getOwnedOrganization(userId);
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    let events = mongo.toPlain(await models.event.find({ organizationId: mongo.toObjectId(organization.id) }).select('_id status').lean());
    const eventIds = events.map((item) => item.id);
    let relatedRegistrations = mongo.toPlain(await models.eventRegistration.find({ eventId: { $in: eventIds.map((id) => mongo.toObjectId(id)) } }).select('status').lean());
    return {
      ...organization, organizationName: organization.name,
      totalEvents: events.length,
      approvedEvents: events.filter((item) => item.status === 'approved').length,
      pendingEvents: events.filter((item) => item.status === 'pending').length,
      draftEvents: events.filter((item) => item.status === 'draft').length,
      totalRegistrations: relatedRegistrations.length,
      pendingRegistrations: relatedRegistrations.filter((item) => item.status === 'Pending').length,
      confirmedVolunteers: relatedRegistrations.filter((item) => item.status === 'Confirmed').length,
    };
  },

  getOrganizationProfile: async function (userId) {
    const organization = await getOwnedOrganization(userId);
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    const events = await models.event.find({ organizationId: mongo.toObjectId(organization.id) }).select('_id').lean();
    const eventIds = events.map(e => e._id);
    const ratings = eventIds.length > 0 ? await models.eventRating.find({ eventId: { $in: eventIds }, isHidden: false }).select('rating').lean() : [];
    let totalRatingValue = 0;
    ratings.forEach(r => { totalRatingValue += r.rating; });
    const averageRating = ratings.length > 0 ? Number((totalRatingValue / ratings.length).toFixed(1)) : 0;
    return { ...organization, eventsOrganized: events.length, totalReviews: ratings.length, averageRating };
  },

  updateOrganization: async function (userId, body) {
    const organization = await getOwnedOrganization(userId);
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    const payload = {
      name: typeof body.name === 'string' ? body.name.trim() : organization.name,
      description: typeof body.description === 'string' ? body.description.trim() : organization.description,
      city: typeof body.city === 'string' ? body.city.trim() : organization.city,
      district: typeof body.district === 'string' ? body.district.trim() : organization.district,
      address: typeof body.address === 'string' ? body.address.trim() : organization.address,
      contactEmail: typeof body.contactEmail === 'string' ? body.contactEmail.trim().toLowerCase() : organization.contactEmail,
      phoneNumber: typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : organization.phoneNumber,
      website: typeof body.website === 'string' ? body.website.trim() : organization.website,
      organizationType: typeof body.organizationType === 'string' ? body.organizationType.trim() : organization.organizationType,
      avatarUrl: typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : organization.avatarUrl,
    };
    if (!payload.name) throw { status: 400, message: 'Organization name is required.' };
    let updated = mongo.toPlain(await models.organization.findOneAndUpdate({ _id: mongo.toObjectId(organization.id) }, { $set: payload }, { new: true }).lean());
    return updated;
  },

  claimOrganization: async function (userId, organizationId) {
    organizationId = typeof organizationId === 'string' ? organizationId.trim() : '';
    if (!organizationId) throw { status: 400, message: 'organizationId is required.' };
    let org = mongo.toPlain(await models.organization.findOne({ _id: mongo.toObjectId(organizationId) }).lean());
    if (!org) throw { status: 404, message: 'Organization not found.' };
    org = mongo.toPlain(await models.organization.findOneAndUpdate({ _id: mongo.toObjectId(org.id) }, { $set: { ownerUserId: mongo.toObjectId(userId) } }, { new: true }).lean());
    return org;
  },

  getEvents: async function (userId, query) {
    const organization = await getOwnedOrganization(userId);
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';
    const status = typeof query.status === 'string' ? query.status.trim().toLowerCase() : '';
    const paging = toPageParams(query, 10);
    let rows = await models.event.find({ organizationId: mongo.toObjectId(organization.id) }).populate('categoryId').lean();
    const registrationRows = await models.eventRegistration.find({ eventId: { $in: rows.map((item) => item._id) } }).select('eventId status').lean();
    const registrationCountByEvent = {};
    registrationRows.forEach((item) => {
      if (item.status !== 'Pending' && item.status !== 'Confirmed') return;
      const key = String(item.eventId);
      registrationCountByEvent[key] = (registrationCountByEvent[key] || 0) + 1;
    });
    rows = mongo.toPlain(rows).filter((event) => {
      const searchOk = !search || (event.title || '').toLowerCase().includes(search) || (event.description || '').toLowerCase().includes(search) || (event.location || '').toLowerCase().includes(search);
      const statusOk = !status || event.status === status;
      return searchOk && statusOk;
    });
    const totalCount = rows.length;
    const items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map((event) => ({
      id: event.id, title: event.title, description: event.description, startTime: event.startTime,
      endTime: event.endTime, location: event.location, status: event.status, isHidden: Boolean(event.isHidden),
      maxVolunteers: event.maxVolunteers, categoryId: event.categoryId,
      categoryName: event.categoryId && event.categoryId.name ? event.categoryId.name : null,
      registrationCount: registrationCountByEvent[event.id] || 0,
    }));
    return { items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) };
  },

  getEventById: async function (userId, id) {
    const organization = await getOwnedOrganization(userId);
    id = typeof id === 'string' ? id.trim() : '';
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    if (!id) throw { status: 400, message: 'Invalid event id.' };
    let event = mongo.toPlain(await models.event.findOne({ _id: mongo.toObjectId(id), organizationId: mongo.toObjectId(organization.id) }).populate('categoryId').lean());
    if (!event) throw { status: 404, message: 'Event not found.' };
    return { id: event.id, title: event.title, description: event.description, startTime: event.startTime, endTime: event.endTime, location: event.location, status: event.status, isHidden: Boolean(event.isHidden), maxVolunteers: event.maxVolunteers, images: event.images, categoryId: event.categoryId, categoryName: event.categoryId && event.categoryId.name ? event.categoryId.name : null };
  },

  createEvent: async function (userId, body) {
    const organization = await getOwnedOrganization(userId);
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : null;
    const location = typeof body.location === 'string' ? body.location.trim() : null;
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId.trim() : null;
    const images = typeof body.images === 'string' ? body.images.trim() : null;
    const maxVolunteers = Number(body.maxVolunteers);
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    if (!title || !Number.isFinite(startTime.valueOf()) || !Number.isFinite(endTime.valueOf())) throw { status: 400, message: 'title, startTime, and endTime are required.' };
    if (endTime <= startTime) throw { status: 400, message: 'endTime must be later than startTime.' };
    let event = await models.event.create({ title, description, location, categoryId: categoryId ? mongo.toObjectId(categoryId) : null, maxVolunteers: Number.isFinite(maxVolunteers) && maxVolunteers >= 0 ? maxVolunteers : 0, startTime, endTime, organizationId: mongo.toObjectId(organization.id), status: 'draft', images, isHidden: false });
    return mongo.toPlain(event.toObject());
  },

  updateEvent: async function (userId, id, body) {
    const organization = await getOwnedOrganization(userId);
    id = typeof id === 'string' ? id.trim() : '';
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    if (!id) throw { status: 400, message: 'Invalid event id.' };
    let event = mongo.toPlain(await models.event.findOne({ _id: mongo.toObjectId(id), organizationId: mongo.toObjectId(organization.id) }).lean());
    if (!event) throw { status: 404, message: 'Event not found.' };
    const data = {};
    if (typeof body.title === 'string') data.title = body.title.trim();
    if (typeof body.description === 'string') data.description = body.description.trim();
    if (typeof body.location === 'string') data.location = body.location.trim();
    if (typeof body.categoryId === 'string') data.categoryId = body.categoryId.trim() || null;
    if (typeof body.images === 'string') data.images = body.images.trim() || null;
    if (Number.isFinite(Number(body.maxVolunteers))) data.maxVolunteers = Number(body.maxVolunteers);
    if (body.startTime && Number.isFinite(new Date(body.startTime).valueOf())) data.startTime = new Date(body.startTime);
    if (body.endTime && Number.isFinite(new Date(body.endTime).valueOf())) data.endTime = new Date(body.endTime);
    if (Object.prototype.hasOwnProperty.call(data, 'categoryId')) data.categoryId = data.categoryId ? mongo.toObjectId(data.categoryId) : null;
    event = mongo.toPlain(await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: data }, { new: true }).lean());
    return event;
  },

  hideEvent: async function (userId, id) {
    const organization = await getOwnedOrganization(userId);
    id = typeof id === 'string' ? id.trim() : '';
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    let event = mongo.toPlain(await models.event.findOne({ _id: mongo.toObjectId(id), organizationId: mongo.toObjectId(organization.id) }).lean());
    if (!event) throw { status: 404, message: 'Event not found.' };
    event = mongo.toPlain(await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: { isHidden: true, status: 'hidden' } }, { new: true }).lean());
    return { id: event.id, status: event.status, isHidden: event.isHidden };
  },

  unhideEvent: async function (userId, id) {
    const organization = await getOwnedOrganization(userId);
    id = typeof id === 'string' ? id.trim() : '';
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    let event = mongo.toPlain(await models.event.findOne({ _id: mongo.toObjectId(id), organizationId: mongo.toObjectId(organization.id) }).lean());
    if (!event) throw { status: 404, message: 'Event not found.' };
    event = mongo.toPlain(await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: { isHidden: false, status: 'pending' } }, { new: true }).lean());
    return { id: event.id, status: event.status, isHidden: event.isHidden };
  },

  getVolunteers: async function (userId, query) {
    const organization = await getOwnedOrganization(userId);
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    const eventId = typeof query.eventId === 'string' ? query.eventId.trim() : '';
    const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';
    const status = typeof query.status === 'string' ? query.status.trim() : '';
    const paging = toPageParams(query, 10);
    let ownedEvents = mongo.toPlain(await models.event.find({ organizationId: mongo.toObjectId(organization.id) }).select('_id').lean());
    const ownedEventIds = ownedEvents.map((item) => mongo.toObjectId(item.id));
    let rows = mongo.toPlain(await models.eventRegistration.find({ eventId: { $in: ownedEventIds } }).populate('eventId').populate('volunteerId').sort({ registeredAt: -1 }).lean());
    rows = rows.filter((item) => {
      if (eventId && item.eventId !== eventId) return false;
      if (status && item.status !== status) return false;
      if (!search) return true;
      return (item.fullName || '').toLowerCase().includes(search) || (item.phone || '').toLowerCase().includes(search);
    });
    const totalCount = rows.length;
    const items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map((item) => ({
      id: item.id, status: item.status, fullName: item.fullName, phone: item.phone, reason: item.reason, registeredAt: item.registeredAt,
      event: { id: item.eventId, title: item.eventId ? item.eventId.title : '', startTime: item.eventId ? item.eventId.startTime : null, location: item.eventId ? item.eventId.location : null },
      volunteer: { id: item.volunteerId ? item.volunteerId.id : null, userId: item.volunteerId ? item.volunteerId.userId : null, fullName: item.volunteerId ? item.volunteerId.fullName : item.fullName, phone: item.volunteerId ? item.volunteerId.phone : item.phone },
    }));
    return { items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) };
  },

  getRegistrationById: async function (userId, id) {
    const organization = await getOwnedOrganization(userId);
    id = typeof id === 'string' ? id.trim() : '';
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    if (!id) throw { status: 400, message: 'Invalid registration id.' };
    let row = mongo.toPlain(await models.eventRegistration.findOne({ _id: mongo.toObjectId(id) }).populate('eventId').populate('volunteerId').lean());
    if (!row) throw { status: 404, message: 'Registration not found.' };
    const event = row.eventId;
    const volunteer = row.volunteerId;
    if (!event || event.organizationId !== organization.id) throw { status: 403, message: 'You do not have access to this registration.' };
    return { id: row.id, status: row.status, fullName: row.fullName, phone: row.phone, reason: row.reason, registeredAt: row.registeredAt, event: { id: event.id, title: event.title, startTime: event.startTime, endTime: event.endTime, location: event.location, status: event.status }, volunteer: { id: volunteer ? volunteer.id : null, userId: volunteer ? volunteer.userId : null, fullName: volunteer ? volunteer.fullName : row.fullName, phone: volunteer ? volunteer.phone : row.phone } };
  },

  updateRegistrationStatus: async function (userId, id, action) {
    const organization = await getOwnedOrganization(userId);
    id = typeof id === 'string' ? id.trim() : '';
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    if (!id) throw { status: 400, message: 'Invalid registration id.' };
    let registration = mongo.toPlain(await models.eventRegistration.findOne({ _id: mongo.toObjectId(id) }).populate('eventId').lean());
    if (!registration) throw { status: 404, message: 'Registration not found.' };
    const event = registration.eventId;
    if (!event || event.organizationId !== organization.id) throw { status: 403, message: 'You do not have access to this registration.' };
    if (action === 'approve') {
      registration = mongo.toPlain(await models.eventRegistration.findOneAndUpdate({ _id: mongo.toObjectId(registration.id) }, { $set: { status: 'Confirmed' } }, { new: true }).lean());
    } else if (action === 'reject') {
      registration = mongo.toPlain(await models.eventRegistration.findOneAndUpdate({ _id: mongo.toObjectId(registration.id) }, { $set: { status: 'Rejected' } }, { new: true }).lean());
    } else {
      throw { status: 400, message: "action must be 'approve' or 'reject'." };
    }
    return { id: registration.id, status: registration.status };
  },

  getVolunteerHistory: async function (userId, volunteerId) {
    const organization = await getOwnedOrganization(userId);
    volunteerId = typeof volunteerId === 'string' ? volunteerId.trim() : '';
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    if (!volunteerId) throw { status: 400, message: 'Invalid volunteer id.' };
    let ownedEvents = mongo.toPlain(await models.event.find({ organizationId: mongo.toObjectId(organization.id) }).select('_id').lean());
    const ownedEventIds = ownedEvents.map((item) => mongo.toObjectId(item.id));
    let rows = mongo.toPlain(await models.eventRegistration.find({ volunteerId: mongo.toObjectId(volunteerId), eventId: { $in: ownedEventIds } }).populate('eventId').sort({ registeredAt: -1 }).lean());
    const items = rows.map((row) => ({ id: row.id, status: row.status, reason: row.reason, registeredAt: row.registeredAt, event: { id: row.eventId ? row.eventId.id : null, title: row.eventId ? row.eventId.title : '', location: row.eventId ? row.eventId.location : null, startTime: row.eventId ? row.eventId.startTime : null, endTime: row.eventId ? row.eventId.endTime : null, status: row.eventId ? row.eventId.status : null } }));
    return { items };
  },

  getRegistrationEvaluation: async function (userId, id) {
    const organization = await getOwnedOrganization(userId);
    id = typeof id === 'string' ? id.trim() : '';
    if (!organization) throw { status: 404, message: 'Organizer organization profile not found.' };
    if (!id) throw { status: 400, message: 'Invalid registration id.' };
    let registration = mongo.toPlain(await models.eventRegistration.findOne({ _id: mongo.toObjectId(id) }).populate('eventId').lean());
    if (!registration) throw { status: 404, message: 'Registration not found.' };
    const event = registration.eventId;
    if (!event || event.organizationId !== organization.id) throw { status: 403, message: 'You do not have access to this registration.' };
    let evaluation = mongo.toPlain(await models.volunteerEvaluation.findOne({ registrationId: mongo.toObjectId(id) }).lean());
    return { item: evaluation || null };
  },
};
