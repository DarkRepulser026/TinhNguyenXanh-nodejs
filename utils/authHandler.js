let jwt = require('jsonwebtoken');
let mongo = require('./mongo');

let models = require('./models');

let AUTH_COOKIE_NAME = 'vh_session';
let JWT_SECRET = 'volunteerhub-dev-secret-change-me';

function getToken(req) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        return req.headers.authorization.split(' ')[1];
    }

    if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
        return req.cookies[AUTH_COOKIE_NAME];
    }

    return null;
}

async function readAuthUser(req) {
    try {
        let token = getToken(req);
        if (!token) {
            return null;
        }

        let payload = jwt.verify(token, JWT_SECRET);
        let user = await models.appUser.findOne({
            _id: mongo.toObjectId(payload.userId),
        }).lean();

        user = mongo.toPlain(user);

        if (!user || !user.isActive) {
            return null;
        }

        return {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
    } catch (error) {
        return null;
    }
}

function requireAuth(req, res, next) {
    readAuthUser(req)
        .then(function (authUser) {
            if (!authUser) {
                res.status(401).send({ message: 'Authentication required.' });
                return;
            }

            req.authUser = authUser;
            next();
        })
        .catch(next);
}

function requireRole() {
    let requiredRole = Array.prototype.slice.call(arguments);

    return function (req, res, next) {
        let readUser = req.authUser ? Promise.resolve(req.authUser) : readAuthUser(req);

        readUser
            .then(function (authUser) {
                if (!authUser) {
                    res.status(401).send({ message: 'Authentication required.' });
                    return;
                }

                if (requiredRole.includes(authUser.role)) {
                    req.authUser = authUser;
                    next();
                    return;
                }

                res.status(403).send({ message: 'Access denied.' });
            })
            .catch(next);
    };
}

function createAuthToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d'
    });
}

module.exports = {
    AUTH_COOKIE_NAME: AUTH_COOKIE_NAME,
    CheckLogin: requireAuth,
    CheckRole: requireRole,
    createAuthToken: createAuthToken,
    readAuthUser: readAuthUser,
    requireAuth: requireAuth,
    requireRole: requireRole,
};