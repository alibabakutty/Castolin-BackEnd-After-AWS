import { test, expect } from '@playwright/test';
import { createAPIRequest } from '../fixtures/api';
import { getFirebaseToken } from '../fixtures/firebase-client';

test.describe('Stock Item Routes', () => {
  let request;
  let adminToken;

  test.beforeAll(async () => {
    request = await createAPIRequest(
      process.env.BACKEND_URL || 'http://localhost:10000'
    );

    // Firebase admin token (matches your backend verifyToken)
    adminToken = await getFirebaseToken(
      'admin123@gmail.com',
      '12345678'
    );

    expect(adminToken).toBeDefined();
  });

  test('GET /stock_item - retrieve all stock items', async () => {
    const response = await request.get('/stock_item', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /stock_item/:item_code - retrieve specific stock item', async () => {
    const response = await request.get('/stock_item/ICBP2001010', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // Allow flexible outcome (prod-safe test)
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('ITEM_CODE');
    }
  });
});
