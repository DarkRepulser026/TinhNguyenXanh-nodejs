var routes = [
  '/',
  '/events',
  '/events/:id',
  '/dashboard',
  '/favorites',
  '/registrations',
  '/profile',
  '/settings',
  '/admin',
  '/admin/approvals',
  '/admin/moderation',
  '/admin/users',
  '/admin/categories',
  '/organizer',
  '/organizer/events',
  '/organizer/organization',
  '/organizer/volunteers',
  '/organizations',
  '/organizations/:id',
  '/organizations/register',
  '/organizations/success',
  '/about',
  '/contact',
  '/search',
  '/donate',
  '/payment-result',
  '/privacy',
  '/events/register',
  '/login',
  '/register'
];

var routeList = document.getElementById('routeList');
var healthBtn = document.getElementById('healthBtn');
var meBtn = document.getElementById('meBtn');
var loginForm = document.getElementById('loginForm');
var healthOutput = document.getElementById('healthOutput');
var authOutput = document.getElementById('authOutput');

routes.forEach(function (route) {
  var li = document.createElement('li');
  li.textContent = route;
  routeList.appendChild(li);
});

healthBtn.addEventListener('click', async function () {
  try {
    var response = await fetch('/api/v1/health', { credentials: 'include' });
    var data = await response.json();
    healthOutput.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    healthOutput.textContent = String(error);
  }
});

loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  try {
    var response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      })
    });

    var data = await response.json();
    authOutput.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    authOutput.textContent = String(error);
  }
});

meBtn.addEventListener('click', async function () {
  try {
    var response = await fetch('/api/v1/auth/me', { credentials: 'include' });
    var data = await response.json();
    authOutput.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    authOutput.textContent = String(error);
  }
});
