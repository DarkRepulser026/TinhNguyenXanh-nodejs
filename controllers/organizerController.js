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

exports.getDashboard = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    if (!organization) {
      return res.status(404).send({ message: 'Organizer organization profile not found.' });
    }

    let events = await models.event.find({ organizationId: mongo.toObjectId(organization.id) }).select('_id status').lean();
    events = mongo.toPlain(events);
    const eventIds = events.map((item) => item.id);

    let relatedRegistrations = await models.eventRegistration.find({ eventId: { $in: eventIds.map((id) => mongo.toObjectId(id)) } }).select('status').lean();
    relatedRegistrations = mongo.toPlain(relatedRegistrations);

    res.send({
      ...organization,
      organizationName: organization.name,
      totalEvents: events.length,
      approvedEvents: events.filter((item) => item.status === 'approved').length,
      pendingEvents: events.filter((item) => item.status === 'pending').length,
      draftEvents: events.filter((item) => item.status === 'draft').length,
      totalRegistrations: relatedRegistrations.length,
      pendingRegistrations: relatedRegistrations.filter((item) => item.status === 'Pending').length,
      confirmedVolunteers: relatedRegistrations.filter((item) => item.status === 'Confirmed').length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrganizationProfile = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    if (!organization) {
      return res.status(404).send({ message: 'Organizer organization profile not found.' });
    }
    const events = await models.event.find({ organizationId: mongo.toObjectId(organization.id) }).select('_id').lean();
    const eventIds = events.map(e => e._id);
    const ratings = eventIds.length > 0 ? await models.eventRating.find({ eventId: { $in: eventIds }, isHidden: false }).select('rating').lean() : [];
    
    let totalRatingValue = 0;
    ratings.forEach(r => { totalRatingValue += r.rating; });
    const averageRating = ratings.length > 0 ? Number((totalRatingValue / ratings.length).toFixed(1)) : 0;
    
    res.send({ 
       ...organization,
       eventsOrganized: events.length,
       totalReviews: ratings.length,
       averageRating
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrganization = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    if (!organization) {
      return res.status(404).send({ message: 'Organizer organization profile not found.' });
    }

    const payload = {
      name: typeof req.body.name === 'string' ? req.body.name.trim() : organization.name,
      description: typeof req.body.description === 'string' ? req.body.description.trim() : organization.description,
      city: typeof req.body.city === 'string' ? req.body.city.trim() : organization.city,
      district: typeof req.body.district === 'string' ? req.body.district.trim() : organization.district,
      address: typeof req.body.address === 'string' ? req.body.address.trim() : organization.address,
      contactEmail: typeof req.body.contactEmail === 'string' ? req.body.contactEmail.trim().toLowerCase() : organization.contactEmail,
      phoneNumber: typeof req.body.phoneNumber === 'string' ? req.body.phoneNumber.trim() : organization.phoneNumber,
      website: typeof req.body.website === 'string' ? req.body.website.trim() : organization.website,
      organizationType: typeof req.body.organizationType === 'string' ? req.body.organizationType.trim() : organization.organizationType,
      avatarUrl: typeof req.body.avatarUrl === 'string' ? req.body.avatarUrl.trim() : organization.avatarUrl,
    };

    if (!payload.name) {
      return res.status(400).send({ message: 'Organization name is required.' });
    }

    let updated = await models.organization.findOneAndUpdate({ _id: mongo.toObjectId(organization.id) }, { $set: payload }, { new: true }).lean();
    updated = mongo.toPlain(updated);
    res.send(updated);
  } catch (error) {
    next(error);
  }
};

exports.claimOrganization = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organizationId = typeof req.body.organizationId === 'string' ? req.body.organizationId.trim() : '';
    if (!organizationId) {
      return res.status(400).send({ message: 'organizationId is required.' });
    }

    let org = await models.organization.findOne({ _id: mongo.toObjectId(organizationId) }).lean();
    org = mongo.toPlain(org);
    if (!org) {
      return res.status(404).send({ message: 'Organization not found.' });
    }

    org = await models.organization.findOneAndUpdate({ _id: mongo.toObjectId(org.id) }, { $set: { ownerUserId: mongo.toObjectId(authUser.userId) } }, { new: true }).lean();
    org = mongo.toPlain(org);
    res.send(org);
  } catch (error) {
    next(error);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    if (!organization) {
      return res.status(404).send({ message: 'Organizer organization profile not found.' });
    }

    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : '';
    const paging = toPageParams(req.query, 10);

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
      id: event.id,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      status: event.status,
      isHidden: Boolean(event.isHidden),
      maxVolunteers: event.maxVolunteers,
      categoryId: event.categoryId,
      categoryName: event.categoryId && event.categoryId.name ? event.categoryId.name : null,
      registrationCount: registrationCountByEvent[event.id] || 0,
    }));

    res.send({ items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) });
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!organization) return res.status(404).send({ message: 'Organizer organization profile not found.' });
    if (!id) return res.status(400).send({ message: 'Invalid event id.' });

    let event = await models.event.findOne({ _id: mongo.toObjectId(id), organizationId: mongo.toObjectId(organization.id) }).populate('categoryId').lean();
    event = mongo.toPlain(event);
    if (!event) return res.status(404).send({ message: 'Event not found.' });

    res.send({ id: event.id, title: event.title, description: event.description, startTime: event.startTime, endTime: event.endTime, location: event.location, status: event.status, isHidden: Boolean(event.isHidden), maxVolunteers: event.maxVolunteers, images: event.images, categoryId: event.categoryId, categoryName: event.categoryId && event.categoryId.name ? event.categoryId.name : null });
  } catch (error) {
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    if (!organization) return res.status(404).send({ message: 'Organizer organization profile not found.' });

    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : null;
    const location = typeof req.body.location === 'string' ? req.body.location.trim() : null;
    const categoryId = typeof req.body.categoryId === 'string' ? req.body.categoryId.trim() : null;
    const images = typeof req.body.images === 'string' ? req.body.images.trim() : null;
    const maxVolunteers = Number(req.body.maxVolunteers);
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);

    if (!title || !Number.isFinite(startTime.valueOf()) || !Number.isFinite(endTime.valueOf())) {
      return res.status(400).send({ message: 'title, startTime, and endTime are required.' });
    }
    if (endTime <= startTime) {
      return res.status(400).send({ message: 'endTime must be later than startTime.' });
    }

    let event = await models.event.create({ title, description, location, categoryId: categoryId ? mongo.toObjectId(categoryId) : null, maxVolunteers: Number.isFinite(maxVolunteers) && maxVolunteers >= 0 ? maxVolunteers : 0, startTime, endTime, organizationId: mongo.toObjectId(organization.id), status: 'draft', images: images, isHidden: false });
    event = mongo.toPlain(event.toObject());
    res.status(201).send(event);
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!organization) return res.status(404).send({ message: 'Organizer organization profile not found.' });
    if (!id) return res.status(400).send({ message: 'Invalid event id.' });

    let event = await models.event.findOne({ _id: mongo.toObjectId(id), organizationId: mongo.toObjectId(organization.id) }).lean();
    event = mongo.toPlain(event);
    if (!event) return res.status(404).send({ message: 'Event not found.' });

    const data = {};
    if (typeof req.body.title === 'string') data.title = req.body.title.trim();
    if (typeof req.body.description === 'string') data.description = req.body.description.trim();
    if (typeof req.body.location === 'string') data.location = req.body.location.trim();
    if (typeof req.body.categoryId === 'string') data.categoryId = req.body.categoryId.trim() || null;
    if (typeof req.body.images === 'string') data.images = req.body.images.trim() || null;
    if (Number.isFinite(Number(req.body.maxVolunteers))) data.maxVolunteers = Number(req.body.maxVolunteers);
    if (req.body.startTime && Number.isFinite(new Date(req.body.startTime).valueOf())) data.startTime = new Date(req.body.startTime);
    if (req.body.endTime && Number.isFinite(new Date(req.body.endTime).valueOf())) data.endTime = new Date(req.body.endTime);
    if (Object.prototype.hasOwnProperty.call(data, 'categoryId')) data.categoryId = data.categoryId ? mongo.toObjectId(data.categoryId) : null;

    event = await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: data }, { new: true }).lean();
    event = mongo.toPlain(event);
    res.send(event);
  } catch (error) {
    next(error);
  }
};

exports.hideEvent = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!organization) return res.status(404).send({ message: 'Organizer organization profile not found.' });

    let event = await models.event.findOne({ _id: mongo.toObjectId(id), organizationId: mongo.toObjectId(organization.id) }).lean();
    event = mongo.toPlain(event);
    if (!event) return res.status(404).send({ message: 'Event not found.' });

    event = await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: { isHidden: true, status: 'hidden' } }, { new: true }).lean();
    event = mongo.toPlain(event);
    res.send({ id: event.id, status: event.status, isHidden: event.isHidden });
  } catch (error) {
    next(error);
  }
};

exports.unhideEvent = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!organization) return res.status(404).send({ message: 'Organizer organization profile not found.' });

    let event = await models.event.findOne({ _id: mongo.toObjectId(id), organizationId: mongo.toObjectId(organization.id) }).lean();
    event = mongo.toPlain(event);
    if (!event) return res.status(404).send({ message: 'Event not found.' });

    event = await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: { isHidden: false, status: 'pending' } }, { new: true }).lean();
    event = mongo.toPlain(event);
    res.send({ id: event.id, status: event.status, isHidden: event.isHidden });
  } catch (error) {
    next(error);
  }
};

exports.getVolunteers = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    if (!organization) return res.status(404).send({ message: 'Organizer organization profile not found.' });

    const eventId = typeof req.query.eventId === 'string' ? req.query.eventId.trim() : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const paging = toPageParams(req.query, 10);

    let ownedEvents = await models.event.find({ organizationId: mongo.toObjectId(organization.id) }).select('_id').lean();
    ownedEvents = mongo.toPlain(ownedEvents);
    const ownedEventIds = ownedEvents.map((item) => mongo.toObjectId(item.id));

    let rows = await models.eventRegistration.find({ eventId: { $in: ownedEventIds } }).populate('eventId').populate('volunteerId').sort({ registeredAt: -1 }).lean();
    rows = mongo.toPlain(rows);

    rows = rows.filter((item) => {
      if (eventId && item.eventId !== eventId) return false;
      if (status && item.status !== status) return false;
      if (!search) return true;
      return (item.fullName || '').toLowerCase().includes(search)
        || (item.phone || '').toLowerCase().includes(search)
        || (item.volunteer && (item.volunteer.fullName || '').toLowerCase().includes(search));
    });

    const totalCount = rows.length;
    const items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map((item) => ({
      id: item.id,
      status: item.status,
      fullName: item.fullName,
      phone: item.phone,
      reason: item.reason,
      registeredAt: item.registeredAt,
      event: { id: item.eventId, title: item.eventId ? item.eventId.title : '', startTime: item.eventId ? item.eventId.startTime : null, location: item.eventId ? item.eventId.location : null },
      volunteer: { id: item.volunteerId ? item.volunteerId.id : null, userId: item.volunteerId ? item.volunteerId.userId : null, fullName: item.volunteerId ? item.volunteerId.fullName : item.fullName, phone: item.volunteerId ? item.volunteerId.phone : item.phone },
    }));

    res.send({ items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) });
  } catch (error) {
    next(error);
  }
};

exports.updateRegistrationStatus = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    const action = typeof req.body.action === 'string' ? req.body.action : '';
    if (!organization) return res.status(404).send({ message: 'Organizer organization profile not found.' });
    if (!id) return res.status(400).send({ message: 'Invalid registration id.' });

    let registration = await models.eventRegistration.findOne({ _id: mongo.toObjectId(id) }).populate('eventId').lean();
    registration = mongo.toPlain(registration);
    if (!registration) return res.status(404).send({ message: 'Registration not found.' });
    const event = registration.eventId;
    if (!event || event.organizationId !== organization.id) return res.status(403).send({ message: 'You do not have access to this registration.' });

    if (action === 'approve') {
      registration = await models.eventRegistration.findOneAndUpdate({ _id: mongo.toObjectId(registration.id) }, { $set: { status: 'Confirmed' } }, { new: true }).lean();
    } else if (action === 'reject') {
      registration = await models.eventRegistration.findOneAndUpdate({ _id: mongo.toObjectId(registration.id) }, { $set: { status: 'Rejected' } }, { new: true }).lean();
    } else {
      return res.status(400).send({ message: "action must be 'approve' or 'reject'." });
    }

    registration = mongo.toPlain(registration);
    res.send({ id: registration.id, status: registration.status });
  } catch (error) {
    next(error);
  }
};

exports.getRegistrationById = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!organization) return res.status(404).send({ message: 'Organizer organization profile not found.' });
    if (!id) return res.status(400).send({ message: 'Invalid registration id.' });

    let row = await models.eventRegistration.findOne({ _id: mongo.toObjectId(id) }).populate('eventId').populate('volunteerId').lean();
    row = mongo.toPlain(row);
    if (!row) return res.status(404).send({ message: 'Registration not found.' });

    const event = row.eventId;
    const volunteer = row.volunteerId;
    if (!event || event.organizationId !== organization.id) return res.status(403).send({ message: 'You do not have access to this registration.' });

    res.send({ id: row.id, status: row.status, fullName: row.fullName, phone: row.phone, reason: row.reason, registeredAt: row.registeredAt, event: { id: event.id, title: event.title, startTime: event.startTime, endTime: event.endTime, location: event.location, status: event.status }, volunteer: { id: volunteer ? volunteer.id : null, userId: volunteer ? volunteer.userId : null, fullName: volunteer ? volunteer.fullName : row.fullName, phone: volunteer ? volunteer.phone : row.phone } });
  } catch (error) {
    next(error);
  }
};

exports.getVolunteerHistory = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    const volunteerId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!organization) return res.status(404).send({ message: 'Organizer organization profile not found.' });
    if (!volunteerId) return res.status(400).send({ message: 'Invalid volunteer id.' });

    let ownedEvents = await models.event.find({ organizationId: mongo.toObjectId(organization.id) }).select('_id').lean();
    ownedEvents = mongo.toPlain(ownedEvents);
    const ownedEventIds = ownedEvents.map((item) => mongo.toObjectId(item.id));

    let rows = await models.eventRegistration.find({ volunteerId: mongo.toObjectId(volunteerId), eventId: { $in: ownedEventIds } }).populate('eventId').sort({ registeredAt: -1 }).lean();
    rows = mongo.toPlain(rows);

    const items = rows.map((row) => ({ id: row.id, status: row.status, reason: row.reason, registeredAt: row.registeredAt, event: { id: row.eventId ? row.eventId.id : null, title: row.eventId ? row.eventId.title : '', location: row.eventId ? row.eventId.location : null, startTime: row.eventId ? row.eventId.startTime : null, endTime: row.eventId ? row.eventId.endTime : null, status: row.eventId ? row.eventId.status : null } }));

    res.send({ items });
  } catch (error) {
    next(error);
  }
};

exports.getRegistrationEvaluation = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const organization = await getOwnedOrganization(authUser.userId);
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!organization) return res.status(404).send({ message: 'Organizer organization profile not found.' });
    if (!id) return res.status(400).send({ message: 'Invalid registration id.' });

    let registration = await models.eventRegistration.findOne({ _id: mongo.toObjectId(id) }).populate('eventId').lean();
    registration = mongo.toPlain(registration);
    if (!registration) return res.status(404).send({ message: 'Registration not found.' });
    const event = registration.eventId;
    if (!event || event.organizationId !== organization.id) return res.status(403).send({ message: 'You do not have access to this registration.' });

    let evaluation = await models.volunteerEvaluation.findOne({ registrationId: mongo.toObjectId(id) }).lean();
    evaluation = mongo.toPlain(evaluation);
    res.send({ item: evaluation || null });
  } catch (error) {
    next(error);
  }
};
