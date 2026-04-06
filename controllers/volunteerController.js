const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toTrimmed(value) {
  if (Array.isArray(value)) {
    return (value[0] || '').trim();
  }

  return (value || '').trim();
}

function assertAccess(reqUserId, authUser) {
  if (!authUser) return false;

  const normalizedReqUserId = String(reqUserId || '').trim();
  const normalizedAuthUserId = String(authUser.userId || '').trim();

  return normalizedReqUserId === normalizedAuthUserId || authUser.role === 'Admin';
}

function safeObjectId(id) {
  try {
    return mongo.toObjectId(id);
  } catch (err) {
    return null;
  }
}

function ensureModel(name) {
  if (!models[name]) {
    throw { status: 500, message: `Server misconfiguration: missing model ${name}` };
  }

  return true;
}

module.exports = {
  async getVolunteerProfile(authUser, userId) {
    userId = toTrimmed(userId);

    if (!assertAccess(userId, authUser)) {
      throw { status: 403, message: 'You do not have access to this profile.' };
    }

    if (!userId) {
      throw { status: 400, message: 'userId is required.' };
    }

    ensureModel('appUser');
    ensureModel('volunteer');
    ensureModel('eventRegistration');
    ensureModel('eventFavorite');

    let user = await models.appUser.findOne({ _id: safeObjectId(userId) }).lean();
    user = mongo.toPlain(user);

    let volunteer = await models.volunteer.findOneAndUpdate(
      { userId: safeObjectId(userId) },
      {
        $set: {
          fullName: user ? user.fullName : 'Volunteer',
          phone: user ? user.phone : null,
        },
      },
      { new: true, upsert: false }
    ).lean();

    if (!volunteer) {
      const created = await models.volunteer.create({
        userId: safeObjectId(userId),
        fullName: user ? user.fullName : 'Volunteer',
        phone: user ? user.phone : null,
      });
      volunteer = created.toObject ? created.toObject() : created;
    }

    volunteer = mongo.toPlain(volunteer);

    const volunteerId = volunteer._id || volunteer.id;
    if (!volunteerId) {
      throw { status: 500, message: 'Volunteer record is invalid.' };
    }

    const totalEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId) });
    const completedEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId), status: 'Confirmed' });
    const pendingEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId), status: 'Pending' });
    const favoriteEvents = await models.eventFavorite.countDocuments({ volunteerId: safeObjectId(volunteerId) });

    return {
      userId: volunteer.userId,
      fullName: volunteer.fullName,
      phone: volunteer.phone,
      stats: {
        totalEvents,
        completedEvents,
        pendingEvents,
        favoriteEvents,
      },
    };
  },

  async getVolunteerRegistrations(authUser, userId) {
    userId = toTrimmed(userId);

    if (!assertAccess(userId, authUser)) {
      throw { status: 403, message: 'You do not have access to these registrations.' };
    }

    ensureModel('volunteer');
    ensureModel('eventRegistration');

    const volunteer = await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean();
    if (!volunteer) return [];

    const volunteerId = volunteer._id || volunteer.id;
    if (!volunteerId) return [];

    let rows = await models.eventRegistration
      .find({ volunteerId: safeObjectId(volunteerId) })
      .sort({ registeredAt: -1 })
      .populate('eventId')
      .lean();

    rows = mongo.toPlain(rows);

    return (rows || [])
      .map((item) => {
        const event = item.eventId;
        if (!event) return null;

        return {
          id: item._id || item.id,
          eventId: event._id || event.id,
          eventTitle: event.title || '',
          thumbnail: event.images || [],
          registrationDate: item.registeredAt,
          status: item.status,
          eventLocation: event.location || '',
          eventDate: event.startTime || null,
        };
      })
      .filter(Boolean);
  },

  async removeVolunteerRegistration(authUser, userId, registrationId) {
    userId = toTrimmed(userId);
    registrationId = toTrimmed(registrationId);

    if (!assertAccess(userId, authUser)) {
      throw { status: 403, message: 'You do not have access to these registrations.' };
    }

    ensureModel('volunteer');
    ensureModel('eventRegistration');

    const volunteer = await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean();
    if (!volunteer || !registrationId) {
      throw { status: 404, message: 'Registration not found.' };
    }

    const volunteerId = volunteer._id || volunteer.id;
    const registration = await models.eventRegistration.findOne({
      _id: safeObjectId(registrationId),
      volunteerId: safeObjectId(volunteerId),
    }).lean();

    if (!registration) {
      throw { status: 404, message: 'Registration not found.' };
    }

    await models.eventRegistration.findOneAndDelete({ _id: safeObjectId(registration._id || registration.id) });
    return { message: 'Registration removed.' };
  },

  async getVolunteerFavorites(authUser, userId) {
    userId = toTrimmed(userId);

    if (!assertAccess(userId, authUser)) {
      throw { status: 403, message: 'You do not have access to these favorites.' };
    }

    ensureModel('volunteer');
    ensureModel('eventFavorite');

    const volunteer = await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean();
    if (!volunteer) return [];

    const volunteerId = volunteer._id || volunteer.id;

    let rows = await models.eventFavorite
      .find({ volunteerId: safeObjectId(volunteerId) })
      .sort({ createdAt: -1 })
      .populate({
        path: 'eventId',
        populate: { path: 'categoryId' },
      })
      .lean();

    rows = mongo.toPlain(rows);

    return (rows || [])
      .map((item) => {
        const event = item.eventId;
        if (!event) return null;
        const category = event.categoryId;
        return {
          id: event._id || event.id,
          title: event.title || '',
          thumbnail: event.images || [],
          category: category ? category.name : 'Chung',
          location: event.location || '',
          date: event.startTime || null,
          status: event.status || '',
        };
      })
      .filter(Boolean);
  },

  async removeVolunteerFavorite(authUser, userId, eventId) {
    userId = toTrimmed(userId);
    eventId = toTrimmed(eventId);

    if (!assertAccess(userId, authUser)) {
      throw { status: 403, message: 'You do not have access to these favorites.' };
    }

    ensureModel('volunteer');
    ensureModel('eventFavorite');

    const volunteer = await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean();
    if (!volunteer || !eventId) {
      throw { status: 404, message: 'Favorite not found.' };
    }

    const volunteerId = volunteer._id || volunteer.id;
    const favorite = await models.eventFavorite.findOne({
      eventId: safeObjectId(eventId),
      volunteerId: safeObjectId(volunteerId),
    }).lean();

    if (!favorite) {
      throw { status: 404, message: 'Favorite not found.' };
    }

    await models.eventFavorite.findOneAndDelete({ _id: safeObjectId(favorite._id || favorite.id) });
    return { message: 'Favorite removed.' };
  },

  async getVolunteerDashboard(authUser, userId) {
    userId = toTrimmed(userId);

    if (!assertAccess(userId, authUser)) {
      throw { status: 403, message: 'You do not have access to this dashboard.' };
    }

    ensureModel('volunteer');
    ensureModel('eventRegistration');

    const volunteer = await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean();
    if (!volunteer) {
      throw { status: 404, message: 'Volunteer not found.' };
    }

    const volunteerId = volunteer._id || volunteer.id;

    const totalRegistrations = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId) });
    const completedEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId), status: 'Confirmed' });
    const pendingEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId), status: 'Pending' });

    let upcomingRegs = await models.eventRegistration
      .find({ volunteerId: safeObjectId(volunteerId) })
      .populate('eventId')
      .sort({ registeredAt: -1 })
      .limit(3)
      .lean();

    upcomingRegs = mongo.toPlain(upcomingRegs || []);

    return {
      stats: {
        totalEvents: totalRegistrations,
        completedEvents,
        pendingEvents,
        totalHours: completedEvents * 4,
        rank: 'Silver Volunteer',
        points: completedEvents * 150,
      },
      upcomingEvents: (upcomingRegs || []).map((reg) => {
        const ev = reg.eventId || {};
        return {
          id: ev._id || ev.id || null,
          title: ev.title || 'Unknown event',
          date: ev.startTime || reg.registeredAt,
          status: reg.status || 'Unknown',
        };
      }),
    };
  },

  async getEventComments(eventId) {
    eventId = toTrimmed(eventId);

    if (!eventId) {
      throw { status: 400, message: 'eventId is required.' };
    }

    ensureModel('eventComment');
    ensureModel('appUser');

    let comments = await models.eventComment
      .find({ eventId: safeObjectId(eventId), isHidden: false })
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    comments = mongo.toPlain(comments || []);

    return (comments || []).map((c) => ({
      id: c._id || c.id,
      userId: c.userId ? (c.userId._id || c.userId.id) : null,
      userName: c.userId ? c.userId.fullName : 'Anonymous',
      content: c.content,
      createdAt: c.createdAt,
    }));
  },

  async createEventComment(authUser, eventId, content) {
    eventId = toTrimmed(eventId);
    content = toTrimmed(content);

    if (!eventId) {
      throw { status: 400, message: 'eventId is required.' };
    }

    if (!content) {
      throw { status: 400, message: 'Comment content is required.' };
    }

    ensureModel('eventComment');
    ensureModel('event');

    const ev = await models.event.findOne({ _id: safeObjectId(eventId) }).lean();
    if (!ev) {
      throw { status: 404, message: 'Event not found.' };
    }

    const comment = await models.eventComment.create({
      eventId: safeObjectId(eventId),
      userId: safeObjectId(authUser.userId),
      content,
      isHidden: false,
    });

    return {
      id: comment._id || comment.id,
      userId: authUser.userId,
      userName: authUser.fullName,
      content,
      createdAt: comment.createdAt,
    };
  },

  async getEventRatings(eventId) {
    eventId = toTrimmed(eventId);

    if (!eventId) {
      throw { status: 400, message: 'eventId is required.' };
    }

    ensureModel('eventRating');
    ensureModel('appUser');

    let ratings = await models.eventRating
      .find({ eventId: safeObjectId(eventId), isHidden: false })
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    ratings = mongo.toPlain(ratings || []);

    const averageRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

    return {
      averageRating: parseFloat(averageRating),
      totalRatings: ratings.length,
      ratings: (ratings || []).map((r) => ({
        id: r._id || r.id,
        userId: r.userId ? (r.userId._id || r.userId.id) : null,
        userName: r.userId ? r.userId.fullName : 'Anonymous',
        rating: r.rating,
        review: r.review,
        createdAt: r.createdAt,
      })),
    };
  },

  async createOrUpdateEventRating(authUser, eventId, rating, review) {
    eventId = toTrimmed(eventId);
    rating = parseInt(rating || 0);
    review = toTrimmed(review);

    if (!eventId) {
      throw { status: 400, message: 'eventId is required.' };
    }

    if (!rating || rating < 1 || rating > 5) {
      throw { status: 400, message: 'Rating must be between 1 and 5.' };
    }

    ensureModel('eventRating');
    ensureModel('event');

    const ev = await models.event.findOne({ _id: safeObjectId(eventId) }).lean();
    if (!ev) {
      throw { status: 404, message: 'Event not found.' };
    }

    const existingRating = await models.eventRating.findOne({
      eventId: safeObjectId(eventId),
      userId: safeObjectId(authUser.userId),
    });

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review || null;
      await existingRating.save();

      return {
        id: existingRating._id || existingRating.id,
        userId: authUser.userId,
        userName: authUser.fullName,
        rating,
        review,
        createdAt: existingRating.createdAt,
        updatedAt: existingRating.updatedAt,
      };
    }

    const newRating = await models.eventRating.create({
      eventId: safeObjectId(eventId),
      userId: safeObjectId(authUser.userId),
      rating,
      review: review || null,
      isHidden: false,
    });

    return {
      id: newRating._id || newRating.id,
      userId: authUser.userId,
      userName: authUser.fullName,
      rating,
      review,
      createdAt: newRating.createdAt,
    };
  },

  async updateVolunteerProfile(authUser, userId, fullName, phone) {
    userId = toTrimmed(userId);
    fullName = typeof fullName === 'string' ? fullName.trim() : '';
    phone = typeof phone === 'string' && phone.trim() !== '' ? phone.trim() : null;

    if (!assertAccess(userId, authUser)) {
      throw { status: 403, message: 'You do not have access to this profile.' };
    }

    if (!userId) {
      throw { status: 400, message: 'userId is required.' };
    }

    if (!fullName || !toTrimmed(fullName)) {
      throw { status: 400, message: 'Validation failed.', errors: { fullName: 'Vui lòng nhập họ và tên.' } };
    }

    ensureModel('appUser');
    ensureModel('volunteer');

    await models.appUser.findOneAndUpdate(
      { _id: safeObjectId(userId) },
      { $set: { fullName: toTrimmed(fullName), phone: phone ? toTrimmed(phone) : null } },
      { new: true }
    );

    let volunteer = await models.volunteer.findOneAndUpdate(
      { userId: safeObjectId(userId) },
      { $set: { fullName: toTrimmed(fullName), phone: phone ? toTrimmed(phone) : null } },
      { new: true }
    ).lean();

    if (!volunteer) {
      throw { status: 404, message: 'Volunteer profile not found.' };
    }

    volunteer = mongo.toPlain(volunteer);
    return {
      userId: volunteer.userId,
      fullName: volunteer.fullName,
      phone: volunteer.phone,
      message: 'Profile updated successfully.',
    };
  },

  async uploadVolunteerAvatar(authUser, userId, avatarData) {
    userId = toTrimmed(userId);

    if (!assertAccess(userId, authUser)) {
      throw { status: 403, message: 'You do not have access to upload avatar.' };
    }

    if (!userId || !avatarData) {
      throw { status: 400, message: 'userId and avatarData are required.' };
    }

    if (!avatarData.startsWith('data:image/')) {
      throw { status: 400, message: 'Invalid image data format.' };
    }

    ensureModel('volunteer');

    let volunteer = await models.volunteer.findOneAndUpdate(
      { userId: safeObjectId(userId) },
      { $set: { avatar: avatarData } },
      { new: true }
    ).lean();

    if (!volunteer) {
      throw { status: 404, message: 'Volunteer profile not found.' };
    }

    volunteer = mongo.toPlain(volunteer);
    return {
      avatar: volunteer.avatar,
      message: 'Avatar uploaded successfully.',
    };
  },
};