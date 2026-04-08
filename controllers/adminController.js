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
    const pendingOrganizationApprovals = await models.organization.countDocuments({
      $or: [
        { approvalStatus: 'pending' },
        { approvalStatus: { $exists: false }, verified: false },
      ],
    });
    const totalCategories = await models.eventCategory.countDocuments({});
    const totalVolunteers = await models.volunteer.countDocuments({});
    const pendingRegistrations = await models.eventRegistration.countDocuments({ status: 'Pending' });
    return {
      totalUsers,
      activeUsers,
      totalEvents,
      pendingApprovals,
      totalOrganizations,
      pendingOrganizationApprovals,
      totalCategories,
      totalVolunteers,
      pendingRegistrations,
    };
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

  getOrganizationApprovals: async function (query) {
    const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';
    const paging = toPageParams(query, 10);
    let rows = mongo.toPlain(
      await models.organization
        .find({
          $or: [
            { approvalStatus: 'pending' },
            { approvalStatus: { $exists: false }, verified: false },
          ],
        })
        .populate('ownerUserId', 'fullName email')
        .sort({ createdAt: -1 })
        .lean()
    );

    rows = rows.filter((item) => {
      if (!search) return true;
      return (item.name || '').toLowerCase().includes(search)
        || (item.description || '').toLowerCase().includes(search)
        || (item.contactEmail || '').toLowerCase().includes(search)
        || (item.city || '').toLowerCase().includes(search)
        || (item.ownerUserId && (item.ownerUserId.fullName || '').toLowerCase().includes(search));
    });

    const totalCount = rows.length;
    const items = rows
      .slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        organizationType: item.organizationType,
        city: item.city,
        district: item.district,
        address: item.address,
        contactEmail: item.contactEmail,
        phoneNumber: item.phoneNumber,
        verified: Boolean(item.verified),
        approvalStatus: item.approvalStatus || 'pending',
        createdAt: item.createdAt,
        ownerUserId: item.ownerUserId && item.ownerUserId.id ? item.ownerUserId.id : item.ownerUserId,
        ownerName: item.ownerUserId && item.ownerUserId.fullName ? item.ownerUserId.fullName : null,
        ownerEmail: item.ownerUserId && item.ownerUserId.email ? item.ownerUserId.email : null,
      }));

    return {
      items,
      totalCount,
      page: paging.page,
      pageSize: paging.pageSize,
      totalPages: Math.ceil(totalCount / paging.pageSize),
    };
  },

  updateOrganizationApprovalStatus: async function (id, action) {
    id = typeof id === 'string' ? id.trim() : '';
    if (!id) throw { status: 400, message: 'Invalid organization id.' };

    let organization = mongo.toPlain(await models.organization.findOne({ _id: mongo.toObjectId(id) }).lean());
    if (!organization) throw { status: 404, message: 'Organization not found.' };

    if (action === 'approve') {
      organization = mongo.toPlain(
        await models.organization
          .findOneAndUpdate(
            { _id: mongo.toObjectId(organization.id) },
            { $set: { approvalStatus: 'approved', verified: true } },
            { new: true },
          )
          .lean()
      );
    } else if (action === 'reject') {
      organization = mongo.toPlain(
        await models.organization
          .findOneAndUpdate(
            { _id: mongo.toObjectId(organization.id) },
            { $set: { approvalStatus: 'rejected', verified: false } },
            { new: true },
          )
          .lean()
      );
    } else {
      throw { status: 400, message: "action must be 'approve' or 'reject'." };
    }

    return {
      id: organization.id,
      approvalStatus: organization.approvalStatus || 'pending',
      verified: Boolean(organization.verified),
    };
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

  getDonations: async function (query) {
    const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';
    const status = typeof query.status === 'string' ? query.status.trim() : '';
    const method = typeof query.method === 'string' ? query.method.trim() : '';
    const paging = toPageParams(query, 20);

    let rows = mongo.toPlain(await models.donation.find({}).sort({ createdAt: -1 }).lean());
    rows = rows.filter((item) => {
      const searchOk = !search
        || String(item.transactionCode || '').toLowerCase().includes(search)
        || String(item.donorName || '').toLowerCase().includes(search)
        || String(item.phoneNumber || '').toLowerCase().includes(search)
        || String(item.providerRef || '').toLowerCase().includes(search);
      const statusOk = !status || item.status === status;
      const methodOk = !method || item.paymentMethod === method;
      return searchOk && statusOk && methodOk;
    });

    const toAmount = (value) => {
      const normalized = Number(String(value == null ? 0 : value));
      return Number.isFinite(normalized) ? normalized : 0;
    };

    const totalCount = rows.length;
    const summary = {
      totalAmountSuccess: rows
        .filter((item) => item.status === 'Success')
        .reduce((sum, item) => sum + toAmount(item.amount), 0),
      pendingCount: rows.filter((item) => item.status === 'Pending').length,
      successCount: rows.filter((item) => item.status === 'Success').length,
      failedCount: rows.filter((item) => item.status === 'Failed').length,
    };

    const items = rows
      .slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize)
      .map((item) => ({
        id: item.id,
        userId: item.userId || null,
        donorName: item.donorName || null,
        amount: toAmount(item.amount),
        phoneNumber: item.phoneNumber || null,
        message: item.message || null,
        transactionCode: item.transactionCode,
        paymentMethod: item.paymentMethod || 'momo',
        status: item.status,
        providerRef: item.providerRef || null,
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null,
      }));

    return {
      items,
      totalCount,
      page: paging.page,
      pageSize: paging.pageSize,
      totalPages: Math.ceil(totalCount / paging.pageSize),
      summary,
    };
  },

  updateDonationStatus: async function (id, status) {
    id = typeof id === 'string' ? id.trim() : '';
    status = typeof status === 'string' ? status.trim() : '';
    if (!id) throw { status: 400, message: 'Invalid donation id.' };
    if (!(status === 'Pending' || status === 'Success' || status === 'Failed')) {
      throw { status: 400, message: 'Invalid donation status.' };
    }

    let donation = mongo.toPlain(await models.donation.findOne({ _id: mongo.toObjectId(id) }).lean());
    if (!donation) throw { status: 404, message: 'Donation not found.' };

    donation = mongo.toPlain(
      await models.donation.findOneAndUpdate(
        { _id: mongo.toObjectId(donation.id) },
        { $set: { status } },
        { new: true },
      ).lean(),
    );

    return {
      id: donation.id,
      status: donation.status,
      updatedAt: donation.updatedAt || null,
    };
  },

  getRegistrations: async function (query) {
    const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';
    const status = typeof query.status === 'string' ? query.status.trim() : '';
    const eventId = typeof query.eventId === 'string' ? query.eventId.trim() : '';
    const organizationId = typeof query.organizationId === 'string' ? query.organizationId.trim() : '';
    const paging = toPageParams(query, 20);

    let rows = await models.eventRegistration
      .find({})
      .populate({
        path: 'eventId',
        populate: { path: 'organizationId' },
      })
      .populate('volunteerId')
      .sort({ registeredAt: -1 })
      .lean();

    rows = mongo.toPlain(rows).filter((item) => {
      const event = item.eventId || null;
      const organization = event && event.organizationId ? event.organizationId : null;
      const volunteer = item.volunteerId || null;

      const searchOk = !search
        || String(item.fullName || '').toLowerCase().includes(search)
        || String(item.phone || '').toLowerCase().includes(search)
        || String(event && event.title ? event.title : '').toLowerCase().includes(search)
        || String(organization && organization.name ? organization.name : '').toLowerCase().includes(search)
        || String(volunteer && volunteer.fullName ? volunteer.fullName : '').toLowerCase().includes(search);
      const statusOk = !status || item.status === status;
      const eventOk = !eventId || (event && event.id === eventId);
      const orgOk = !organizationId || (organization && organization.id === organizationId);
      return searchOk && statusOk && eventOk && orgOk;
    });

    const totalCount = rows.length;
    const summary = {
      pendingCount: rows.filter((item) => item.status === 'Pending').length,
      confirmedCount: rows.filter((item) => item.status === 'Confirmed').length,
      rejectedCount: rows.filter((item) => item.status === 'Rejected').length,
      cancelledCount: rows.filter((item) => item.status === 'Cancelled').length,
    };

    const items = rows
      .slice((paging.page - 1) * paging.pageSize, (paging.page - 1) * paging.pageSize + paging.pageSize)
      .map((item) => {
        const event = item.eventId || null;
        const organization = event && event.organizationId ? event.organizationId : null;
        const volunteer = item.volunteerId || null;
        return {
          id: item.id,
          fullName: item.fullName || null,
          phone: item.phone || null,
          reason: item.reason || null,
          status: item.status,
          registeredAt: item.registeredAt || null,
          eventId: event ? event.id : null,
          eventTitle: event ? event.title : null,
          organizationId: organization ? organization.id : null,
          organizationName: organization ? organization.name : null,
          volunteerId: volunteer ? volunteer.id : null,
          volunteerName: volunteer ? volunteer.fullName : item.fullName || null,
        };
      });

    return {
      items,
      totalCount,
      page: paging.page,
      pageSize: paging.pageSize,
      totalPages: Math.ceil(totalCount / paging.pageSize),
      summary,
    };
  },

  updateRegistrationStatusByAdmin: async function (id, status) {
    id = typeof id === 'string' ? id.trim() : '';
    status = typeof status === 'string' ? status.trim() : '';
    if (!id) throw { status: 400, message: 'Invalid registration id.' };
    if (!(status === 'Pending' || status === 'Confirmed' || status === 'Rejected' || status === 'Cancelled')) {
      throw { status: 400, message: 'Invalid registration status.' };
    }

    let registration = mongo.toPlain(await models.eventRegistration.findOne({ _id: mongo.toObjectId(id) }).lean());
    if (!registration) throw { status: 404, message: 'Registration not found.' };

    registration = mongo.toPlain(
      await models.eventRegistration.findOneAndUpdate(
        { _id: mongo.toObjectId(registration.id) },
        { $set: { status } },
        { new: true },
      ).lean(),
    );

    return {
      id: registration.id,
      status: registration.status,
    };
  },
};
