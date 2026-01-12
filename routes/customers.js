import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import  OracleService  from '../services/oracle.service.js';

const router = express.Router();
const oracleService = OracleService;

// Get all customers
router.get('/customer', async (req, res) => {
  try {
    const result = await oracleService.executeQuery(
      `SELECT * FROM customer ORDER BY customer_name`,
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows?.length || 0,
    });
  } catch (error) {
    console.error('Customer fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
      details: error.message,
    });
  }
});

// Get specific customer
router.get('/customer/:customer_code', async (req, res) => {
  const { customer_code } = req.params;

  if (!customer_code) {
    return res.status(400).json({
      success: false,
      error: 'Customer code is required',
    });
  }

  try {
    const result = await oracleService.executeQuery(`SELECT * FROM customer WHERE customer_code = :1`, [
      customer_code,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
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

// Get distributors
router.get('/distributors', async (req, res) => {
  try {
    const result = await oracleService.executeQuery(`SELECT * FROM customer WHERE customer_type = 'distributor'`);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows?.length || 0,
    });
  } catch (error) {
    console.error('Distributors fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch distributors',
      details: error.message,
    });
  }
});

// Get specific distributor
router.get('/distributors/:customer_code', async (req, res) => {
  const { customer_code } = req.params;

  if (!customer_code) {
    return res.status(400).json({
      success: false,
      error: 'Distributor usercode is required',
    });
  }

  try {
    const result = await oracleService.executeQuery(`SELECT * FROM customer WHERE customer_code = :1`, [
      customer_code,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Distributor not found',
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

// Get corporates
router.get('/corporates', async (req, res) => {
  try {
    const result = await oracleService.executeQuery(`SELECT * FROM customer WHERE customer_type = 'direct'`);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows?.length || 0,
    });
  } catch (error) {
    console.error('Corporates fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch corporates',
      details: error.message,
    });
  }
});

// Get specific corporate
router.get('/corporates/:customer_code', async (req, res) => {
  const { customer_code } = req.params;

  if (!customer_code) {
    return res.status(400).json({
      success: false,
      error: 'Customer Code is required!',
    });
  }

  try {
    const result = await oracleService.executeQuery(`SELECT * FROM customer WHERE customer_code = :1`, [
      customer_code,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Corporate not found',
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

// Update distributor
router.put('/distributors/:customer_code', async (req, res) => {
  const customerCode = req.params.customer_code;
  const updates = req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No update data provided',
    });
  }

  const allowedFields = [
    'customer_name',
    'mobile_number',
    'email',
    'customer_type',
    'password',
    'role',
    'status',
    'firebase_uid',
  ];

  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  if (Object.keys(filteredUpdates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No valid fields to update',
    });
  }

  const setClause = Object.keys(filteredUpdates)
    .map((key, index) => `${key} = :${index + 1}`)
    .join(', ');

  const values = Object.values(filteredUpdates);
  values.push(customerCode);

  const sql = `UPDATE customer SET ${setClause} WHERE customer_code = :${values.length}`;

  try {
    const result = await oracleService.executeQuery(sql, values, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Distributor not found',
      });
    }

    res.json({
      success: true,
      message: 'Distributor updated successfully',
      affectedRows: result.rowsAffected,
    });
  } catch (error) {
    console.error('Update distributor error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message,
    });
  }
});

// Update corporate
router.put('/corporates/:customer_code', async (req, res) => {
  const customerCode = req.params.customer_code;
  const updates = req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No update data provided',
    });
  }

  const allowedFields = [
    'customer_name',
    'mobile_number',
    'email',
    'customer_type',
    'password',
    'role',
    'status',
    'firebase_uid',
  ];

  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  if (Object.keys(filteredUpdates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No valid fields to update',
    });
  }

  const setClause = Object.keys(filteredUpdates)
    .map((key, index) => `${key} = :${index + 1}`)
    .join(', ');

  const values = Object.values(filteredUpdates);
  values.push(customerCode);

  const sql = `UPDATE customer SET ${setClause} WHERE customer_code = :${values.length}`;

  try {
    const result = await oracleService.executeQuery(sql, values, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Corporate not found',
      });
    }

    res.json({
      success: true,
      message: 'Corporate updated successfully',
      affectedRows: result.rowsAffected,
    });
  } catch (error) {
    console.error('Update corporate error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message,
    });
  }
});

// User profiles
router.get('/me-distributor', verifyToken, async (req, res) => {
  try {
    const result = await oracleService.executeQuery(
      `SELECT customer_code, customer_name, role, state 
       FROM customer 
       WHERE firebase_uid = :1`,
      [req.uid],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Distributor not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Distributor profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message,
    });
  }
});

router.get('/me-corporate', verifyToken, async (req, res) => {
  try {
    const result = await oracleService.executeQuery(
      `SELECT customer_code, customer_name, role, state 
       FROM customer 
       WHERE firebase_uid = :1`,
      [req.uid],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Corporate not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Corporate profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message,
    });
  }
});

export default router;