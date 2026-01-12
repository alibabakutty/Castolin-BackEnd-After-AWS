import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import OracleService from '../services/oracle.service.js';
import { validateEmail } from '../utils/helpers.js';

const router = express.Router();
const oracleService = OracleService;

// Admin signup
router.post('/signup-admin', verifyToken, async (req, res) => {
  const { username, email, mobile_number } = req.body;
  const firebaseUid = req.uid;

  console.log('Admin signup request:', { username, email, firebaseUid });

  if (!username || !email) {
    return res.status(400).json({
      success: false,
      error: 'Username and email are required',
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
    });
  }

  try {
    // Check if admin already exists
    const checkResult = await oracleService.executeQuery(
      `SELECT * FROM admins WHERE firebase_uid = :1 OR email = :2`,
      [firebaseUid, email],
    );

    if (checkResult.rows.length > 0) {
      const existingAdmin = checkResult.rows[0];
      return res.status(200).json({
        success: true,
        message: 'Admin already exists',
        role: existingAdmin.role,
        userType: 'admin',
      });
    }

    // Insert new admin
    const insertSql = `
      INSERT INTO admins (username, email, firebase_uid, role, mobile_number)
      VALUES (:1, :2, :3, :4, :5)
    `;

    await oracleService.executeQuery(
      insertSql,
      [username, email, firebaseUid, 'admin', mobile_number || null],
      { autoCommit: true },
    );

    res.status(201).json({
      success: true,
      message: 'Admin signup successful',
      userType: 'admin',
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Admin login
router.post('/login-admin', verifyToken, async (req, res) => {
  const firebaseUid = req.uid;

  try {
    const result = await oracleService.executeQuery(
      `SELECT id, username, mobile_number, email, role, firebase_uid 
       FROM admins 
       WHERE firebase_uid = :1`,
      [firebaseUid],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found. Please sign up first.',
      });
    }

    const admin = result.rows[0];
    res.json({
      success: true,
      message: 'Admin login successful',
      user: admin,
      userType: 'admin',
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;