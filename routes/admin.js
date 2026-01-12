import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import  OracleService  from '../services/oracle.service.js';

const router = express.Router();
const oracleService = OracleService;

// Admin profile
router.get('/me-admin', verifyToken, async (req, res) => {
  try {
    const result = await oracleService.executeQuery(
      `SELECT id, username, email, role, mobile_number
       FROM admins
       WHERE firebase_uid = :1`,
      [req.uid],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Admin profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message,
    });
  }
});

// Alternative version
router.get('/me-admin-alt', verifyToken, async (req, res) => {
  try {
    const result = await oracleService.executeQuery(
      `SELECT id, username, email, role, mobile_number
       FROM admins
       WHERE firebase_uid = :uid`,
      { uid: req.uid },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Admin profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message,
    });
  }
});

// Get all admins
router.get('/admins', async (req, res) => {
  try {
    const result = await oracleService.executeQuery('SELECT * FROM admins');

    res.json({
      success: true,
      data: result.rows,
      count: result.rows?.length || 0,
    });
  } catch (error) {
    console.error('Admins fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admins',
      details: error.message,
    });
  }
});

// Get specific admin
router.get('/admins/:id', async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'Admin ID is required',
    });
  }

  try {
    const result = await oracleService.executeQuery(`SELECT * FROM admins WHERE id = :1`, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found',
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

export default router;