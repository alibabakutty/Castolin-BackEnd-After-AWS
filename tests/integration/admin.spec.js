import { test, expect } from '@playwright/test';
import { createAPIRequest } from '../fixtures/api';
import { getFirebaseToken } from '../fixtures/firebase-client'; // helper to get ID token

test.describe('Admin Routes', () => {
  let adminToken;

  test.beforeAll(async () => {
    // Generate a valid Firebase token for your admin UID
    adminToken = await getFirebaseToken('admin123@gmail.com', '12345678');
    expect(adminToken).toBeDefined();
  });

  test('GET /me-admin - get admin info', async () => {
    const request = await createAPIRequest(process.env.BACKEND_URL || 'http://localhost:10000');

    const response = await request.get(`/me-admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('USERNAME', 'admin');
    expect(body.data).toHaveProperty('EMAIL', 'admin123@gmail.com');
    expect(body.data).toHaveProperty('ROLE', 'admin');
    expect(body.data).toHaveProperty('MOBILE_NUMBER');
  });
});
