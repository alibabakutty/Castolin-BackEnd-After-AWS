import { test, expect } from '@playwright/test';
import { createAPIRequest } from '../fixtures/api';
import { getFirebaseToken } from '../fixtures/firebase-client';

test.describe('Authentication Routes', () => {

  test('Admin login - /login-admin', async () => {
    const request = await createAPIRequest(process.env.BACKEND_URL || 'http://localhost:10000');

    // Login as admin using Firebase email/password
    const token = await getFirebaseToken('admin123@gmail.com', '12345678');
    expect(token).toBeDefined();

    // Fetch admin info with this token
    const response = await request.get('/me-admin', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('USERNAME', 'admin');
    expect(body.data).toHaveProperty('EMAIL', 'admin123@gmail.com');
    expect(body.data).toHaveProperty('ROLE', 'admin');
  });

  test('Distributor login - /me-distributor', async () => {
    const request = await createAPIRequest(process.env.BACKEND_URL || 'http://localhost:10000');

    const token = await getFirebaseToken('accuraweldods@gmail.com', '12345678');
    expect(token).toBeDefined();

    const response = await request.get('/me-distributor', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('CUSTOMER_CODE');
    expect(body.data).toHaveProperty('CUSTOMER_NAME');
  });

});
