#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

function getArgValue(flag) {
  var index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) {
    return '';
  }
  return process.argv[index + 1];
}

function parseList(value) {
  return String(value || '')
    .split(',')
    .map(function (item) {
      return Number(item.trim());
    })
    .filter(function (item) {
      return Number.isFinite(item);
    });
}

function toExpectedLabel(list) {
  return list.join('/');
}

function clip(text, maxLength) {
  var value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, maxLength) + '...';
}

if (process.argv.includes('--help')) {
  console.log('Reusable API smoke test');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/smoke-test.js [--base-url <url>] [--token <jwt>] [--expect-auth <codes>]');
  console.log('');
  console.log('Options:');
  console.log('  --base-url     API base URL (default: http://localhost:3000)');
  console.log('  --token        Bearer token for protected endpoint checks');
  console.log('  --expect-auth  Comma-separated expected codes for protected routes with auth (default: 200,201,400)');
  console.log('');
  console.log('Environment variables:');
  console.log('  SMOKE_BASE_URL');
  console.log('  SMOKE_TOKEN');
  console.log('  SMOKE_TIMEOUT_MS');
  process.exit(0);
}

var baseUrl = getArgValue('--base-url') || process.env.SMOKE_BASE_URL || 'http://localhost:3000';
var token = getArgValue('--token') || process.env.SMOKE_TOKEN || '';
var timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 15000);
var expectedProtectedWithToken = parseList(getArgValue('--expect-auth') || '200,201,400');
var zeroId = '000000000000000000000000';

function normalizePath(inputPath) {
  var value = String(inputPath || '');
  if (value.length > 1 && value.endsWith('/')) {
    return value.slice(0, -1);
  }
  return value;
}

function toRouteKey(method, fullPath) {
  var normalized = normalizePath(fullPath).replace(/:[A-Za-z0-9_]+/g, ':param');
  return String(method || 'GET').toUpperCase() + ' ' + normalized;
}

function normalizeRouteKey(routeKey) {
  var value = String(routeKey || '').trim();
  var firstSpace = value.indexOf(' ');
  if (firstSpace === -1) {
    return value;
  }
  var method = value.slice(0, firstSpace).toUpperCase();
  var routePath = value.slice(firstSpace + 1);
  return toRouteKey(method, routePath);
}

var tests = [
  { method: 'GET', path: '/api/v1/health', noAuth: [200], withAuth: [200] },
  { method: 'GET', path: '/api/v1/events?page=1&pageSize=1', noAuth: [200], withAuth: [200] },
  { method: 'GET', path: '/api/v1/organizations?page=1&pageSize=1', noAuth: [200], withAuth: [200] },

  { method: 'GET', path: '/api/v1/admin/dashboard', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { method: 'GET', path: '/api/v1/admin/events/approvals?page=1&pageSize=1', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { method: 'GET', path: '/api/v1/admin/users?page=1&pageSize=1', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { method: 'GET', path: '/api/v1/admin/categories', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { method: 'GET', path: '/api/v1/admin/moderation?page=1&pageSize=1', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },

  { method: 'GET', path: '/api/v1/organizer/dashboard', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { method: 'GET', path: '/api/v1/organizer/profile', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { method: 'GET', path: '/api/v1/organizer/events?page=1&pageSize=1', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { method: 'GET', path: '/api/v1/organizer/volunteers?page=1&pageSize=1', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },

  // Organizer contract checks for frontend/backend endpoint alignment.
  { method: 'POST', path: '/api/v1/organizer/claim', noAuth: [401], withAuth: [400, 404], auth: true },
  { method: 'GET', path: '/api/v1/organizer/events/000000000000000000000000', noAuth: [401], withAuth: [400, 403, 404], auth: true },
  { method: 'POST', path: '/api/v1/organizer/registrations/000000000000000000000000/evaluation', noAuth: [401], withAuth: [400, 403, 404], auth: true },

  { method: 'GET', path: '/api/v1/events/000000000000000000000000/comments', noAuth: [200], withAuth: [200] },
  { method: 'GET', path: '/api/v1/organizations/000000000000000000000000/reviews', noAuth: [404], withAuth: [404] },
  { method: 'GET', path: '/api/v1/payments/TEST', noAuth: [404], withAuth: [404] },
  { method: 'GET', path: '/api/v1/profile', noAuth: [401], withAuth: [200], auth: true },

  { routeKey: 'GET /', method: 'GET', path: '/', noAuth: [200], withAuth: [200] },

  { routeKey: 'GET /api/v1/health', method: 'GET', path: '/api/v1/health', noAuth: [200], withAuth: [200] },
  { routeKey: 'POST /api/v1/contact', method: 'POST', path: '/api/v1/contact', noAuth: [400], withAuth: [400], body: {} },

  { routeKey: 'POST /api/v1/register', method: 'POST', path: '/api/v1/register', noAuth: [400], withAuth: [400], body: {} },
  { routeKey: 'POST /api/v1/login', method: 'POST', path: '/api/v1/login', noAuth: [400], withAuth: [400], body: {} },
  { routeKey: 'POST /api/v1/logout', method: 'POST', path: '/api/v1/logout', noAuth: [200], withAuth: [200] },
  { routeKey: 'GET /api/v1/profile', method: 'GET', path: '/api/v1/profile', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'PUT /api/v1/profile', method: 'PUT', path: '/api/v1/profile', noAuth: [401], withAuth: [400, 200, 403], auth: true, body: { fullName: 'Smoke User', phone: '0900000000' } },

  { routeKey: 'GET /api/v1/events', method: 'GET', path: '/api/v1/events?page=1&pageSize=1', noAuth: [200], withAuth: [200], minItems: 1 },
  { routeKey: 'GET /api/v1/events/:id', method: 'GET', path: '/api/v1/events/{{eventId}}', noAuth: [200], withAuth: [200] },
  { routeKey: 'POST /api/v1/events/:id/register', method: 'POST', path: '/api/v1/events/{{eventId}}/register', noAuth: [401], withAuth: [400, 401, 403, 409, 201], auth: true, body: { fullName: 'Smoke User', phone: '0900000000', reason: 'Smoke test' } },
  { routeKey: 'POST /api/v1/events/:id/favorite', method: 'POST', path: '/api/v1/events/{{eventId}}/favorite', noAuth: [401], withAuth: [401, 201, 200], auth: true },
  { routeKey: 'GET /api/v1/categories', method: 'GET', path: '/api/v1/categories', noAuth: [200], withAuth: [200] },

  { routeKey: 'GET /api/v1/organizations', method: 'GET', path: '/api/v1/organizations?page=1&pageSize=1', noAuth: [200], withAuth: [200], minItems: 1 },
  { routeKey: 'GET /api/v1/organizations/:id', method: 'GET', path: '/api/v1/organizations/{{organizationId}}', noAuth: [200], withAuth: [200] },
  { routeKey: 'POST /api/v1/organizations/register', method: 'POST', path: '/api/v1/organizations/register', noAuth: [401], withAuth: [400, 401, 403, 409, 201], auth: true, body: {} },

  { routeKey: 'GET /api/v1/events/:id/comments', method: 'GET', path: '/api/v1/events/{{eventId}}/comments', noAuth: [200], withAuth: [200], minItems: 1 },
  { routeKey: 'POST /api/v1/events/:id/comments', method: 'POST', path: '/api/v1/events/{{eventId}}/comments', noAuth: [401], withAuth: [400, 401, 403, 201], auth: true, body: { content: 'Smoke comment' } },
  { routeKey: 'GET /api/v1/events/:id/ratings', method: 'GET', path: '/api/v1/events/{{eventId}}/ratings', noAuth: [200], withAuth: [200], minItems: 1 },
  { routeKey: 'POST /api/v1/events/:id/ratings', method: 'POST', path: '/api/v1/events/{{eventId}}/ratings', noAuth: [401], withAuth: [400, 401, 403, 201, 200], auth: true, body: { rating: 5, review: 'Smoke rating' } },

  { routeKey: 'GET /api/v1/organizations/:id/reviews', method: 'GET', path: '/api/v1/organizations/{{organizationId}}/reviews', noAuth: [200], withAuth: [200], minItems: 1 },
  { routeKey: 'POST /api/v1/organizations/:id/reviews', method: 'POST', path: '/api/v1/organizations/{{organizationId}}/reviews', noAuth: [401], withAuth: [400, 401, 403, 201, 200], auth: true, body: { rating: 5, title: 'Smoke review', content: 'Smoke content' } },
  { routeKey: 'POST /api/v1/events/:id/reports', method: 'POST', path: '/api/v1/events/{{eventId}}/reports', noAuth: [401], withAuth: [400, 401, 403, 201], auth: true, body: { reason: 'Smoke test report', details: 'Automated check' } },

  { routeKey: 'GET /api/v1/payments/:transactionCode', method: 'GET', path: '/api/v1/payments/SEED_DONATION_1', noAuth: [200], withAuth: [200] },
  { routeKey: 'POST /api/v1/payments/momo/create', method: 'POST', path: '/api/v1/payments/momo/create', noAuth: [400], withAuth: [400], body: { amount: 0 } },
  { routeKey: 'POST /api/v1/payments/momo/ipn', method: 'POST', path: '/api/v1/payments/momo/ipn', noAuth: [400, 500], withAuth: [400, 500], body: {} },

  { routeKey: 'GET /api/v1/admin/dashboard', method: 'GET', path: '/api/v1/admin/dashboard', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { routeKey: 'GET /api/v1/admin/events/approvals', method: 'GET', path: '/api/v1/admin/events/approvals?page=1&pageSize=1', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { routeKey: 'PATCH /api/v1/admin/events/:id/status', method: 'PATCH', path: '/api/v1/admin/events/{{eventId}}/status', noAuth: [401], withAuth: [200, 400], auth: true, body: { action: 'approve' } },
  { routeKey: 'GET /api/v1/admin/users', method: 'GET', path: '/api/v1/admin/users?page=1&pageSize=1', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { routeKey: 'PATCH /api/v1/admin/users/:id/status', method: 'PATCH', path: '/api/v1/admin/users/{{adminTargetUserId}}/status', noAuth: [401], withAuth: [200, 400], auth: true, body: { isActive: true } },
  { routeKey: 'PATCH /api/v1/admin/users/:id/role', method: 'PATCH', path: '/api/v1/admin/users/{{adminTargetUserId}}/role', noAuth: [401], withAuth: [200, 400], auth: true, body: { role: 'Volunteer' } },
  { routeKey: 'GET /api/v1/admin/categories', method: 'GET', path: '/api/v1/admin/categories', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },
  { routeKey: 'POST /api/v1/admin/categories', method: 'POST', path: '/api/v1/admin/categories', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true, body: { name: 'Smoke Category' } },
  { routeKey: 'PATCH /api/v1/admin/categories/:id', method: 'PATCH', path: '/api/v1/admin/categories/{{adminCategoryId}}', noAuth: [401], withAuth: [200, 400], auth: true, body: { name: 'Updated Smoke Category' } },
  { routeKey: 'DELETE /api/v1/admin/categories/:id', method: 'DELETE', path: '/api/v1/admin/categories/{{adminCategoryId}}', noAuth: [401], withAuth: [200, 400], auth: true },
  { routeKey: 'GET /api/v1/admin/moderation', method: 'GET', path: '/api/v1/admin/moderation?page=1&pageSize=1', noAuth: [401], withAuth: expectedProtectedWithToken, auth: true },

  { routeKey: 'GET /api/v1/organizer/dashboard', method: 'GET', path: '/api/v1/organizer/dashboard', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'GET /api/v1/organizer/profile', method: 'GET', path: '/api/v1/organizer/profile', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'PUT /api/v1/organizer/profile', method: 'PUT', path: '/api/v1/organizer/profile', noAuth: [401], withAuth: [200, 400], auth: true, body: { name: '{{organizationName}}' } },
  { routeKey: 'POST /api/v1/organizer/claim', method: 'POST', path: '/api/v1/organizer/claim', noAuth: [401], withAuth: [200, 400], auth: true, body: { organizationId: '{{organizationId}}' } },
  { routeKey: 'GET /api/v1/organizer/events', method: 'GET', path: '/api/v1/organizer/events?page=1&pageSize=1', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'GET /api/v1/organizer/events/:id', method: 'GET', path: '/api/v1/organizer/events/{{organizerEventId}}', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'POST /api/v1/organizer/events', method: 'POST', path: '/api/v1/organizer/events', noAuth: [401], withAuth: [201, 400], auth: true, body: { title: 'Smoke Event' } },
  { routeKey: 'PUT /api/v1/organizer/events/:id', method: 'PUT', path: '/api/v1/organizer/events/{{organizerEventId}}', noAuth: [401], withAuth: [200, 400], auth: true, body: { title: '{{organizerEventTitle}}' } },
  { routeKey: 'PATCH /api/v1/organizer/events/:id/hide', method: 'PATCH', path: '/api/v1/organizer/events/{{organizerEventId}}/hide', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'PATCH /api/v1/organizer/events/:id/unhide', method: 'PATCH', path: '/api/v1/organizer/events/{{organizerEventId}}/unhide', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'GET /api/v1/organizer/volunteers', method: 'GET', path: '/api/v1/organizer/volunteers?page=1&pageSize=1', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'GET /api/v1/organizer/registrations/:id', method: 'GET', path: '/api/v1/organizer/registrations/{{organizerRegistrationId}}', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'PATCH /api/v1/organizer/registrations/:id/status', method: 'PATCH', path: '/api/v1/organizer/registrations/{{organizerRegistrationId}}/status', noAuth: [401], withAuth: [200, 400], auth: true, body: { action: 'approve' } },
  { routeKey: 'GET /api/v1/organizer/registrations/:id/evaluation', method: 'GET', path: '/api/v1/organizer/registrations/{{organizerRegistrationId}}/evaluation', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'POST /api/v1/organizer/registrations/:id/evaluation', method: 'POST', path: '/api/v1/organizer/registrations/{{organizerRegistrationId}}/evaluation', noAuth: [401], withAuth: [200, 400], auth: true, body: { rating: 5, comment: 'Smoke' } },
  { routeKey: 'GET /api/v1/organizer/volunteers/:id/history', method: 'GET', path: '/api/v1/organizer/volunteers/{{organizerVolunteerId}}/history', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'GET /api/v1/organizer/members', method: 'GET', path: '/api/v1/organizer/members', noAuth: [401], withAuth: [200], auth: true },

  { routeKey: 'GET /api/v1/volunteers/:userId/profile', method: 'GET', path: '/api/v1/volunteers/{{volunteerUserId}}/profile', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'PUT /api/v1/volunteers/:userId/profile', method: 'PUT', path: '/api/v1/volunteers/{{volunteerUserId}}/profile', noAuth: [401], withAuth: [200], auth: true, body: { fullName: 'Smoke Volunteer User', phone: '0900000000' } },
  { routeKey: 'POST /api/v1/volunteers/:userId/avatar', method: 'POST', path: '/api/v1/volunteers/{{volunteerUserId}}/avatar', noAuth: [401], withAuth: [200], auth: true, body: { avatarData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB' } },
  { routeKey: 'GET /api/v1/volunteers/:userId/registrations', method: 'GET', path: '/api/v1/volunteers/{{volunteerUserId}}/registrations', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'DELETE /api/v1/volunteers/:userId/registrations/:registrationId', method: 'DELETE', path: '/api/v1/volunteers/{{volunteerUserId}}/registrations/{{volunteerRegistrationId}}', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'GET /api/v1/volunteers/:userId/favorites', method: 'GET', path: '/api/v1/volunteers/{{volunteerUserId}}/favorites', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'DELETE /api/v1/volunteers/:userId/favorites/:eventId', method: 'DELETE', path: '/api/v1/volunteers/{{volunteerUserId}}/favorites/{{volunteerFavoriteEventId}}', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'GET /api/v1/volunteers/:userId/dashboard', method: 'GET', path: '/api/v1/volunteers/{{volunteerUserId}}/dashboard', noAuth: [401], withAuth: [200], auth: true },
  { routeKey: 'GET /api/v1/volunteers/:userId/donations', method: 'GET', path: '/api/v1/volunteers/{{volunteerUserId}}/donations', noAuth: [401], withAuth: [200], auth: true },
];

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function resolvePath(path, context) {
  return String(path || '')
    .replace(/\{\{eventId\}\}/g, context.eventId || zeroId)
    .replace(/\{\{organizationId\}\}/g, context.organizationId || zeroId)
    .replace(/\{\{adminTargetUserId\}\}/g, context.adminTargetUserId || zeroId)
    .replace(/\{\{adminCategoryId\}\}/g, context.adminCategoryId || zeroId)
    .replace(/\{\{organizerEventId\}\}/g, context.organizerEventId || zeroId)
    .replace(/\{\{organizerRegistrationId\}\}/g, context.organizerRegistrationId || zeroId)
    .replace(/\{\{organizerVolunteerId\}\}/g, context.organizerVolunteerId || zeroId)
    .replace(/\{\{organizationName\}\}/g, context.organizationName || 'Organization')
    .replace(/\{\{organizerEventTitle\}\}/g, context.organizerEventTitle || 'Event')
    .replace(/\{\{volunteerUserId\}\}/g, context.volunteerUserId || zeroId)
    .replace(/\{\{volunteerRegistrationId\}\}/g, context.volunteerRegistrationId || zeroId)
    .replace(/\{\{volunteerFavoriteEventId\}\}/g, context.volunteerFavoriteEventId || zeroId)
    .replace(/\{\{zeroId\}\}/g, zeroId);
}

function resolveBodyPlaceholders(value, context) {
  if (typeof value === 'string') {
    return value
      .replace(/\{\{eventId\}\}/g, context.eventId || zeroId)
      .replace(/\{\{organizationId\}\}/g, context.organizationId || zeroId)
      .replace(/\{\{adminTargetUserId\}\}/g, context.adminTargetUserId || zeroId)
      .replace(/\{\{adminCategoryId\}\}/g, context.adminCategoryId || zeroId)
      .replace(/\{\{organizerEventId\}\}/g, context.organizerEventId || zeroId)
      .replace(/\{\{organizerRegistrationId\}\}/g, context.organizerRegistrationId || zeroId)
      .replace(/\{\{organizerVolunteerId\}\}/g, context.organizerVolunteerId || zeroId)
      .replace(/\{\{organizationName\}\}/g, context.organizationName || 'Organization')
      .replace(/\{\{organizerEventTitle\}\}/g, context.organizerEventTitle || 'Event')
      .replace(/\{\{volunteerUserId\}\}/g, context.volunteerUserId || zeroId)
      .replace(/\{\{volunteerRegistrationId\}\}/g, context.volunteerRegistrationId || zeroId)
      .replace(/\{\{volunteerFavoriteEventId\}\}/g, context.volunteerFavoriteEventId || zeroId)
      .replace(/\{\{zeroId\}\}/g, zeroId);
  }
  if (Array.isArray(value)) {
    return value.map(function (item) {
      return resolveBodyPlaceholders(item, context);
    });
  }
  if (value && typeof value === 'object') {
    var out = {};
    Object.keys(value).forEach(function (key) {
      out[key] = resolveBodyPlaceholders(value[key], context);
    });
    return out;
  }
  return value;
}

function extractItemsForValidation(payload, path) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (path.includes('/comments') && Array.isArray(payload)) return payload;
  if (path.includes('/ratings') && Array.isArray(payload.ratings)) return payload.ratings;
  if (Array.isArray(payload.items)) return payload.items;
  return null;
}

function validateResult(test, result) {
  if (!test.minItems || result.status < 200 || result.status >= 300) {
    return { ok: true, reason: '' };
  }

  var payload = tryParseJson(result.body);
  var items = extractItemsForValidation(payload, test.path || '');
  var count = Array.isArray(items) ? items.length : 0;

  if (count >= test.minItems) {
    return { ok: true, reason: '' };
  }

  return {
    ok: false,
    reason: 'minItems=' + test.minItems + ' not met (actual=' + count + ')',
  };
}

function inferAuthRole(testPath) {
  if (String(testPath || '').startsWith('/api/v1/admin/')) return 'admin';
  if (String(testPath || '').startsWith('/api/v1/organizer/')) return 'organizer';
  if (String(testPath || '').startsWith('/api/v1/volunteers/')) return 'volunteer';
  return 'volunteer';
}

function extractCookie(headers) {
  if (headers && typeof headers.getSetCookie === 'function') {
    var setCookies = headers.getSetCookie();
    if (Array.isArray(setCookies) && setCookies.length > 0) {
      return String(setCookies[0]).split(';')[0];
    }
  }

  var rawSetCookie = headers && typeof headers.get === 'function' ? headers.get('set-cookie') : null;
  if (!rawSetCookie) return '';
  return String(rawSetCookie).split(';')[0];
}

async function requestTest(test, runtime) {
  var controller = new AbortController();
  var timer = setTimeout(function () {
    controller.abort();
  }, timeoutMs);

  var headers = {
    Accept: 'application/json',
  };
  var body = null;

  if (test.auth) {
    if (token) {
      headers.Authorization = 'Bearer ' + token;
    } else if (runtime && runtime.sessions) {
      var role = test.authRole || inferAuthRole(test.path);
      var sessionCookie = runtime.sessions[role] ? runtime.sessions[role].cookie : '';
      if (sessionCookie) {
        headers.Cookie = sessionCookie;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(test, 'body')) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(test.body);
  }

  try {
    var response = await fetch(baseUrl + test.path, {
      method: test.method,
      headers: headers,
      body: body,
      signal: controller.signal,
    });

    var body = await response.text();
    return {
      ok: true,
      status: response.status,
      body: body,
      headers: response.headers,
    };
  } catch (error) {
    return {
      ok: false,
      status: -1,
      body: error && error.message ? error.message : String(error),
      headers: null,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function buildContext() {
  var defaultContext = {
    eventId: zeroId,
    organizationId: zeroId,
  };

  var [eventResult, organizationResult] = await Promise.all([
    requestTest({ method: 'GET', path: '/api/v1/events?page=1&pageSize=1', noAuth: [200], withAuth: [200] }, null),
    requestTest({ method: 'GET', path: '/api/v1/organizations?page=1&pageSize=1', noAuth: [200], withAuth: [200] }, null),
  ]);

  if (eventResult.status !== 200 && organizationResult.status !== 200) {
    throw new Error(
      'Unable to resolve smoke context ids. events status=' +
        eventResult.status +
        ', organizations status=' +
        organizationResult.status
    );
  }

  var eventId = defaultContext.eventId;
  if (eventResult.status === 200) {
    var eventPayload = tryParseJson(eventResult.body);
    if (eventPayload && Array.isArray(eventPayload.items) && eventPayload.items[0]) {
      eventId = eventPayload.items[0].id || eventPayload.items[0]._id || zeroId;
    }
  }

  var organizationId = defaultContext.organizationId;
  if (organizationResult.status === 200) {
    var organizationPayload = tryParseJson(organizationResult.body);
    if (organizationPayload && Array.isArray(organizationPayload.items) && organizationPayload.items[0]) {
      organizationId = organizationPayload.items[0].id || organizationPayload.items[0]._id || zeroId;
    }
  }

  return {
    eventId: eventId,
    organizationId: organizationId,
    adminTargetUserId: zeroId,
    adminCategoryId: zeroId,
    organizerEventId: zeroId,
    organizerRegistrationId: zeroId,
    organizerVolunteerId: zeroId,
    organizationName: '',
    organizerEventTitle: '',
    volunteerUserId: zeroId,
    volunteerRegistrationId: zeroId,
    volunteerFavoriteEventId: zeroId,
  };
}

async function requestAsRole(method, path, body, role, runtime) {
  var request = {
    method: method,
    path: path,
    auth: true,
    authRole: role,
  };

  if (body !== undefined && body !== null) {
    request.body = body;
  }

  return requestTest(request, runtime);
}

function requireStatus(result, expectedStatuses, message) {
  if (!expectedStatuses.includes(result.status)) {
    throw new Error(message + ' status=' + result.status + ', body=' + clip(result.body, 240));
  }
}

async function enrichContextWithSeededResources(context, runtime) {
  if (!runtime || !runtime.sessions) {
    return context;
  }

  var claimed = await requestAsRole('POST', '/api/v1/organizer/claim', { organizationId: context.organizationId }, 'organizer', runtime);
  requireStatus(claimed, [200], 'Failed to claim seeded organization for organizer smoke session.');
  var claimedPayload = tryParseJson(claimed.body);
  context.organizationName = claimedPayload && claimedPayload.name ? claimedPayload.name : context.organizationName;

  var organizerEvents = await requestAsRole('GET', '/api/v1/organizer/events?page=1&pageSize=1', null, 'organizer', runtime);
  requireStatus(organizerEvents, [200], 'Failed to load organizer events after claim.');
  var organizerEventsPayload = tryParseJson(organizerEvents.body);
  var organizerEvent = organizerEventsPayload && Array.isArray(organizerEventsPayload.items) ? organizerEventsPayload.items[0] : null;
  context.organizerEventId = organizerEvent && (organizerEvent.id || organizerEvent._id) ? organizerEvent.id || organizerEvent._id : zeroId;
  context.organizerEventTitle = organizerEvent && organizerEvent.title ? organizerEvent.title : context.organizerEventTitle;

  var organizerVolunteers = await requestAsRole('GET', '/api/v1/organizer/volunteers?page=1&pageSize=1', null, 'organizer', runtime);
  requireStatus(organizerVolunteers, [200], 'Failed to load organizer volunteers after claim.');
  var organizerVolunteersPayload = tryParseJson(organizerVolunteers.body);
  var organizerRegistration = organizerVolunteersPayload && Array.isArray(organizerVolunteersPayload.items) ? organizerVolunteersPayload.items[0] : null;
  context.organizerRegistrationId = organizerRegistration && organizerRegistration.id ? organizerRegistration.id : zeroId;
  context.organizerVolunteerId = organizerRegistration && organizerRegistration.volunteer && organizerRegistration.volunteer.id ? organizerRegistration.volunteer.id : zeroId;

  if (context.organizerEventId === zeroId || context.organizerRegistrationId === zeroId || context.organizerVolunteerId === zeroId) {
    throw new Error('Seed data missing organizer event/registration/volunteer records required by smoke test.');
  }

  var adminProfile = await requestAsRole('GET', '/api/v1/profile', null, 'admin', runtime);
  requireStatus(adminProfile, [200], 'Failed to load admin profile for smoke setup.');
  var adminProfilePayload = tryParseJson(adminProfile.body);
  var adminUserId = adminProfilePayload && adminProfilePayload.user && adminProfilePayload.user.id ? adminProfilePayload.user.id : '';

  var adminUsers = await requestAsRole('GET', '/api/v1/admin/users?page=1&pageSize=20', null, 'admin', runtime);
  requireStatus(adminUsers, [200], 'Failed to load admin users for smoke setup.');
  var adminUsersPayload = tryParseJson(adminUsers.body);
  var adminItems = adminUsersPayload && Array.isArray(adminUsersPayload.items) ? adminUsersPayload.items : [];
  var targetUser = adminItems.find(function (item) {
    return item && item.id && item.id !== adminUserId && item.role !== 'Admin';
  }) || adminItems.find(function (item) {
    return item && item.id && item.id !== adminUserId;
  });

  if (!targetUser || !targetUser.id) {
    throw new Error('Unable to resolve an admin target user id for update status/role checks.');
  }
  context.adminTargetUserId = targetUser.id;

  var volunteerProfile = await requestAsRole('GET', '/api/v1/profile', null, 'volunteer', runtime);
  requireStatus(volunteerProfile, [200], 'Failed to load volunteer profile for smoke setup.');
  var volunteerProfilePayload = tryParseJson(volunteerProfile.body);
  var volunteerUserId = volunteerProfilePayload && volunteerProfilePayload.user && volunteerProfilePayload.user.id ? volunteerProfilePayload.user.id : '';
  if (!volunteerUserId) {
    throw new Error('Unable to resolve volunteer user id for volunteer route checks.');
  }
  context.volunteerUserId = volunteerUserId;

  context.volunteerFavoriteEventId = context.eventId;

  return context;
}

function updateContextFromResult(test, result, context) {
  if (result.status < 200 || result.status >= 300) {
    return;
  }

  var payload = tryParseJson(result.body);
  if (!payload) {
    return;
  }

  if (test.routeKey === 'POST /api/v1/admin/categories') {
    var categoryId = payload.id || (payload.item && payload.item.id) || '';
    if (categoryId) {
      context.adminCategoryId = categoryId;
    }
  }

  if (test.routeKey === 'GET /api/v1/volunteers/:userId/registrations') {
    var registrationItems = Array.isArray(payload) ? payload : [];
    var registration = registrationItems[0] || null;
    if (registration && registration.id) {
      context.volunteerRegistrationId = registration.id;
    }
  }

  if (test.routeKey === 'GET /api/v1/volunteers/:userId/favorites') {
    var favoriteItems = Array.isArray(payload) ? payload : [];
    var favorite = favoriteItems[0] || null;
    if (favorite && favorite.id) {
      context.volunteerFavoriteEventId = favorite.id;
    }
  }
}

async function createRoleSession(role) {
  var email = 'smoke.' + role + '.' + Date.now() + '.' + Math.floor(Math.random() * 100000) + '@local.test';
  var registerPayload = {
    email: email,
    fullName: 'Smoke ' + role,
    phone: '0900000000',
    password: 'Smoke12345',
    role: role === 'admin' ? 'Admin' : role === 'organizer' ? 'Organizer' : 'Volunteer',
  };

  var result = await requestTest(
    {
      method: 'POST',
      path: '/api/v1/register',
      body: registerPayload,
      noAuth: [201],
      withAuth: [201],
    },
    null
  );

  if (result.status !== 201) {
    throw new Error('Failed to create smoke auth session for role ' + role + ': status=' + result.status + ', body=' + clip(result.body, 200));
  }

  var cookie = extractCookie(result.headers);
  if (!cookie) {
    throw new Error('No auth cookie returned by register endpoint for role ' + role + '.');
  }

  return {
    role: role,
    email: email,
    cookie: cookie,
  };
}

async function buildSessions() {
  var [admin, organizer, volunteer] = await Promise.all([
    createRoleSession('admin'),
    createRoleSession('organizer'),
    createRoleSession('volunteer'),
  ]);

  return {
    admin: admin,
    organizer: organizer,
    volunteer: volunteer,
  };
}

function deriveDefinedRouteSignatures() {
  var routeFolder = path.join(process.cwd(), 'routes');
  var mountPrefixes = {
    'index.js': '',
    'health.js': '/api/v1',
    'auth.js': '/api/v1',
    'events.js': '/api/v1',
    'organizations.js': '/api/v1',
    'volunteers.js': '/api/v1',
    'payments.js': '/api/v1',
    'moderation.js': '/api/v1',
    'admin.js': '/api/v1',
    'organizer.js': '/api/v1',
    'contact.js': '/api/v1/contact',
  };
  var signatures = new Set();
  var routePattern = /router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/g;

  Object.keys(mountPrefixes).forEach(function (fileName) {
    var filePath = path.join(routeFolder, fileName);
    if (!fs.existsSync(filePath)) return;
    var source = fs.readFileSync(filePath, 'utf8');
    var prefix = mountPrefixes[fileName];
    var match;
    while ((match = routePattern.exec(source)) !== null) {
      var method = String(match[1] || '').toUpperCase();
      var routePath = String(match[2] || '');
      var fullPath = normalizePath((prefix + (routePath === '/' ? '' : routePath)) || '/');
      if (fileName === 'index.js' && routePath === '/') {
        fullPath = '/';
      }
      signatures.add(toRouteKey(method, fullPath));
    }
  });

  return signatures;
}

function assertRouteCoverage() {
  var defined = deriveDefinedRouteSignatures();
  var tested = new Set(
    tests.map(function (test) {
      return test.routeKey ? normalizeRouteKey(test.routeKey) : toRouteKey(test.method, test.path);
    })
  );

  var missing = [];
  defined.forEach(function (signature) {
    if (!tested.has(signature)) {
      missing.push(signature);
    }
  });

  missing.sort();
  return missing;
}

async function run() {
  var failures = 0;
  var expectedErrorPasses = 0;
  var successPasses = 0;
  var startedAt = Date.now();
  var authMode = token ? 'token provided' : 'no token';
  var missingCoverage = assertRouteCoverage();

  if (missingCoverage.length > 0) {
    console.error('Smoke test route coverage is incomplete. Missing route signatures:');
    missingCoverage.forEach(function (signature) {
      console.error('  - ' + signature);
    });
    process.exit(1);
    return;
  }

  var setup = await Promise.all([
    buildContext(),
    token ? Promise.resolve(null) : buildSessions(),
  ]);

  var context = setup[0];
  var runtime = {
    sessions: setup[1],
  };

  context = await enrichContextWithSeededResources(context, runtime);

  console.log('Running smoke test');
  console.log('Base URL: ' + baseUrl);
  console.log('Auth mode: ' + authMode);
  console.log('Timeout: ' + timeoutMs + 'ms');
  console.log('Resolved eventId: ' + context.eventId);
  console.log('Resolved organizationId: ' + context.organizationId);
  if (!token) {
    console.log('Auth sessions created for roles: admin, organizer, volunteer');
  }
  console.log('');

  for (var i = 0; i < tests.length; i += 1) {
    var test = Object.assign({}, tests[i]);
    test.path = resolvePath(test.path, context);
    if (Object.prototype.hasOwnProperty.call(test, 'body')) {
      test.body = resolveBodyPlaceholders(test.body, context);
    }
    var expected = token ? test.withAuth : test.noAuth;
    if (test.auth && !token) {
      expected = test.withAuth;
    }
    var result = await requestTest(test, runtime);
    updateContextFromResult(test, result, context);
    var statusPassed = expected.includes(result.status);
    if (test.auth && result.status === 401) {
      statusPassed = false;
    }
    var contentValidation = validateResult(test, result);
    var disallowedErrorMessage = result.status >= 400 && /not have access|not found/i.test(String(result.body || ''));
    var passed = statusPassed && contentValidation.ok;

    if (passed && disallowedErrorMessage) {
      passed = false;
      contentValidation = {
        ok: false,
        reason: 'response contains disallowed error text (not have access / not found)',
      };
    }

    if (!passed) {
      failures += 1;
    } else if (result.status >= 400) {
      expectedErrorPasses += 1;
    } else {
      successPasses += 1;
    }

    var statusLabel = passed ? (result.status >= 400 ? 'PASS_EXPECTED_ERROR' : 'PASS') : 'FAIL';
    var line = [
      statusLabel,
      test.method,
      test.path,
      'status=' + result.status,
      'expected=' + toExpectedLabel(expected),
      contentValidation.ok ? null : 'validation=' + contentValidation.reason,
      'body=' + clip(result.body, 120),
    ].filter(Boolean).join(' | ');

    process.stdout.write(line + '\n');
  }

  console.log('');
  console.log('Summary: pass=' + (successPasses + expectedErrorPasses) + ', expectedErrors=' + expectedErrorPasses + ', failed=' + failures);
  console.log('Duration: ' + (Date.now() - startedAt) + 'ms');
  if (failures > 0) {
    console.error('Smoke test failed: ' + failures + ' check(s) did not meet expected status codes.');
    process.exit(1);
    return;
  }

  console.log('Smoke test passed: all checks returned expected status codes.');
}

run().catch(function (error) {
  var message = error && error.message ? error.message : String(error);
  console.error('Smoke test failed during setup/runtime: ' + message);
  process.exit(1);
});