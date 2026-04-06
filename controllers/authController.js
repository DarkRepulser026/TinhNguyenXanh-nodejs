// controllers/authController.js
const authHandler = require('../utils/authHandler');
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toRole(value) {
  if (value === 'Admin' || value === 'Organizer' || value === 'Volunteer') {
    return value;
  }
  return 'Volunteer';
}

module.exports = {
  async Register(email, fullName, phone, password, role) {
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    fullName = typeof fullName === 'string' ? fullName.trim() : '';
    phone = typeof phone === 'string' ? phone.trim() : null;
    password = typeof password === 'string' ? password : '';
    role = toRole(role);

    if (!email || !fullName || !password) {
      throw { status: 400, message: 'email, fullName, and password are required.' };
    }

    if (password.length < 8) {
      throw { status: 400, message: 'Password must be at least 8 characters.' };
    }

    const existing = await models.appUser.findOne({ email }).lean();
    if (existing) {
      throw { status: 409, message: 'Email is already registered.' };
    }

    const user = await models.appUser.create({
      email,
      fullName,
      phone,
      role,
      passwordHash: password,
      isActive: true,
    });

    const plainUser = mongo.toPlain(user.toObject());

    if (role === 'Volunteer') {
      let volunteer = await models.volunteer.findOneAndUpdate(
        { userId: mongo.toObjectId(plainUser.id) },
        { $set: { fullName, phone } },
        { new: true }
      ).lean();

      if (!volunteer) {
        volunteer = await models.volunteer.create({
          userId: mongo.toObjectId(plainUser.id),
          fullName,
          phone,
        });
      }
    }

    const token = authHandler.createAuthToken({
      userId: plainUser.id,
      email: plainUser.email,
      role: plainUser.role,
    });

    return {
      token,
      user: {
        id: plainUser.id,
        email: plainUser.email,
        fullName: plainUser.fullName,
        phone: plainUser.phone,
        role: plainUser.role,
      },
    };
  },

  async Login(email, password) {
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    password = typeof password === 'string' ? password : '';

    if (!email || !password) {
      throw { status: 400, message: 'email and password are required.' };
    }

    let user = await models.appUser.findOne({ email }).lean();
    user = mongo.toPlain(user);

    if (!user || !user.isActive || user.passwordHash !== password) {
      throw { status: 401, message: 'Invalid credentials.' };
    }

    const token = authHandler.createAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    };
  },

  async GetProfile(userId) {
    let user = await models.appUser.findOne({ _id: mongo.toObjectId(userId) }).lean();
    const plainUser = mongo.toPlain(user);

    if (!plainUser || !plainUser.isActive) {
      throw { status: 401, message: 'Session is no longer valid.' };
    }

    return {
      id: plainUser.id,
      email: plainUser.email,
      fullName: plainUser.fullName,
      phone: plainUser.phone,
      role: plainUser.role,
    };
  },

  async UpdateProfile(userId, fullName, phone) {
    fullName = typeof fullName === 'string' ? fullName.trim() : '';
    phone = typeof phone === 'string' && phone.trim() !== '' ? phone.trim() : null;

    if (!fullName) {
      throw { status: 400, message: 'fullName is required.' };
    }

    let user = await models.appUser.findOne({ _id: mongo.toObjectId(userId) }).lean();
    user = mongo.toPlain(user);

    if (!user || !user.isActive) {
      throw { status: 404, message: 'User not found.' };
    }

    user = await models.appUser.findOneAndUpdate(
      { _id: mongo.toObjectId(user.id) },
      {
        $set: {
          fullName,
          phone,
        },
      },
      { new: true }
    ).lean();
    user = mongo.toPlain(user);

    await models.volunteer.updateMany(
      { userId: mongo.toObjectId(user.id) },
      { $set: { fullName, phone } }
    );

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
    };
  },
};
