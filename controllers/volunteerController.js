// controllers/volunteerController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function safeObjectId(id) {
  try { return mongo.toObjectId(id); } catch (err) { return null; }
}

module.exports = {
  getProfile: async function (userId) {
    userId = (userId || '').trim();
    if (!userId) throw { status: 400, message: 'userId is required.' };
    let user = mongo.toPlain(await models.appUser.findOne({ _id: safeObjectId(userId) }).lean());
    let volunteer = await models.volunteer.findOneAndUpdate(
      { userId: safeObjectId(userId) },
      { $set: { fullName: user ? user.fullName : 'Volunteer', phone: user ? user.phone : null } },
      { new: true, upsert: false }
    ).lean();
    if (!volunteer) {
      let created = await models.volunteer.create({ userId: safeObjectId(userId), fullName: user ? user.fullName : 'Volunteer', phone: user ? user.phone : null });
      volunteer = created.toObject ? created.toObject() : created;
    }
    volunteer = mongo.toPlain(volunteer);
    const volunteerId = volunteer._id || volunteer.id;
    if (!volunteerId) throw { status: 500, message: 'Volunteer record is invalid.' };
    const totalEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId) });
    const completedEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId), status: 'Confirmed' });
    const pendingEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId), status: 'Pending' });
    const favoriteEvents = await models.eventFavorite.countDocuments({ volunteerId: safeObjectId(volunteerId) });
    return { userId: volunteer.userId, fullName: volunteer.fullName, phone: volunteer.phone, stats: { totalEvents, completedEvents, pendingEvents, favoriteEvents } };
  },

  updateProfile: async function (userId, fullName, phone) {
    userId = (userId || '').trim();
    fullName = typeof fullName === 'string' ? fullName.trim() : '';
    phone = typeof phone === 'string' && phone.trim() !== '' ? phone.trim() : null;
    if (!userId) throw { status: 400, message: 'userId is required.' };
    if (!fullName) throw { status: 400, message: 'Vui lòng nhập họ và tên.' };
    await models.appUser.findOneAndUpdate({ _id: safeObjectId(userId) }, { $set: { fullName, phone } }, { new: true });
    let volunteer = mongo.toPlain(await models.volunteer.findOneAndUpdate({ userId: safeObjectId(userId) }, { $set: { fullName, phone } }, { new: true }).lean());
    if (!volunteer) throw { status: 404, message: 'Volunteer profile not found.' };
    return { userId: volunteer.userId, fullName: volunteer.fullName, phone: volunteer.phone, message: 'Profile updated successfully.' };
  },

  uploadAvatar: async function (userId, avatarData) {
    userId = (userId || '').trim();
    if (!userId || !avatarData) throw { status: 400, message: 'userId and avatarData are required.' };
    if (!avatarData.startsWith('data:image/')) throw { status: 400, message: 'Invalid image data format.' };
    let volunteer = mongo.toPlain(await models.volunteer.findOneAndUpdate({ userId: safeObjectId(userId) }, { $set: { avatar: avatarData } }, { new: true }).lean());
    if (!volunteer) throw { status: 404, message: 'Volunteer profile not found.' };
    return { avatar: volunteer.avatar, message: 'Avatar uploaded successfully.' };
  },

  getRegistrations: async function (userId) {
    userId = (userId || '').trim();
    let volunteer = mongo.toPlain(await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean());
    if (!volunteer) return [];
    const volunteerId = volunteer._id || volunteer.id;
    let rows = mongo.toPlain(await models.eventRegistration.find({ volunteerId: safeObjectId(volunteerId) }).sort({ registeredAt: -1 }).populate('eventId').lean());
    return rows.map(function (item) {
      const event = item.eventId;
      if (!event) return null;
      return { id: item._id || item.id, eventId: event._id || event.id, eventTitle: event.title || '', thumbnail: event.images || [], registrationDate: item.registeredAt, status: item.status, eventLocation: event.location || '', eventDate: event.startTime || null };
    }).filter(Boolean);
  },

  deleteRegistration: async function (userId, registrationId) {
    userId = (userId || '').trim();
    registrationId = (registrationId || '').trim();
    let volunteer = mongo.toPlain(await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean());
    if (!volunteer || !registrationId) throw { status: 404, message: 'Registration not found.' };
    const volunteerId = volunteer._id || volunteer.id;
    let registration = mongo.toPlain(await models.eventRegistration.findOne({ _id: safeObjectId(registrationId), volunteerId: safeObjectId(volunteerId) }).lean());
    if (!registration) throw { status: 404, message: 'Registration not found.' };
    await models.eventRegistration.findOneAndDelete({ _id: safeObjectId(registration._id || registration.id) });
    return { message: 'Registration removed.' };
  },

  getFavorites: async function (userId) {
    userId = (userId || '').trim();
    let volunteer = mongo.toPlain(await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean());
    if (!volunteer) return [];
    const volunteerId = volunteer._id || volunteer.id;
    let rows = mongo.toPlain(await models.eventFavorite.find({ volunteerId: safeObjectId(volunteerId) }).sort({ createdAt: -1 }).populate({ path: 'eventId', populate: { path: 'categoryId' } }).lean());
    return rows.map(function (item) {
      const event = item.eventId;
      if (!event) return null;
      const category = event.categoryId;
      return { id: event._id || event.id, title: event.title || '', thumbnail: event.images || [], category: category ? category.name : 'Chung', location: event.location || '', date: event.startTime || null, status: event.status || '' };
    }).filter(Boolean);
  },

  deleteFavorite: async function (userId, eventId) {
    userId = (userId || '').trim();
    eventId = (eventId || '').trim();
    let volunteer = mongo.toPlain(await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean());
    if (!volunteer || !eventId) throw { status: 404, message: 'Favorite not found.' };
    const volunteerId = volunteer._id || volunteer.id;
    let favorite = mongo.toPlain(await models.eventFavorite.findOne({ eventId: safeObjectId(eventId), volunteerId: safeObjectId(volunteerId) }).lean());
    if (!favorite) throw { status: 404, message: 'Favorite not found.' };
    await models.eventFavorite.findOneAndDelete({ _id: safeObjectId(favorite._id || favorite.id) });
    return { message: 'Favorite removed.' };
  },

  getDashboard: async function (userId) {
    userId = (userId || '').trim();
    let volunteer = mongo.toPlain(await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean());
    if (!volunteer) throw { status: 404, message: 'Volunteer not found.' };
    const volunteerId = volunteer._id || volunteer.id;
    const totalRegistrations = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId) });
    const completedEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId), status: 'Confirmed' });
    const pendingEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId), status: 'Pending' });
    let upcomingRegs = mongo.toPlain(await models.eventRegistration.find({ volunteerId: safeObjectId(volunteerId) }).populate('eventId').sort({ registeredAt: -1 }).limit(3).lean());
    return {
      stats: { totalEvents: totalRegistrations, completedEvents, pendingEvents, totalHours: completedEvents * 4, rank: 'Silver Volunteer', points: completedEvents * 150 },
      upcomingEvents: upcomingRegs.map((reg) => { const ev = reg.eventId || {}; return { id: ev._id || ev.id || null, title: ev.title || 'Unknown event', date: ev.startTime || reg.registeredAt, status: reg.status || 'Unknown' }; }),
    };
  },

  getEventComments: async function (eventId) {
    eventId = (eventId || '').trim();
    if (!eventId) throw { status: 400, message: 'eventId is required.' };
    let comments = mongo.toPlain(await models.eventComment.find({ eventId: safeObjectId(eventId), isHidden: false }).populate('userId', 'fullName').sort({ createdAt: -1 }).lean());
    return comments.map(c => ({ id: c._id || c.id, userId: c.userId ? (c.userId._id || c.userId.id) : null, userName: c.userId ? c.userId.fullName : 'Anonymous', content: c.content, createdAt: c.createdAt }));
  },

  createEventComment: async function (eventId, userId, fullName, content) {
    eventId = (eventId || '').trim();
    content = (content || '').trim();
    if (!eventId) throw { status: 400, message: 'eventId is required.' };
    if (!content) throw { status: 400, message: 'Comment content is required.' };
    let ev = mongo.toPlain(await models.event.findOne({ _id: safeObjectId(eventId) }).lean());
    if (!ev) throw { status: 404, message: 'Event not found.' };
    let comment = await models.eventComment.create({ eventId: safeObjectId(eventId), userId: safeObjectId(userId), content, isHidden: false });
    return { id: comment._id || comment.id, userId, userName: fullName, content, createdAt: comment.createdAt };
  },

  getEventRatings: async function (eventId) {
    eventId = (eventId || '').trim();
    if (!eventId) throw { status: 400, message: 'eventId is required.' };
    let ratings = mongo.toPlain(await models.eventRating.find({ eventId: safeObjectId(eventId), isHidden: false }).populate('userId', 'fullName').sort({ createdAt: -1 }).lean());
    const averageRating = ratings.length > 0 ? parseFloat((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)) : 0;
    return { averageRating, totalRatings: ratings.length, ratings: ratings.map(r => ({ id: r._id || r.id, userId: r.userId ? (r.userId._id || r.userId.id) : null, userName: r.userId ? r.userId.fullName : 'Anonymous', rating: r.rating, review: r.review, createdAt: r.createdAt })) };
  },

  createOrUpdateRating: async function (eventId, userId, fullName, rating, review) {
    eventId = (eventId || '').trim();
    rating = parseInt(rating || 0);
    review = (review || '').trim();
    if (!eventId) throw { status: 400, message: 'eventId is required.' };
    if (!rating || rating < 1 || rating > 5) throw { status: 400, message: 'Rating must be between 1 and 5.' };
    let ev = mongo.toPlain(await models.event.findOne({ _id: safeObjectId(eventId) }).lean());
    if (!ev) throw { status: 404, message: 'Event not found.' };
    let existingRating = await models.eventRating.findOne({ eventId: safeObjectId(eventId), userId: safeObjectId(userId) });
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review || null;
      await existingRating.save();
      return { updated: true, id: existingRating._id || existingRating.id, userId, userName: fullName, rating, review, createdAt: existingRating.createdAt, updatedAt: existingRating.updatedAt };
    } else {
      let newRating = await models.eventRating.create({ eventId: safeObjectId(eventId), userId: safeObjectId(userId), rating, review: review || null, isHidden: false });
      return { updated: false, id: newRating._id || newRating.id, userId, userName: fullName, rating, review, createdAt: newRating.createdAt };
    }
  },
};
