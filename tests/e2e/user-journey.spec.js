// tests/e2e/user-journey.spec.js
import { test, expect } from '@playwright/test';
import { createAPIRequest } from '../fixtures/api.js';
import { getFirebaseToken } from '../fixtures/firebase-client.js';
import { toOracleDate } from '../../utils/helpers.js';

test.describe('Complete User Journey', () => {
  test('Distributor places order journey', async () => {
    const request = await createAPIRequest(process.env.BACKEND_URL || 'http://localhost:10000');

    // Get Firebase ID token
    const token = await getFirebaseToken('accuraweldods@gmail.com', '12345678');
    expect(token).toBeTruthy();
    const authHeaders = { Authorization: `Bearer ${token}` };

    // Get distributor info
    const distributorResponse = await request.get('/me-distributor', { headers: authHeaders });
    expect(distributorResponse.status()).toBe(200);
    const distributorBody = await distributorResponse.json();
    const customerCode = distributorBody.data?.CUSTOMER_CODE;
    expect(customerCode).toBeTruthy();

    // Get stock items
    const stockResponse = await request.get('/stock_item', { headers: authHeaders });
    expect(stockResponse.status()).toBe(200);
    const stockBody = await stockResponse.json();
    const firstItem = stockBody.data?.[0];
    expect(firstItem).toBeTruthy();

    // Generate unique order number
    const timestamp = Date.now();
    const orderNo = `SQ-E2E-${timestamp}`;

    // Dates in YYYY-MM-DD format
    const now = toOracleDate(new Date());

    const payload = [
      {
        voucher_type: 'Distributor Order-Web Based',
        order_no: orderNo,
        date: now,
        delivery_date: now,
        status: 'pending',
        executiveCode: distributorBody.data.CUSTOMER_CODE,
        executive: distributorBody.data.CUSTOMER_NAME,
        role: 'distributor',
        customer_code: customerCode,
        customer_name: distributorBody.data.CUSTOMER_NAME,
        item_code: firstItem.ITEM_CODE,
        item_name: firstItem.STOCK_ITEM_NAME,
        hsn: firstItem.HSN || '',
        gst: Number(firstItem.GST || 18),
        sgst: Number(firstItem.SGST || 0),
        cgst: Number(firstItem.CGST || 0),
        igst: Number(firstItem.IGST || 0),
        delivery_mode: 'FLIGHT',
        transporter_name: firstItem.TRANSPORTER_NAME || '',
        quantity: Number(firstItem.QUANTITY || 5),
        uom: firstItem.UOM || 'Nos',
        rate: Number(firstItem.RATE || 1),
        amount: Number(firstItem.RATE || 1) * 5,
        net_rate: Number(firstItem.RATE || 1),
        gross_amount: Number(firstItem.RATE || 1) * 5,
        disc_percentage: 0,
        disc_amount: 0,
        spl_disc_percentage: 0,
        spl_disc_amount: 0,
        total_quantity: Number(firstItem.QUANTITY || 5),
        total_amount_without_tax: Number(firstItem.RATE || 1) * 5,
        total_cgst_amount: 0,
        total_sgst_amount: 0,
        total_igst_amount: 0,
        total_amount: Number(firstItem.RATE || 1) * 5,
        remarks: 'E2E Test Order',
      }
    ];

    // Submit order
    const orderResponse = await request.post('/orders', { headers: authHeaders, data: payload });
    expect(orderResponse.status()).toBe(200);
    const orderBody = await orderResponse.json();
    expect(orderBody.success).toBe(true);

    // Fetch the order using ORDER_NO
    const orderStatusResponse = await request.get(`/orders-by-number/${orderNo}`, { headers: authHeaders });
    expect(orderStatusResponse.status()).toBe(200);
    const orderStatusBody = await orderStatusResponse.json();
    const orderData = Array.isArray(orderStatusBody.data)
      ? orderStatusBody.data.find(o => o.ORDER_NO === orderNo)
      : orderStatusBody.data;

    expect(orderData).toBeTruthy();
    expect(orderData.STATUS).toBe('pending');

    // Check order history
    const historyResponse = await request.get(`/orders-by-number/${orderNo}`, { headers: authHeaders });
    expect(historyResponse.status()).toBe(200);
    const historyBody = await historyResponse.json();
    const historyData = Array.isArray(historyBody.data) ? historyBody.data : [historyBody.data];
    expect(historyData.some(o => o.ORDER_NO === orderNo)).toBe(true);

    await request.dispose();
  });
});
