#!/usr/bin/env node

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
  console.log('  --expect-auth  Comma-separated expected codes for protected routes with token (default: 200,403)');
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
var expectedProtectedWithToken = parseList(getArgValue('--expect-auth') || '200,403');

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
];

async function requestTest(test) {
  var controller = new AbortController();
  var timer = setTimeout(function () {
    controller.abort();
  }, timeoutMs);

  var headers = {
    Accept: 'application/json',
  };

  if (token && test.auth) {
    headers.Authorization = 'Bearer ' + token;
  }

  try {
    var response = await fetch(baseUrl + test.path, {
      method: test.method,
      headers: headers,
      signal: controller.signal,
    });

    var body = await response.text();
    return {
      ok: true,
      status: response.status,
      body: body,
    };
  } catch (error) {
    return {
      ok: false,
      status: -1,
      body: error && error.message ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  var failures = 0;
  var authMode = token ? 'token provided' : 'no token';

  console.log('Running smoke test');
  console.log('Base URL: ' + baseUrl);
  console.log('Auth mode: ' + authMode);
  console.log('Timeout: ' + timeoutMs + 'ms');
  console.log('');

  for (var i = 0; i < tests.length; i += 1) {
    var test = tests[i];
    var expected = token ? test.withAuth : test.noAuth;
    var result = await requestTest(test);
    var passed = expected.includes(result.status);

    if (!passed) {
      failures += 1;
    }

    var statusLabel = passed ? 'PASS' : 'FAIL';
    var line = [
      statusLabel,
      test.method,
      test.path,
      'status=' + result.status,
      'expected=' + toExpectedLabel(expected),
      'body=' + clip(result.body, 120),
    ].join(' | ');

    console.log(line);
  }

  console.log('');
  if (failures > 0) {
    console.error('Smoke test failed: ' + failures + ' check(s) did not meet expected status codes.');
    process.exit(1);
    return;
  }

  console.log('Smoke test passed: all checks returned expected status codes.');
}

run();