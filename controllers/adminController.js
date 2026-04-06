// controllers/adminController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toPageParams(query, defaultPageSize) {
  const page = Math.max(1, Number(query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || defaultPageSize || 10)));
  return { page, pageSize };
}

module.exports = {
  async getDashboard() {
    const totalUsers = await models.appUser.countDocuments({});
    const activeUsers = await models.appUser.countDocuments({ isActive: true });
    const totalEvents = await models.event.countDocuments({});
    const pendingApprovals = await models.event.countDocuments({ status: { $in: ['draft', 'pending'] } });
    const totalOrganizations = await models.organization.countDocuments({});
    const totalCategories = await models.eventCategory.countDocuments({});
    const totalVolunteers = await models.volunteer.countDocuments({});
    const pendingRegistrations = await models.eventRegistration.countDocuments({ status: 'Pending' });

    return { totalUsers, activeUsers, totalEvents, pendingApprovals, totalOrganizations, totalCategories, totalVolunteers, pendingRegistrations };
  },

  async getEventApprovals(search, page, pageSize) {
    search = typeof search === 'string' ? search.trim().toLowerCase() : '';
    const paging = { page: Math.max(1, Number(page || 1)), pageSize: Math.min(100, Math.max(1, Number(pageSize || 10))) };

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

    return { items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) };
  },

  async updateEventStatus(id, action) {
    id = typeof id === 'string' ? id.trim() : '';
    action = typeof action === 'string' ? action : '';

    if (!id) {
      throw { status: 400, message: 'Invalid event id.' };
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
      throw { status: 400, message: "action must be 'approve' or 'reject'." };
    }

    event = mongo.toPlain(event);
    return { id: event.id, status: event.status };
  },

  async getUsers(search, page, pageSize) {
    search = typeof search === 'string' ? search.trim().toLowerCase() : '';
    const paging = { page: Math.max(1, Number(page || 1)), pageSize: Math.min(100, Math.max(1, Number(pageSize || 10))) };

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

    return { items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) };
  },

  async updateUserStatus(id, isActive, authUser) {
    id = typeof id === 'string' ? id.trim() : '';
    isActive = Boolean(isActive);

    if (!id) {
      throw { status: 400, message: 'Invalid user id.' };
    }
    if (authUser.userId === id && !isActive) {
      throw { status: 400, message: 'Admin cannot disable own account.' };
    }

    let user = await models.appUser.findOne({ _id: mongo.toObjectId(id) }).lean();
    user = mongo.toPlain(user);
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    user = await models.appUser.findOneAndUpdate({ _id: mongo.toObjectId(user.id) }, { $set: { isActive } }, { new: true }).lean();
    user = mongo.toPlain(user);
    return { id: user.id, isActive: user.isActive };
  },

  async updateUserRole(id, role) {
    id = typeof id === 'string' ? id.trim() : '';
    role = typeof role === 'string' ? role : '';

    if (!(role === 'Admin' || role === 'Organizer' || role === 'Volunteer')) {
      throw { status: 400, message: 'Invalid role.' };
    }

    let user = await models.appUser.findOne({ _id: mongo.toObjectId(id) }).lean();
    user = mongo.toPlain(user);
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    user = await models.appUser.findOneAndUpdate({ _id: mongo.toObjectId(user.id) }, { $set: { role } }, { new: true }).lean();
    user = mongo.toPlain(user);
    return { id: user.id, role: user.role };
  },

  async getCategories(search, page, pageSize) {
    search = typeof search === 'string' ? search.trim().toLowerCase() : '';
    const paging = { page: Math.max(1, Number(page || 1)), pageSize: Math.min(100, Math.max(1, Number(pageSize || 10))) };

    let rows = await models.eventCategory.find({}).lean();
    rows = mongo.toPlain(rows);
    rows = rows.filter((item) => !search || (item.name || '').toLowerCase().includes(search));

    const totalCount = rows.length;
    const items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize);

    return { items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) };
  },

  async createCategory(name) {
    name = typeof name === 'string' ? name.trim() : '';
    if (!name) {
      throw { status: 400, message: 'Category name is required.' };
    }

    const item = await models.eventCategory.create({ name });
    return mongo.toPlain(item.toObject());
  },

  async updateCategory(id, name) {
    id = typeof id === 'string' ? id.trim() : '';
    name = typeof name === 'string' ? name.trim() : '';

    if (!id) {
      throw { status: 400, message: 'Invalid category id.' };
    }
    if (!name) {
      throw { status: 400, message: 'Category name is required.' };
    }

    let item = await models.eventCategory.findOne({ _id: mongo.toObjectId(id) }).lean();
    item = mongo.toPlain(item);
    if (!item) {
      return res.status(404).send({ message: 'Category not found.' });
    }

    item = await models.eventCategory.findOneAndUpdate({ _id: mongo.toObjectId(item.id) }, { $set: { name } }, { new: true }).lean();
    item = mongo.toPlain(item);
    return item;
  },

  async deleteCategory(id) {
    id = typeof id === 'string' ? id.trim() : '';
    if (!id) {
      throw { status: 400, message: 'Invalid category id.' };
    }

    let item = await models.eventCategory.findOne({ _id: mongo.toObjectId(id) }).lean();
    item = mongo.toPlain(item);
    if (!item) {
      throw { status: 404, message: 'Category not found.' };
    }

    await models.eventCategory.findOneAndDelete({ _id: mongo.toObjectId(item.id) });
    return { message: 'Category deleted.' };
  },

  async getModerationSummary() {
    const queue = await models.eventReport.find({}).sort({ createdAt: -1 }).limit(100).lean();
    const rejectedEvents = await models.event.countDocuments({ status: 'rejected' });
    const hiddenEvents = await models.event.countDocuments({ isHidden: true });
    const inactiveUsers = await models.appUser.countDocuments({ isActive: false });

    return { queue: mongo.toPlain(queue), summary: { rejectedEvents, hiddenEvents, inactiveUsers }, message: 'Moderation queue loaded.' };
  }
};
