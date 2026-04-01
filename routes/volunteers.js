var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var models = require('../utils/models');
var mongo = require('../utils/mongo');

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

function ensureModel(name, res) {
  if (!models[name]) {
    console.error(`Missing model: ${name}`);
    if (res) res.status(500).send({ message: `Server misconfiguration: missing model ${name}` });
    return false;
  }
  return true;
}

// GET: Volunteer profile
router.get('/volunteers/:userId/profile', authHandler.requireAuth, async function (req, res, next) {
  try {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;

    if (!assertAccess(userId, authUser)) {
      return res.status(403).send({ message: 'You do not have access to this profile.' });
    }

    if (!userId) {
      return res.status(400).send({ message: 'userId is required.' });
    }

    if (!ensureModel('appUser', res) || !ensureModel('volunteer', res)) return;

    var user = await models.appUser.findOne({ _id: safeObjectId(userId) }).lean();
    user = mongo.toPlain(user);

    var volunteer = await models.volunteer.findOneAndUpdate(
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
      var created = await models.volunteer.create({
        userId: safeObjectId(userId),
        fullName: user ? user.fullName : 'Volunteer',
        phone: user ? user.phone : null,
      });
      volunteer = created.toObject ? created.toObject() : created;
    }

    volunteer = mongo.toPlain(volunteer);

    const volunteerId = volunteer._id || volunteer.id;
    if (!volunteerId) {
      return res.status(500).send({ message: 'Volunteer record is invalid.' });
    }

    if (!ensureModel('eventRegistration', res) || !ensureModel('eventFavorite', res)) return;

    var totalEvents = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId) });
    var completedEvents = await models.eventRegistration.countDocuments({
      volunteerId: safeObjectId(volunteerId),
      status: 'Confirmed',
    });
    var pendingEvents = await models.eventRegistration.countDocuments({
      volunteerId: safeObjectId(volunteerId),
      status: 'Pending',
    });
    var favoriteEvents = await models.eventFavorite.countDocuments({ volunteerId: safeObjectId(volunteerId) });

    res.send({
      userId: volunteer.userId,
      fullName: volunteer.fullName,
      phone: volunteer.phone,
      stats: {
        totalEvents: totalEvents,
        completedEvents: completedEvents,
        pendingEvents: pendingEvents,
        favoriteEvents: favoriteEvents,
      },
    });
  } catch (err) {
    console.error('Error in GET /volunteers/:userId/profile', err.stack || err);
    next(err);
  }
});

// GET: Registrations (single route, normalized)
router.get('/volunteers/:userId/registrations', authHandler.requireAuth, async function (req, res, next) {
  try {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;

    if (!assertAccess(userId, authUser)) {
      return res.status(403).send({ message: 'You do not have access to these registrations.' });
    }

    if (!ensureModel('volunteer', res) || !ensureModel('eventRegistration', res)) return;

    var volunteer = await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean();
    if (!volunteer) return res.send([]);

    const volunteerId = volunteer._id || volunteer.id;
    if (!volunteerId) return res.send([]);

    var rows = await models.eventRegistration
      .find({ volunteerId: safeObjectId(volunteerId) })
      .sort({ registeredAt: -1 })
      .populate('eventId')
      .lean();

    rows = mongo.toPlain(rows);

    var result = (rows || [])
      .map(function (item) {
        var event = item.eventId;
        if (!event) {
          return null;
        }

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
      .filter(function (item) {
        return !!item;
      });

    res.send(result);
  } catch (err) {
    console.error('Error in GET /volunteers/:userId/registrations', err.stack || err);
    next(err);
  }
});

// DELETE: Remove a registration
router.delete('/volunteers/:userId/registrations/:registrationId', authHandler.requireAuth, async function (req, res, next) {
  try {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;
    var registrationId = toTrimmed(req.params.registrationId);

    if (!assertAccess(userId, authUser)) {
      return res.status(403).send({ message: 'You do not have access to these registrations.' });
    }

    if (!ensureModel('volunteer', res) || !ensureModel('eventRegistration', res)) return;

    var volunteer = await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean();
    if (!volunteer || !registrationId) {
      return res.status(404).send({ message: 'Registration not found.' });
    }

    const volunteerId = volunteer._id || volunteer.id;
    var registration = await models.eventRegistration.findOne({
      _id: safeObjectId(registrationId),
      volunteerId: safeObjectId(volunteerId),
    }).lean();

    if (!registration) {
      return res.status(404).send({ message: 'Registration not found.' });
    }

    await models.eventRegistration.findOneAndDelete({ _id: safeObjectId(registration._id || registration.id) });

    res.send({ message: 'Registration removed.' });
  } catch (err) {
    console.error('Error in DELETE /volunteers/:userId/registrations/:registrationId', err.stack || err);
    next(err);
  }
});

// GET: Favorites
router.get('/volunteers/:userId/favorites', authHandler.requireAuth, async function (req, res, next) {
  try {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;

    if (!assertAccess(userId, authUser)) {
      return res.status(403).send({ message: 'You do not have access to these favorites.' });
    }

    if (!ensureModel('volunteer', res) || !ensureModel('eventFavorite', res)) return;

    var volunteer = await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean();
    if (!volunteer) {
      return res.send([]);
    }

    const volunteerId = volunteer._id || volunteer.id;

    var rows = await models.eventFavorite
      .find({ volunteerId: safeObjectId(volunteerId) })
      .sort({ createdAt: -1 })
      .populate({
        path: 'eventId',
        populate: {
          path: 'categoryId',
        },
      })
      .lean();

    rows = mongo.toPlain(rows);

    var result = (rows || [])
      .map(function (item) {
        var event = item.eventId;
        if (!event) return null;
        var category = event.categoryId;
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

    res.send(result);
  } catch (err) {
    console.error('Error in GET /volunteers/:userId/favorites', err.stack || err);
    next(err);
  }
});

// DELETE: Remove favorite
router.delete('/volunteers/:userId/favorites/:eventId', authHandler.requireAuth, async function (req, res, next) {
  try {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;
    var eventId = toTrimmed(req.params.eventId);

    if (!assertAccess(userId, authUser)) {
      return res.status(403).send({ message: 'You do not have access to these favorites.' });
    }

    if (!ensureModel('volunteer', res) || !ensureModel('eventFavorite', res)) return;

    var volunteer = await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean();
    if (!volunteer || !eventId) {
      return res.status(404).send({ message: 'Favorite not found.' });
    }

    const volunteerId = volunteer._id || volunteer.id;

    var favorite = await models.eventFavorite.findOne({
      eventId: safeObjectId(eventId),
      volunteerId: safeObjectId(volunteerId),
    }).lean();

    if (!favorite) {
      return res.status(404).send({ message: 'Favorite not found.' });
    }

    await models.eventFavorite.findOneAndDelete({ _id: safeObjectId(favorite._id || favorite.id) });

    res.send({ message: 'Favorite removed.' });
  } catch (err) {
    console.error('Error in DELETE /volunteers/:userId/favorites/:eventId', err.stack || err);
    next(err);
  }
});

// GET: Dashboard
router.get('/volunteers/:userId/dashboard', authHandler.requireAuth, async function (req, res, next) {
  try {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;

    if (!assertAccess(userId, authUser)) {
      return res.status(403).send({ message: 'You do not have access to this dashboard.' });
    }

    if (!ensureModel('volunteer', res) || !ensureModel('eventRegistration', res)) return;

    var volunteer = await models.volunteer.findOne({ userId: safeObjectId(userId) }).lean();
    if (!volunteer) {
      return res.status(404).send({ message: 'Volunteer not found.' });
    }

    const volunteerId = volunteer._id || volunteer.id;

    var totalRegistrations = await models.eventRegistration.countDocuments({ volunteerId: safeObjectId(volunteerId) });
    var completedEvents = await models.eventRegistration.countDocuments({
      volunteerId: safeObjectId(volunteerId),
      status: 'Confirmed',
    });
    var pendingEvents = await models.eventRegistration.countDocuments({
      volunteerId: safeObjectId(volunteerId),
      status: 'Pending',
    });

    var upcomingRegs = await models.eventRegistration
      .find({ volunteerId: safeObjectId(volunteerId) })
      .populate('eventId')
      .sort({ registeredAt: -1 })
      .limit(3)
      .lean();

    upcomingRegs = mongo.toPlain(upcomingRegs || []);

    res.send({
      stats: {
        totalEvents: totalRegistrations,
        completedEvents: completedEvents,
        pendingEvents: pendingEvents,
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
    });
  } catch (err) {
    console.error('Error in GET /volunteers/:userId/dashboard', err.stack || err);
    next(err);
  }
});

// GET: Comments for an event
router.get('/events/:eventId/comments', async function (req, res, next) {
  try {
    var eventId = toTrimmed(req.params.eventId);

    if (!eventId) {
      return res.status(400).send({ message: 'eventId is required.' });
    }

    if (!ensureModel('eventComment', res) || !ensureModel('appUser', res)) return;

    var comments = await models.eventComment
      .find({ eventId: safeObjectId(eventId), isHidden: false })
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    comments = mongo.toPlain(comments || []);

    res.send((comments || []).map(c => ({
      id: c._id || c.id,
      userId: c.userId ? (c.userId._id || c.userId.id) : null,
      userName: c.userId ? c.userId.fullName : 'Anonymous',
      content: c.content,
      createdAt: c.createdAt,
    })));
  } catch (err) {
    console.error('Error in GET /events/:eventId/comments', err.stack || err);
    next(err);
  }
});

// POST: Create a comment
router.post('/events/:eventId/comments', authHandler.requireAuth, async function (req, res, next) {
  try {
    var eventId = toTrimmed(req.params.eventId);
    var authUser = req.authUser;
    var content = toTrimmed(req.body.content || '');

    if (!eventId) {
      return res.status(400).send({ message: 'eventId is required.' });
    }

    if (!content) {
      return res.status(400).send({ message: 'Comment content is required.' });
    }

    if (!ensureModel('eventComment', res) || !ensureModel('event', res)) return;

    var ev = await models.event.findOne({ _id: safeObjectId(eventId) }).lean();
    if (!ev) {
      return res.status(404).send({ message: 'Event not found.' });
    }

    var comment = await models.eventComment.create({
      eventId: safeObjectId(eventId),
      userId: safeObjectId(authUser.userId),
      content: content,
      isHidden: false,
    });

    res.status(201).send({
      id: comment._id || comment.id,
      userId: authUser.userId,
      userName: authUser.fullName,
      content: content,
      createdAt: comment.createdAt,
    });
  } catch (err) {
    console.error('Error in POST /events/:eventId/comments', err.stack || err);
    next(err);
  }
});

// GET: Ratings for an event
router.get('/events/:eventId/ratings', async function (req, res, next) {
  try {
    var eventId = toTrimmed(req.params.eventId);

    if (!eventId) {
      return res.status(400).send({ message: 'eventId is required.' });
    }

    if (!ensureModel('eventRating', res) || !ensureModel('appUser', res)) return;

    var ratings = await models.eventRating
      .find({ eventId: safeObjectId(eventId), isHidden: false })
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    ratings = mongo.toPlain(ratings || []);

    var averageRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

    res.send({
      averageRating: parseFloat(averageRating),
      totalRatings: ratings.length,
      ratings: (ratings || []).map(r => ({
        id: r._id || r.id,
        userId: r.userId ? (r.userId._id || r.userId.id) : null,
        userName: r.userId ? r.userId.fullName : 'Anonymous',
        rating: r.rating,
        review: r.review,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error in GET /events/:eventId/ratings', err.stack || err);
    next(err);
  }
});

// POST: Create or update a rating
router.post('/events/:eventId/ratings', authHandler.requireAuth, async function (req, res, next) {
  try {
    var eventId = toTrimmed(req.params.eventId);
    var authUser = req.authUser;
    var rating = parseInt(req.body.rating || 0);
    var review = toTrimmed(req.body.review || '');

    if (!eventId) {
      return res.status(400).send({ message: 'eventId is required.' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).send({ message: 'Rating must be between 1 and 5.' });
    }

    if (!ensureModel('eventRating', res) || !ensureModel('event', res)) return;

    var ev = await models.event.findOne({ _id: safeObjectId(eventId) }).lean();
    if (!ev) {
      return res.status(404).send({ message: 'Event not found.' });
    }

    // Check if user already rated this event
    var existingRating = await models.eventRating.findOne({
      eventId: safeObjectId(eventId),
      userId: safeObjectId(authUser.userId),
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review || null;
      await existingRating.save();

      res.send({
        id: existingRating._id || existingRating.id,
        userId: authUser.userId,
        userName: authUser.fullName,
        rating: rating,
        review: review,
        createdAt: existingRating.createdAt,
        updatedAt: existingRating.updatedAt,
      });
    } else {
      // Create new rating
      var newRating = await models.eventRating.create({
        eventId: safeObjectId(eventId),
        userId: safeObjectId(authUser.userId),
        rating: rating,
        review: review || null,
        isHidden: false,
      });

      res.status(201).send({
        id: newRating._id || newRating.id,
        userId: authUser.userId,
        userName: authUser.fullName,
        rating: rating,
        review: review,
        createdAt: newRating.createdAt,
      });
    }
  } catch (err) {
    console.error('Error in POST /events/:eventId/ratings', err.stack || err);
    next(err);
  }
});

// PUT: Update volunteer profile
router.put('/volunteers/:userId/profile', authHandler.requireAuth, async function (req, res, next) {
  try {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;
    var { fullName, phone } = req.body;

    if (!assertAccess(userId, authUser)) {
      return res.status(403).send({ message: 'You do not have access to this profile.' });
    }

    if (!userId) {
      return res.status(400).send({ message: 'userId is required.' });
    }

    var errors = {};
    if (!fullName || !toTrimmed(fullName)) {
      errors.fullName = 'Vui lòng nhập họ và tên.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).send({ message: 'Validation failed.', errors: errors });
    }

    if (!ensureModel('appUser', res) || !ensureModel('volunteer', res)) return;

    // Update appUser
    await models.appUser.findOneAndUpdate(
      { _id: safeObjectId(userId) },
      {
        $set: {
          fullName: toTrimmed(fullName),
          phone: phone ? toTrimmed(phone) : null,
        },
      },
      { new: true }
    );

    // Update volunteer
    var volunteer = await models.volunteer.findOneAndUpdate(
      { userId: safeObjectId(userId) },
      {
        $set: {
          fullName: toTrimmed(fullName),
          phone: phone ? toTrimmed(phone) : null,
        },
      },
      { new: true }
    ).lean();

    if (!volunteer) {
      return res.status(404).send({ message: 'Volunteer profile not found.' });
    }

    volunteer = mongo.toPlain(volunteer);

    res.send({
      userId: volunteer.userId,
      fullName: volunteer.fullName,
      phone: volunteer.phone,
      message: 'Profile updated successfully.',
    });
  } catch (err) {
    console.error('Error in PUT /volunteers/:userId/profile', err.stack || err);
    next(err);
  }
});

// POST: Upload avatar
router.post('/volunteers/:userId/avatar', authHandler.requireAuth, async function (req, res, next) {
  try {
    var userId = toTrimmed(req.params.userId);
    var authUser = req.authUser;
    var { avatarData } = req.body; // base64 data URL

    if (!assertAccess(userId, authUser)) {
      return res.status(403).send({ message: 'You do not have access to upload avatar.' });
    }

    if (!userId || !avatarData) {
      return res.status(400).send({ message: 'userId and avatarData are required.' });
    }

    // Validate base64 format
    if (!avatarData.startsWith('data:image/')) {
      return res.status(400).send({ message: 'Invalid image data format.' });
    }

    if (!ensureModel('volunteer', res)) return;

    // Update volunteer with avatar base64 data (will be stored as-is)
    var volunteer = await models.volunteer.findOneAndUpdate(
      { userId: safeObjectId(userId) },
      { $set: { avatar: avatarData } },
      { new: true }
    ).lean();

    if (!volunteer) {
      return res.status(404).send({ message: 'Volunteer profile not found.' });
    }

    volunteer = mongo.toPlain(volunteer);

    res.send({
      avatar: volunteer.avatar,
      message: 'Avatar uploaded successfully.',
    });
  } catch (err) {
    console.error('Error in POST /volunteers/:userId/avatar', err.stack || err);
    next(err);
  }
});

module.exports = router;
