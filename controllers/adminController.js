// controllers/adminController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

function toPageParams(query, defaultPageSize) {
  const page = Math.max(1, Number(query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || defaultPageSize || 10)));
  return { page, pageSize };
}

module.exports = {
  getDashboard: async function () {
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

  getEventApprovals: async function (query) {
    const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';
    const paging = toPageParams(query, 10);
    let rows = mongo.toPlain(await models.event.find({ status: { $in: ['draft', 'pending'] } }).populate('organizationId').populate('categoryId').lean());
    rows = rows.filter((event) => {
      if (!search) return true;
      return (event.title || '').toLowerCase().includes(search)
        || (event.description || '').toLowerCase().includes(search)
        || (event.organizationId && (event.organizationId.name || '').toLowerCase().includes(search));
    });
    const totalCount = rows.length;
    const items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map((event) => ({
      id: event.id, title: event.title, description: event.description, status: event.status,
      startTime: event.startTime, endTime: event.endTime, location: event.location,
      organizationId: event.organizationId && event.organizationId.id ? event.organizationId.id : event.organizationId,
      organizationName: event.organizationId && event.organizationId.name ? event.organizationId.name : null,
      categoryId: event.categoryId && event.categoryId.id ? event.categoryId.id : event.categoryId,
      categoryName: event.categoryId && event.categoryId.name ? event.categoryId.name : null,
    }));
    return { items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) };
  },

  updateEventStatus: async function (id, action) {
    id = typeof id === 'string' ? id.trim() : '';
    if (!id) throw { status: 400, message: 'Invalid event id.' };
    let event = mongo.toPlain(await models.event.findOne({ _id: mongo.toObjectId(id) }).lean());
    if (!event) throw { status: 404, message: 'Event not found.' };
    if (action === 'approve') {
      event = mongo.toPlain(await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: { status: 'approved' } }, { new: true }).lean());
    } else if (action === 'reject') {
      event = mongo.toPlain(await models.event.findOneAndUpdate({ _id: mongo.toObjectId(event.id) }, { $set: { status: 'rejected' } }, { new: true }).lean());
    } else {
      throw { status: 400, message: "action must be 'approve' or 'reject'." };
    }
    return { id: event.id, status: event.status };
  },

  getUsers: async function (query) {
    const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';
    const paging = toPageParams(query, 10);
    let rows = mongo.toPlain(await models.appUser.find({}).lean());
    rows = rows.filter((item) => {
      if (!search) return true;
      return (item.email || '').toLowerCase().includes(search)
        || (item.fullName || '').toLowerCase().includes(search)
        || (item.phone || '').toLowerCase().includes(search);
    });
    const totalCount = rows.length;
    const items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize).map((item) => ({
      id: item.id, email: item.email, fullName: item.fullName, phone: item.phone,
      role: item.role, isActive: item.isActive, createdAt: item.createdAt,
    }));
    return { items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) };
  },

  updateUserStatus: async function (authUserId, id, isActive) {
    id = typeof id === 'string' ? id.trim() : '';
    if (!id) throw { status: 400, message: 'Invalid user id.' };
    if (authUserId === id && !isActive) throw { status: 400, message: 'Admin cannot disable own account.' };
    let user = mongo.toPlain(await models.appUser.findOne({ _id: mongo.toObjectId(id) }).lean());
    if (!user) throw { status: 404, message: 'User not found.' };
    user = mongo.toPlain(await models.appUser.findOneAndUpdate({ _id: mongo.toObjectId(user.id) }, { $set: { isActive } }, { new: true }).lean());
    return { id: user.id, isActive: user.isActive };
  },

  updateUserRole: async function (id, role) {
    id = typeof id === 'string' ? id.trim() : '';
    if (!(role === 'Admin' || role === 'Organizer' || role === 'Volunteer')) throw { status: 400, message: 'Invalid role.' };
    let user = mongo.toPlain(await models.appUser.findOne({ _id: mongo.toObjectId(id) }).lean());
    if (!user) throw { status: 404, message: 'User not found.' };
    user = mongo.toPlain(await models.appUser.findOneAndUpdate({ _id: mongo.toObjectId(user.id) }, { $set: { role } }, { new: true }).lean());
    return { id: user.id, role: user.role };
  },

  getCategories: async function (query) {
    const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';
    const paging = toPageParams(query, 10);
    let rows = mongo.toPlain(await models.eventCategory.find({}).lean());
    rows = rows.filter((item) => !search || (item.name || '').toLowerCase().includes(search));
    const totalCount = rows.length;
    const items = rows.slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize);
    return { items, totalCount, page: paging.page, pageSize: paging.pageSize, totalPages: Math.ceil(totalCount / paging.pageSize) };
  },

  createCategory: async function (name) {
    name = typeof name === 'string' ? name.trim() : '';
    if (!name) throw { status: 400, message: 'Category name is required.' };
    const item = await models.eventCategory.create({ name });
    return mongo.toPlain(item.toObject());
  },

  updateCategory: async function (id, name) {
    id = typeof id === 'string' ? id.trim() : '';
    name = typeof name === 'string' ? name.trim() : '';
    if (!id) throw { status: 400, message: 'Invalid category id.' };
    if (!name) throw { status: 400, message: 'Category name is required.' };
    let item = mongo.toPlain(await models.eventCategory.findOne({ _id: mongo.toObjectId(id) }).lean());
    if (!item) throw { status: 404, message: 'Category not found.' };
    item = mongo.toPlain(await models.eventCategory.findOneAndUpdate({ _id: mongo.toObjectId(item.id) }, { $set: { name } }, { new: true }).lean());
    return item;
  },

  deleteCategory: async function (id) {
    id = typeof id === 'string' ? id.trim() : '';
    if (!id) throw { status: 400, message: 'Invalid category id.' };
    let item = mongo.toPlain(await models.eventCategory.findOne({ _id: mongo.toObjectId(id) }).lean());
    if (!item) throw { status: 404, message: 'Category not found.' };
    await models.eventCategory.findOneAndDelete({ _id: mongo.toObjectId(item.id) });
    return { message: 'Category deleted.' };
  },

  getModerationSummary: async function () {
    const queue = await models.eventReport.find({}).sort({ createdAt: -1 }).limit(100).lean();
    const rejectedEvents = await models.event.countDocuments({ status: 'rejected' });
    const hiddenEvents = await models.event.countDocuments({ isHidden: true });
    const inactiveUsers = await models.appUser.countDocuments({ isActive: false });
    const pendingReports = await models.eventReport.countDocuments({ status: 'Pending' });
    const approvedReports = await models.eventReport.countDocuments({ status: 'Approved' });
    const rejectedReports = await models.eventReport.countDocuments({ status: 'Rejected' });
    const totalReports = pendingReports + approvedReports + rejectedReports;

    return {
      queue: mongo.toPlain(queue),
      summary: {
        rejectedEvents,
        hiddenEvents,
        inactiveUsers,
        pendingReports,
        approvedReports,
        rejectedReports,
        totalReports,
      },
      message: 'Moderation queue loaded.',
    };
  },
  
  getEventReports: async function () {
    const reports = await models.eventReport
      .find({})
      .populate("eventId")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return {
      items: mongo.toPlain(reports).map((r) => ({
        id: r.id,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,

        eventId: r.eventId?.id || null,
        eventTitle: r.eventId?.title || null,
        isHidden: r.eventId?.isHidden || false,
      })),
      message: "Event reports loaded.",
    };
  },

  approveReport: async function (id) {
    id = typeof id === "string" ? id.trim() : "";
    if (!id) throw { status: 400, message: "Invalid report id." };

    const report = await models.eventReport
      .findOne({ _id: mongo.toObjectId(id) })
      .populate("eventId");

    if (!report) throw { status: 404, message: "Report not found." };

    // update report
    report.status = "Approved";
    await report.save();

    // update event
    if (report.eventId) {
      await models.event.findOneAndUpdate(
        { _id: report.eventId._id },
        { $set: { isHidden: true } }
      );
    }

    return { message: "Approved & event hidden." };
  },

  rejectReport: async function (id) {
    id = typeof id === "string" ? id.trim() : "";
    if (!id) throw { status: 400, message: "Invalid report id." };

    const report = await models.eventReport.findOne({
      _id: mongo.toObjectId(id),
    });

    if (!report) throw { status: 404, message: "Report not found." };

    report.status = "Rejected";
    await report.save();

    return { message: "Report rejected." };
  },
};
