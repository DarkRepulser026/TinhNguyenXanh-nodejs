const mongoose = require('mongoose');

function isObjectIdString(value) {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
}

function toObjectId(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  if (isObjectIdString(value)) {
    return new mongoose.Types.ObjectId(value);
  }

  return value;
}

function toPlain(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof mongoose.Types.Decimal128) {
    return Number(value.toString());
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toPlain(item));
  }

  if (typeof value === 'object') {
    const output = {};

    for (const key of Object.keys(value)) {
      if (key === '__v') {
        continue;
      }

      if (key === '_id') {
        output.id = toPlain(value[key]);
      } else {
        output[key] = toPlain(value[key]);
      }
    }

    return output;
  }

  return value;
}

module.exports = {
  toObjectId,
  toPlain,
};
