import { test, expect } from '@playwright/test';
import { createAPIRequest } from '../fixtures/api';
import { getFirebaseToken } from '../fixtures/firebase-client';

test.describe('Order Routes', () => {
  let request;
  let adminToken;

  test.beforeAll(async () => {
    request = await createAPIRequest(
      process.env.BACKEND_URL || 'http://localhost:10000'
    );

    adminToken = await getFirebaseToken(
      'admin123@gmail.com',
      '12345678'
    );

    expect(adminToken).toBeDefined();
  });

  test('GET /orders - retrieve all orders', async () => {
    const response = await request.get('/orders', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /orders-by-number/:order_no - get specific order', async () => {
    const orderNo = 'SQ-26-01-26-4739'; // MUST exist in DB

    const response = await request.get(
      `/orders-by-number/${orderNo}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);

    // backend returns ARRAY, not single object
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].ORDER_NO).toBe(orderNo);
  });
});
