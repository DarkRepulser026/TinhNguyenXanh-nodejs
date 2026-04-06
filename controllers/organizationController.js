// controllers/organizationController.js
const models = require('../utils/models');
const mongo = require('../utils/mongo');

module.exports = {
  async getOrganizations(req, res, next) {
  try {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
    const city = typeof req.query.city === 'string' ? req.query.city.trim().toLowerCase() : '';
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 12)));

    let rows = await models.organization.find({}).lean();
    rows = mongo.toPlain(rows);

    rows = rows.filter((item) => {
      const keywordOk = !keyword || (item.name || '').toLowerCase().includes(keyword) || (item.description || '').toLowerCase().includes(keyword);
      const cityOk = !city || (item.city || '').toLowerCase().includes(city);
      return keywordOk && cityOk;
    });

    const totalCount = rows.length;
    const items = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

    res.send({ items, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) });
  } catch (error) {
    next(error);
  }
  },

  async getOrganizationById(req, res, next) {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
      return res.status(400).send({ message: 'Invalid organization id.' });
    }

    let row = await models.organization.findOne({ _id: mongo.toObjectId(id) }).lean();
    row = mongo.toPlain(row);

    if (!row) {
      return res.status(404).send({ message: 'Organization not found.' });
    }

    const approvedEvents = await models.event
      .find({ organizationId: mongo.toObjectId(id), status: 'approved', isHidden: { $ne: true } })
      .select('title startTime endTime location status')
      .sort({ startTime: 1 })
      .limit(5)
      .lean();

    res.send({ ...row, events: mongo.toPlain(approvedEvents) });
  } catch (error) {
    next(error);
  }
  },

  async registerOrganization(req, res, next) {
  try {
    const authUser = req.authUser;
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const organizationType = typeof req.body.organizationType === 'string' ? req.body.organizationType.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const contactEmail = typeof req.body.contactEmail === 'string' ? req.body.contactEmail.trim().toLowerCase() : '';
    const phoneNumber = typeof req.body.phoneNumber === 'string' ? req.body.phoneNumber.trim() : '';
    const website = typeof req.body.website === 'string' ? req.body.website.trim() : null;
    const city = typeof req.body.city === 'string' ? req.body.city.trim() : '';
    const district = typeof req.body.district === 'string' ? req.body.district.trim() : '';
    const ward = typeof req.body.ward === 'string' ? req.body.ward.trim() : null;
    const address = typeof req.body.address === 'string' ? req.body.address.trim() : '';
    const taxCode = typeof req.body.taxCode === 'string' ? req.body.taxCode.trim() : null;
    const foundedDate = req.body.foundedDate ? new Date(req.body.foundedDate) : null;
    const legalRepresentative = typeof req.body.legalRepresentative === 'string' ? req.body.legalRepresentative.trim() : null;
    const documentType = typeof req.body.documentType === 'string' ? req.body.documentType.trim() : null;
    const verificationDocsUrl = typeof req.body.verificationDocsUrl === 'string' ? req.body.verificationDocsUrl.trim() : null;
    const facebookUrl = typeof req.body.facebookUrl === 'string' ? req.body.facebookUrl.trim() : null;
    const zaloNumber = typeof req.body.zaloNumber === 'string' ? req.body.zaloNumber.trim() : null;
    const achievements = typeof req.body.achievements === 'string' ? req.body.achievements.trim() : null;
    const avatarUrl = typeof req.body.avatarUrl === 'string' ? req.body.avatarUrl.trim() : null;
    const memberCount = Math.max(0, Number(req.body.memberCount || 0));
    const eventsOrganized = Math.max(0, Number(req.body.eventsOrganized || 0));
    const focusAreas = Array.isArray(req.body.focusAreas)
      ? req.body.focusAreas.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
      : (typeof req.body.focusAreas === 'string' && req.body.focusAreas.trim() ? [req.body.focusAreas.trim()] : []);

    if (!name || !organizationType || !description || !contactEmail || !phoneNumber || !city || !district || !address) {
      return res.status(400).send({ message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
    }

    if (focusAreas.length === 0) {
      return res.status(400).send({ message: 'Vui lòng chọn ít nhất một lĩnh vực hoạt động.' });
    }

    const existingOwnedOrganization = await models.organization.findOne({ ownerUserId: mongo.toObjectId(authUser.userId) }).lean();
    if (existingOwnedOrganization) {
      return res.status(409).send({ message: 'Tài khoản này đã sở hữu một tổ chức.' });
    }

    const organization = await models.organization.create({
      name,
      organizationType,
      description,
      contactEmail,
      phoneNumber,
      website,
      city,
      district,
      ward,
      address,
      taxCode,
      foundedDate: foundedDate && !Number.isNaN(foundedDate.getTime()) ? foundedDate : null,
      legalRepresentative,
      documentType,
      verificationDocsUrl,
      facebookUrl,
      zaloNumber,
      achievements,
      memberCount: Number.isFinite(memberCount) ? memberCount : 0,
      eventsOrganized: Number.isFinite(eventsOrganized) ? eventsOrganized : 0,
      focusAreas,
      avatarUrl,
      verified: false,
      averageRating: 0,
      totalReviews: 0,
      ownerUserId: mongo.toObjectId(authUser.userId),
    });

    const plainOrganization = mongo.toPlain(organization.toObject());

    await models.appUser.findOneAndUpdate({ _id: mongo.toObjectId(authUser.userId) }, { $set: { role: 'Organizer' } }, { new: true }).lean();

    await models.organizationMember.findOneAndUpdate(
      { organizationId: mongo.toObjectId(plainOrganization.id), userId: mongo.toObjectId(authUser.userId) },
      { $set: { role: 'Owner', status: 'Active' }, $setOnInsert: { joinedAt: new Date() } },
      { upsert: true, new: true }
    ).lean();

    res.status(201).send({ message: 'Đăng ký tổ chức thành công.', item: plainOrganization });
  } catch (error) {
    next(error);
  }
  }
};
