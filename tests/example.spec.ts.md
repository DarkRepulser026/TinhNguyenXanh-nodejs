import { expect, test } from '@playwright/test';

const volunteerCredentials = {
  email: 'volunteer1@tinhnguyenxanh.local',
  password: 'Volunteer12345',
};

const adminCredentials = {
  email: 'admin1@tinhnguyenxanh.local',
  password: 'Admin12345',
};

async function login(page: any, credentials: { email: string; password: string }, redirect: string) {
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`);
  await page.locator('input[type="email"]').fill(credentials.email);
  await page.locator('input[type="password"]').fill(credentials.password);
  await page.locator('button[type="submit"]').click();
}

test('home page loads and navigates to events', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1:has-text("Kết Nối Xanh")')).toBeVisible();
  await page.getByRole('link', { name: 'Khám phá hoạt động' }).click();
  await expect(page).toHaveURL(/\/events$/);
  await expect(page.locator('h2:has-text("Khám phá hoạt động")')).toBeVisible();
});

test('events page opens event details', async ({ page }) => {
  await page.goto('/events');

  await expect(page.locator('h2:has-text("Khám phá hoạt động")')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Chi tiết' }).first()).toBeVisible();
  await page.getByRole('link', { name: 'Chi tiết' }).first().click();

  await expect(page).toHaveURL(/\/events\/.+/);
  await expect(page.locator('button:has-text("Đăng ký ngay"), button:has-text("Đã đủ chỗ"), button:has-text("Đang chờ duyệt"), button:has-text("Đã đăng ký")')).toBeVisible();
});

test('contact form validates empty submission', async ({ page }) => {
  await page.goto('/contact');

  await page.getByRole('button', { name: 'Gửi Liên Hệ' }).click();

  const nameIsValid = await page.getByPlaceholder('Nhập tên của bạn').evaluate((element) => (element as HTMLInputElement).checkValidity());
  const emailIsValid = await page.getByPlaceholder('email@example.com').evaluate((element) => (element as HTMLInputElement).checkValidity());

  expect(nameIsValid).toBe(false);
  expect(emailIsValid).toBe(false);
});

test('volunteer can log in and reach dashboard', async ({ page }) => {
  await login(page, volunteerCredentials, '/volunteer/dashboard');

  await expect(page).toHaveURL(/\/volunteer\/dashboard$/);
  await expect(page.locator('h2:has-text("Bảng điều khiển")')).toBeVisible();
});

test('admin can log in and open users page', async ({ page }) => {
  await login(page, adminCredentials, '/admin/users');

  await expect(page).toHaveURL(/\/admin\/users$/);
  await expect(page.locator('h1:has-text("Users")')).toBeVisible();
  await expect(page.getByText('Tổng tài khoản')).toBeVisible();
});

test('volunteer is redirected away from admin users page', async ({ page }) => {
  await login(page, volunteerCredentials, '/');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/admin/users');

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1:has-text("Kết Nối Xanh")')).toBeVisible();
});
