import { test, expect } from '@playwright/test';
import { createAPIRequest } from '../fixtures/api';
import { getFirebaseToken } from '../fixtures/firebase-client';

test.describe('Customer Routes', () => {
  let request;
  let adminToken;

  test.beforeAll(async () => {
    request = await createAPIRequest(
      process.env.BACKEND_URL || 'http://localhost:10000'
    );

    // Firebase admin login
    adminToken = await getFirebaseToken(
      'admin123@gmail.com',
      '12345678'
    );

    expect(adminToken).toBeDefined();
  });

  test('GET /customer - returns all customers', async () => {
    const response = await request.get('/customer', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('GET /customer/:customer_code - returns specific customer', async () => {
    const response = await request.get('/customer/1100', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('CUSTOMER_CODE', 1100);
    expect(body.data).toHaveProperty('CUSTOMER_NAME');
  });

  test('GET /customer/:customer_code - non-existent customer', async () => {
    const response = await request.get('/customer/999999', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('GET /me-distributor - distributor profile', async () => {
    const distributorToken = await getFirebaseToken(
      'accuraweldods@gmail.com',
      '12345678'
    );

    const response = await request.get('/me-distributor', {
      headers: { Authorization: `Bearer ${distributorToken}` }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('CUSTOMER_CODE');
    expect(body.data).toHaveProperty('CUSTOMER_NAME');
  });
});
