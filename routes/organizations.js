var express = require('express');
var router = express.Router();
var db = require('../utils/db');

var prisma = db.prisma;

router.get('/organizations', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
    var city = typeof req.query.city === 'string' ? req.query.city.trim().toLowerCase() : '';
    var page = Math.max(1, Number(req.query.page || 1));
    var pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 12)));

    var rows = await prisma.organization.findMany();

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

    var row = await prisma.organization.findUnique({
        where: {
            id: id,
        },
    });

    if (!row) {
        res.status(404).send({ message: 'Organization not found.' });
        return;
    }

    res.send(row);
        })
        .catch(next);
});

module.exports = router;
