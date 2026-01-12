import express from 'express';
import  OracleService  from '../services/oracle.service.js';
import { toOracleDate, generateOrderNumber } from '../utils/helpers.js';

const router = express.Router();
const oracleService = OracleService;

// Get all orders
router.get('/', async (req, res) => {
  try {
    const result = await oracleService.executeQuery('SELECT * FROM orders');

    res.json({
      success: true,
      data: result.rows,
      count: result.rows?.length || 0,
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      details: error.message,
    });
  }
});

// Get specific order
router.get('/:id', async (req, res) => {
  const orderId = req.params.id;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      error: 'Order ID is required',
    });
  }

  try {
    const result = await oracleService.executeQuery(`SELECT * FROM orders WHERE id = :1`, [orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get orders by order number
router.get('/number/:order_no', async (req, res) => {
  const { order_no } = req.params;
  const { created_at } = req.query; // optional filter

  if (!order_no) {
    return res.status(400).json({
      success: false,
      error: 'Order Number is required',
    });
  }

  let sql = 'SELECT * FROM orders WHERE order_no = :1';
  const params = [order_no];

  if (created_at) {
    sql += ' AND created_at = :2';
    params.push(created_at);
  }

  try {
    const result = await oracleService.executeQuery(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No orders found',
      });
    }

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get next order number
router.get('/next-order-number', async (req, res) => {
  try {
    const result = await oracleService.executeQuery(
      `SELECT order_no FROM orders 
       WHERE order_no LIKE 'SQ-%' 
       ORDER BY created_at DESC FETCH FIRST 1 ROWS ONLY`,
    );

    const latestOrderNo = result.rows.length > 0 ? result.rows[0].order_no : null;
    const orderNumber = generateOrderNumber(latestOrderNo);

    res.json({
      success: true,
      orderNumber,
    });
  } catch (error) {
    console.error('Next order number error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create orders (batch insert)
router.post('/', async (req, res) => {
  const data = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No orders provided',
    });
  }

  const operations = data.map(item => ({
    sql: `
      INSERT INTO orders 
      (voucher_type, order_no, order_date, status, customer_code, executive, role, 
       customer_name, item_code, item_name, hsn, gst, sgst, cgst, igst, delivery_date, 
       delivery_mode, transporter_name, quantity, uom, rate, amount, net_rate, gross_amount, 
       disc_percentage, disc_amount, spl_disc_percentage, spl_disc_amount, total_quantity, 
       total_amount_without_tax, total_cgst_amount, total_sgst_amount, total_igst_amount, 
       total_amount, remarks) 
      VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, 
              :14, :15, TO_DATE(:16, 'YYYY-MM-DD'), :17, :18, :19, :20, :21, :22, :23, :24, 
              :25, :26, :27, :28, :29, :30, :31, :32, :33, :34, :35)`,
    binds: [
      item.voucher_type,
      item.order_no,
      item.date,
      item.status,
      item.customer_code,
      item.executive,
      item.role,
      item.customer_name,
      item.item_code,
      item.item_name,
      item.hsn,
      String(item.gst).replace(/\s*%/, ''),
      item.sgst,
      item.cgst,
      item.igst,
      item.delivery_date,
      item.delivery_mode,
      item.transporter_name,
      item.quantity,
      item.uom,
      item.rate,
      item.amount,
      item.net_rate,
      item.gross_amount,
      item.disc_percentage,
      item.disc_amount,
      item.spl_disc_percentage,
      item.spl_disc_amount,
      item.total_quantity ?? 0.0,
      item.total_amount_without_tax ?? 0.0,
      item.total_cgst_amount ?? 0.0,
      item.total_sgst_amount ?? 0.0,
      item.total_igst_amount ?? 0.0,
      item.total_amount ?? 0.0,
      item.remarks ?? '',
    ]
  }));

  try {
    await oracleService.executeTransaction(operations);
    res.json({
      success: true,
      message: 'Orders inserted successfully',
      insertedCount: data.length,
    });
  } catch (error) {
    console.error('Insert orders error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update orders by order number
router.put('/number/:order_no', async (req, res) => {
  const { order_no } = req.params;
  const allItems = [...req.body].sort((a, b) => (a.id || 0) - (b.id || 0));

  if (!order_no?.trim()) {
    return res.status(400).json({ success: false, error: 'Order Number is required' });
  }

  if (!Array.isArray(allItems) || allItems.length === 0) {
    return res.status(400).json({ success: false, error: 'No data provided' });
  }

  const itemsToInsert = allItems.filter(i => !i.id && !i._deleted);
  const itemsToUpdate = allItems.filter(i => i.id && !i._deleted);
  const itemsToDelete = allItems.filter(i => i.id && i._deleted);

  try {
    const operations = [];

    // Delete operations
    if (itemsToDelete.length) {
      const ids = itemsToDelete.map(i => i.id);
      const binds = ids.map((_, i) => `:${i + 1}`).join(',');
      operations.push({
        sql: `DELETE FROM orders WHERE id IN (${binds}) AND order_no = :${ids.length + 1}`,
        binds: [...ids, order_no]
      });
    }

    // Update operations
    const allowedFields = [
      'status','disc_percentage','disc_amount','spl_disc_percentage','spl_disc_amount',
      'net_rate','gross_amount','quantity','gst','sgst','cgst','igst',
      'hsn','rate','amount','uom','item_code','item_name',
      'delivery_date','delivery_mode','transporter_name',
      'total_quantity','total_amount','total_amount_without_tax',
      'total_sgst_amount','total_cgst_amount','total_igst_amount',
      'remarks','order_date'
    ];

    for (const row of itemsToUpdate) {
      const { id, _deleted, ...fields } = row;
      const filtered = Object.fromEntries(
        Object.entries(fields).filter(([k]) => allowedFields.includes(k))
      );

      if (!Object.keys(filtered).length) continue;

      const keys = Object.keys(filtered);
      const setClause = keys.map((k, i) => `${k} = :${i + 1}`).join(', ');
      const values = keys.map(k => {
        if (k === 'order_date' || k === 'delivery_date') {
          return toOracleDate(filtered[k]);
        }
        return filtered[k];
      });
      values.push(id, order_no);

      operations.push({
        sql: `UPDATE orders SET ${setClause} WHERE id = :${values.length - 1} AND order_no = :${values.length}`,
        binds: values
      });
    }

    // Insert operations
    for (const item of itemsToInsert) {
      const insertData = {
        order_no,
        voucher_type: item.voucher_type || 'Distributor Order-Web Based',
        order_date: toOracleDate(item.order_date) || new Date(),
        customer_code: item.customer_code || '',
        customer_name: item.customer_name || '',
        executive: item.executive || '',
        role: item.role || 'distributor',
        status: item.status || 'pending',
        item_code: item.item_code || '',
        item_name: item.item_name || '',
        hsn: item.hsn || '',
        gst: item.gst || 0,
        sgst: item.sgst || 0,
        cgst: item.cgst || 0,
        igst: item.igst || 0,
        delivery_date: toOracleDate(item.delivery_date),
        delivery_mode: item.delivery_mode || '',
        transporter_name: item.transporter_name || '',
        quantity: item.quantity || 0,
        uom: item.uom || '',
        rate: item.rate || 0,
        amount: item.amount || 0,
        net_rate: item.net_rate || 0,
        gross_amount: item.gross_amount || 0,
        disc_percentage: item.disc_percentage || 0,
        disc_amount: item.disc_amount || 0,
        spl_disc_percentage: item.spl_disc_percentage || 0,
        spl_disc_amount: item.spl_disc_amount || 0,
        total_quantity: item.total_quantity || 0,
        total_amount: item.total_amount || 0,
        total_amount_without_tax: item.total_amount_without_tax || 0,
        total_sgst_amount: item.total_sgst_amount || 0,
        total_cgst_amount: item.total_cgst_amount || 0,
        total_igst_amount: item.total_igst_amount || 0,
        remarks: item.remarks || ''
      };

      const cols = Object.keys(insertData);
      const vals = Object.values(insertData);
      const binds = cols.map((_, i) => `:${i + 1}`).join(',');

      operations.push({
        sql: `INSERT INTO orders (${cols.join(',')}) VALUES (${binds})`,
        binds: vals
      });
    }

    await oracleService.executeTransaction(operations);

    // Get updated orders
    const result = await oracleService.executeQuery(
      'SELECT * FROM orders WHERE order_no = :1 ORDER BY id',
      [order_no]
    );

    res.json({
      success: true,
      data: result.rows,
      operations: {
        inserted: itemsToInsert.length,
        updated: itemsToUpdate.length,
        deleted: itemsToDelete.length
      }
    });

  } catch (error) {
    console.error('❌ Transaction failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;