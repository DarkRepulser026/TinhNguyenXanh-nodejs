var authHandler = require('../utils/authHandler');
var express = require('express');
var router = express.Router();
var models = require('../utils/models');
var mongo = require('../utils/mongo');

router.get('/organizations', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
            var city = typeof req.query.city === 'string' ? req.query.city.trim().toLowerCase() : '';
            var page = Math.max(1, Number(req.query.page || 1));
            var pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 12)));

            var rows = await models.organization.find({}).lean();
            rows = mongo.toPlain(rows);

            rows = rows.filter(function (item) {
                var keywordOk = !keyword ||
                    (item.name || '').toLowerCase().includes(keyword) ||
                    (item.description || '').toLowerCase().includes(keyword);
                var cityOk = !city || (item.city || '').toLowerCase().includes(city);
                return keywordOk && cityOk;
            });

            var totalCount = rows.length;
            var items = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

            res.send({
                items: items,
                totalCount: totalCount,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            });
        })
        .catch(next);
});

router.get('/organizations/:id', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
            if (!id) {
                res.status(400).send({ message: 'Invalid organization id.' });
                return;
            }

            var row = await models.organization.findOne({ _id: mongo.toObjectId(id) }).lean();

            row = mongo.toPlain(row);

            if (!row) {
                res.status(404).send({ message: 'Organization not found.' });
                return;
            }

            var approvedEvents = await models.event
                .find({
                    organizationId: mongo.toObjectId(id),
                    status: 'approved',
                    isHidden: { $ne: true },
                })
                .select('title startTime endTime location status')
                .sort({ startTime: 1 })
                .limit(5)
                .lean();

            approvedEvents = mongo.toPlain(approvedEvents);

            res.send({
                ...row,
                events: approvedEvents,
            });
        })
        .catch(next);
});
router.post('/organizations/register', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;

            var name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
            var organizationType = typeof req.body.organizationType === 'string' ? req.body.organizationType.trim() : '';
            var description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
            var contactEmail = typeof req.body.contactEmail === 'string' ? req.body.contactEmail.trim().toLowerCase() : '';
            var phoneNumber = typeof req.body.phoneNumber === 'string' ? req.body.phoneNumber.trim() : '';
            var website = typeof req.body.website === 'string' ? req.body.website.trim() : null;
            var city = typeof req.body.city === 'string' ? req.body.city.trim() : '';
            var district = typeof req.body.district === 'string' ? req.body.district.trim() : '';
            var ward = typeof req.body.ward === 'string' ? req.body.ward.trim() : null;
            var address = typeof req.body.address === 'string' ? req.body.address.trim() : '';

            var taxCode = typeof req.body.taxCode === 'string' ? req.body.taxCode.trim() : null;
            var foundedDate = req.body.foundedDate ? new Date(req.body.foundedDate) : null;
            var legalRepresentative = typeof req.body.legalRepresentative === 'string' ? req.body.legalRepresentative.trim() : null;

            var documentType = typeof req.body.documentType === 'string' ? req.body.documentType.trim() : null;
            var verificationDocsUrl = typeof req.body.verificationDocsUrl === 'string' ? req.body.verificationDocsUrl.trim() : null;

            var facebookUrl = typeof req.body.facebookUrl === 'string' ? req.body.facebookUrl.trim() : null;
            var zaloNumber = typeof req.body.zaloNumber === 'string' ? req.body.zaloNumber.trim() : null;

            var achievements = typeof req.body.achievements === 'string' ? req.body.achievements.trim() : null;
            var avatarUrl = typeof req.body.avatarUrl === 'string' ? req.body.avatarUrl.trim() : null;

            var memberCount = Math.max(0, Number(req.body.memberCount || 0));
            var eventsOrganized = Math.max(0, Number(req.body.eventsOrganized || 0));

            var focusAreas = Array.isArray(req.body.focusAreas)
                ? req.body.focusAreas.filter(function (item) { return typeof item === 'string' && item.trim(); }).map(function (item) { return item.trim(); })
                : (typeof req.body.focusAreas === 'string' && req.body.focusAreas.trim() ? [req.body.focusAreas.trim()] : []);

            if (!name || !organizationType || !description || !contactEmail || !phoneNumber || !city || !district || !address) {
                res.status(400).send({ message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
                return;
            }

            if (focusAreas.length === 0) {
                res.status(400).send({ message: 'Vui lòng chọn ít nhất một lĩnh vực hoạt động.' });
                return;
            }

            var existingOwnedOrganization = await models.organization.findOne({
                ownerUserId: mongo.toObjectId(authUser.userId),
            }).lean();

            if (existingOwnedOrganization) {
                res.status(409).send({ message: 'Tài khoản này đã sở hữu một tổ chức.' });
                return;
            }

            var organization = await models.organization.create({
                name: name,
                organizationType: organizationType,
                description: description,
                contactEmail: contactEmail,
                phoneNumber: phoneNumber,
                website: website,
                city: city,
                district: district,
                ward: ward,
                address: address,
                taxCode: taxCode,
                foundedDate: foundedDate && !Number.isNaN(foundedDate.getTime()) ? foundedDate : null,
                legalRepresentative: legalRepresentative,
                documentType: documentType,
                verificationDocsUrl: verificationDocsUrl,
                facebookUrl: facebookUrl,
                zaloNumber: zaloNumber,
                achievements: achievements,
                memberCount: Number.isFinite(memberCount) ? memberCount : 0,
                eventsOrganized: Number.isFinite(eventsOrganized) ? eventsOrganized : 0,
                focusAreas: focusAreas,
                avatarUrl: avatarUrl,
                verified: false,
                averageRating: 0,
                totalReviews: 0,
                ownerUserId: mongo.toObjectId(authUser.userId),
            });

            var plainOrganization = mongo.toPlain(organization.toObject());

            await models.appUser.findOneAndUpdate(
                { _id: mongo.toObjectId(authUser.userId) },
                { $set: { role: 'Organizer' } },
                { new: true }
            ).lean();

            await models.organizationMember.findOneAndUpdate(
                {
                    organizationId: mongo.toObjectId(plainOrganization.id),
                    userId: mongo.toObjectId(authUser.userId),
                },
                {
                    $set: {
                        role: 'Owner',
                        status: 'Active',
                    },
                    $setOnInsert: {
                        joinedAt: new Date(),
                    },
                },
                {
                    upsert: true,
                    new: true,
                }
            ).lean();

            res.status(201).send({
                message: 'Đăng ký tổ chức thành công.',
                item: plainOrganization,
            });
        })
        .catch(next);
});
module.exports = router;
