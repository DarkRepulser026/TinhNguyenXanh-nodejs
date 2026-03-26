var express = require('express');
var router = express.Router();
var authHandler = require('../utils/authHandler');
var db = require('../utils/db');

var prisma = db.prisma;

function toRole(value) {
    if (value === 'Admin' || value === 'Organizer' || value === 'Volunteer') {
        return value;
    }

    return 'Volunteer';
}

router.post('/auth/register', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
        var email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        var fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
        var phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : null;
        var password = typeof req.body.password === 'string' ? req.body.password : '';
        var role = toRole(req.body.role);

        if (!email || !fullName || !password) {
            res.status(400).send({ message: 'email, fullName, and password are required.' });
            return;
        }

        if (password.length < 8) {
            res.status(400).send({ message: 'Password must be at least 8 characters.' });
            return;
        }

        var existing = await prisma.appUser.findUnique({
            where: {
                email: email,
            },
        });

        if (existing) {
            res.status(409).send({ message: 'Email is already registered.' });
            return;
        }

        var user = await prisma.appUser.create({
            data: {
                email: email,
                fullName: fullName,
                phone: phone,
                role: role,
                passwordHash: password,
                isActive: true,
            },
        });

        if (role === 'Volunteer') {
            await prisma.volunteer.upsert({
                where: {
                    userId: user.id,
                },
                create: {
                    userId: user.id,
                    fullName: fullName,
                    phone: phone,
                },
                update: {
                    fullName: fullName,
                    phone: phone,
                },
            });
        }

        var token = authHandler.createAuthToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        res.cookie(authHandler.AUTH_COOKIE_NAME, token, {
            maxAge: 7 * 24 * 3600 * 1000,
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });

        res.status(201).send({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role,
            },
        });
        })
        .catch(next);
});

router.post('/auth/login', function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    var password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
        res.status(400).send({ message: 'email and password are required.' });
        return;
    }

    var user = await prisma.appUser.findUnique({
        where: {
            email: email,
        },
    });

    if (!user || !user.isActive || user.passwordHash !== password) {
        res.status(401).send({ message: 'Invalid credentials.' });
        return;
    }

    var token = authHandler.createAuthToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    res.cookie(authHandler.AUTH_COOKIE_NAME, token, {
        maxAge: 7 * 24 * 3600 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    });

    res.send({
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
        },
    });
        })
        .catch(next);
});

router.post('/auth/logout', function (req, res) {
    res.clearCookie(authHandler.AUTH_COOKIE_NAME);
    res.send({ message: 'Logged out.' });
});

router.get('/auth/me', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
            var authUser = req.authUser;
            var user = await prisma.appUser.findUnique({
                where: {
                    id: authUser.userId,
                },
            });

            if (!user || !user.isActive) {
                res.status(401).send({ message: 'Session is no longer valid.' });
                return;
            }

            res.send({
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    phone: user.phone,
                    role: user.role,
                },
            });
        })
        .catch(next);
});

router.patch('/auth/me', authHandler.requireAuth, function (req, res, next) {
    Promise.resolve()
        .then(async function () {
    var fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
    var phoneRaw = typeof req.body.phone === 'string' ? req.body.phone.trim() : undefined;
    var phone = phoneRaw === '' ? null : phoneRaw;
    var authUser = req.authUser;

    if (!fullName) {
        res.status(400).send({ message: 'fullName is required.' });
        return;
    }

    var user = await prisma.appUser.findUnique({
        where: {
            id: authUser.userId,
        },
    });

    if (!user || !user.isActive) {
        res.status(404).send({ message: 'User not found.' });
        return;
    }

    user = await prisma.appUser.update({
        where: {
            id: user.id,
        },
        data: {
            fullName: fullName,
            phone: phone,
        },
    });

    await prisma.volunteer.updateMany({
        where: {
            userId: user.id,
        },
        data: {
            fullName: fullName,
            phone: phone,
        },
    });

    res.send({
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
        },
    });
        })
        .catch(next);
});

module.exports = router;