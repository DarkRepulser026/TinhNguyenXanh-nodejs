var express = require('express');
var router = express.Router();

router.get('/health', function (req, res) {
    res.send({ status: 'ok', service: 'volunteerhub-api' });
});

module.exports = router;
