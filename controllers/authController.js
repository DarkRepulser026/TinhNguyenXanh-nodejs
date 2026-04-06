// controllers/authController.js
const bcrypt = require('bcrypt');
const authHandler = require('../utils/authHandler');
const models = require('../utils/models');
const mongo = require('../utils/mongo');

const BCRYPT_ROUNDS = Math.min(15, Math.max(8, Number(process.env.BCRYPT_ROUNDS || 10)));

function isBcryptHash(value) {
  return typeof value === 'string' && value.startsWith('$2');
}

function toRole(value) {
  if (value === 'Admin' || value === 'Organizer' || value === 'Volunteer') {
    return value;
  }
  return 'Volunteer';
}

module.exports = {
  Register: async function (email, fullName, phone, password, role) {
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

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await models.appUser.create({
      email,
      fullName,
      phone,
      role,
      passwordHash,
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

  Login: async function (email, password) {
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    password = typeof password === 'string' ? password : '';

    if (!email || !password) {
      throw { status: 400, message: 'email and password are required.' };
    }

    let user = await models.appUser.findOne({ email }).lean();
    user = mongo.toPlain(user);

    if (!user || !user.isActive) {
      throw { status: 401, message: 'Invalid credentials.' };
    }

    let isValidPassword = false;

    if (isBcryptHash(user.passwordHash)) {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Backward compatibility for legacy plain-text data; successful login upgrades hash.
      isValidPassword = user.passwordHash === password;

      if (isValidPassword) {
        const nextHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await models.appUser.findOneAndUpdate(
          { _id: mongo.toObjectId(user.id) },
          { $set: { passwordHash: nextHash } }
        );
      }
    }

    if (!isValidPassword) {
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

  GetProfile: async function (userId) {
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

  UpdateProfile: async function (userId, fullName, phone) {
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
