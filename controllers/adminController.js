// controllers/adminController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toPageParams(query, defaultPageSize) {
  const page = Math.max(1, Number(query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || defaultPageSize || 10)));
  return { page, pageSize };
}

exports.getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await models.appUser.countDocuments({});
    const activeUsers = await models.appUser.countDocuments({ isActive: true });
    const totalEvents = await models.event.countDocuments({});
    const pendingApprovals = await models.event.countDocuments({ status: { $in: ['draft', 'pending'] } });
    const totalOrganizations = await models.organization.countDocuments({});
    const totalCategories = await models.eventCategory.countDocuments({});
    const totalVolunteers = await models.volunteer.countDocuments({});
    const pendingRegistrations = await models.eventRegistration.countDocuments({ status: 'Pending' });

    res.send({ totalUsers, activeUsers, totalEvents, pendingApprovals, totalOrganizations, totalCategories, totalVolunteers, pendingRegistrations });
  } catch (error) {
    next(error);
  }
};

exports.getEventApprovals = async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const paging = toPageParams(req.query, 10);

    let rows = await models.event.find({ status: { $in: ['draft', 'pending'] } }).populate('organizationId').populate('categoryId').lean();
    rows = mongo.toPlain(rows);

    rows = rows.filter((event) => {
      if (!search) return true;
      return (event.title || '').toLowerCase().includes(search)
        || (event.description || '').toLowerCase().includes(search)
        || (event.organizationId && (event.organizationId.name || '').toLowerCase().includes(search));
    });

    const totalCount = rows.length;
    const items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      status: event.status,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      organizationId: event.organizationId && event.organizationId.id ? event.organizationId.id : event.organizationId,
      organizationName: event.organizationId && event.organizationId.name ? event.organizationId.name : null,
      categoryId: event.categoryId && event.categoryId.id ? event.categoryId.id : event.categoryId,
      categoryName: event.categoryId && event.categoryId.name ? event.categoryId.name : null,
    }));

    res.send({ items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) });
  } catch (error) {
    next(error);
  }
};

exports.updateEventStatus = async (req, res, next) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    const action = typeof req.body.action === 'string' ? req.body.action : '';

    if (!id) {
      return res.status(400).send({ message: 'Invalid event id.' });
    }

    let event = await models.event.findOne({ _id: mongo.toObjectId(id) }).lean();
    event = mongo.toPlain(event);
    if (!event) {
      return res.status(404).send({ message: 'Event not found.' });
    }

    if (action === 'approve') {
      event = await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: { status: 'approved' } }, { new: true }).lean();
    } else if (action === 'reject') {
      event = await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: { status: 'rejected' } }, { new: true }).lean();
    } else {
      return res.status(400).send({ message: "action must be 'approve' or 'reject'." });
    }

    event = mongo.toPlain(event);
    res.send({ id: event.id, status: event.status });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const paging = toPageParams(req.query, 10);

    let rows = await models.appUser.find({}).lean();
    rows = mongo.toPlain(rows);

    rows = rows.filter((item) => {
      if (!search) return true;
      return (item.email || '').toLowerCase().includes(search)
        || (item.fullName || '').toLowerCase().includes(search)
        || (item.phone || '').toLowerCase().includes(search);
    });

    const totalCount = rows.length;
    const items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map((item) => ({
      id: item.id,
      email: item.email,
      fullName: item.fullName,
      phone: item.phone,
      role: item.role,
      isActive: item.isActive,
      createdAt: item.createdAt,
    }));

    res.send({ items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const authUser = req.authUser;
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    const isActive = Boolean(req.body.isActive);

    if (!id) {
      return res.status(400).send({ message: 'Invalid user id.' });
    }
    if (authUser.userId === id && !isActive) {
      return res.status(400).send({ message: 'Admin cannot disable own account.' });
    }

    let user = await models.appUser.findOne({ _id: mongo.toObjectId(id) }).lean();
    user = mongo.toPlain(user);
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    user = await models.appUser.findOneAndUpdate({ _id: mongo.toObjectId(user.id) }, { $set: { isActive } }, { new: true }).lean();
    user = mongo.toPlain(user);
    res.send({ id: user.id, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    const role = typeof req.body.role === 'string' ? req.body.role : '';

    if (!(role === 'Admin' || role === 'Organizer' || role === 'Volunteer')) {
      return res.status(400).send({ message: 'Invalid role.' });
    }

    let user = await models.appUser.findOne({ _id: mongo.toObjectId(id) }).lean();
    user = mongo.toPlain(user);
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    user = await models.appUser.findOneAndUpdate({ _id: mongo.toObjectId(user.id) }, { $set: { role } }, { new: true }).lean();
    user = mongo.toPlain(user);
    res.send({ id: user.id, role: user.role });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const paging = toPageParams(req.query, 10);

    let rows = await models.eventCategory.find({}).lean();
    rows = mongo.toPlain(rows);
    rows = rows.filter((item) => !search || (item.name || '').toLowerCase().includes(search));

    const totalCount = rows.length;
    const items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize);

    res.send({ items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (!name) {
      return res.status(400).send({ message: 'Category name is required.' });
    }

    const item = await models.eventCategory.create({ name });
    res.status(201).send(mongo.toPlain(item.toObject()));
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!id) {
      return res.status(400).send({ message: 'Invalid category id.' });
    }
    if (!name) {
      return res.status(400).send({ message: 'Category name is required.' });
    }

    let item = await models.eventCategory.findOne({ _id: mongo.toObjectId(id) }).lean();
    item = mongo.toPlain(item);
    if (!item) {
      return res.status(404).send({ message: 'Category not found.' });
    }

    item = await models.eventCategory.findOneAndUpdate({ _id: mongo.toObjectId(item.id) }, { $set: { name } }, { new: true }).lean();
    item = mongo.toPlain(item);
    res.send(item);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
      return res.status(400).send({ message: 'Invalid category id.' });
    }

    let item = await models.eventCategory.findOne({ _id: mongo.toObjectId(id) }).lean();
    item = mongo.toPlain(item);
    if (!item) {
      return res.status(404).send({ message: 'Category not found.' });
    }

    await models.eventCategory.findOneAndDelete({ _id: mongo.toObjectId(item.id) });
    res.send({ message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getModerationSummary = async (req, res, next) => {
  try {
    const queue = await models.eventReport.find({}).sort({ createdAt: -1 }).limit(100).lean();
    const rejectedEvents = await models.event.countDocuments({ status: 'rejected' });
    const hiddenEvents = await models.event.countDocuments({ isHidden: true });
    const inactiveUsers = await models.appUser.countDocuments({ isActive: false });

    res.send({ queue: mongo.toPlain(queue), summary: { rejectedEvents, hiddenEvents, inactiveUsers }, message: 'Moderation queue loaded.' });
  } catch (error) {
    next(error);
  }
};
