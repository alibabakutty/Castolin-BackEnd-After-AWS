import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import oracledb from 'oracledb';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
/* -------------------------------------------------------
   BASIC SETUP
------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

/* -------------------------------------------------------
   CORS
------------------------------------------------------- */
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', process.env.CLIENT_URL];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS blocked'));
    },
    credentials: true,
  }),
);

/* -------------------------------------------------------
   ORACLE CONFIGURATION
------------------------------------------------------- */
oracledb.initOracleClient({
  libDir:
    process.env.ORACLE_CLIENT_PATH ||
    'E:\\Castoline_Project With Oracle-Host\\Castolin-BackEnd-Oracle-Host\\instantclient_21_19',
  configDir:
    process.env.ORACLE_WALLET_PATH ||
    'E:\\Castoline_Project With Oracle-Host\\Castolin-BackEnd-Oracle-Host\\Wallet_MYFREEDB',
});

oracledb.poolMax = process.env.DB_POOL_MAX || 10;
oracledb.poolMin = process.env.DB_POOL_MIN || 2;
oracledb.poolIncrement = process.env.DB_POOL_INCREMENT || 2;
oracledb.poolTimeout = process.env.DB_POOL_TIMEOUT || 600;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool;

/* -------------------------------------------------------
   FIREBASE INIT
------------------------------------------------------- */
function initFirebase() {
  try {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!base64) {
      console.warn('⚠️ Firebase service account missing - Firebase features disabled');
      return;
    }

    const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(json),
      });
    }

    console.log('✅ Firebase initialized');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error.message);
  }
}

/* -------------------------------------------------------
   ORACLE POOL INITIALIZATION
------------------------------------------------------- */
async function initOracle() {
  try {
    console.log('🔄 Initializing Oracle connection pool...');

    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      ssl: {
        ssl: true,
        wallet: {
          directory:
            process.env.ORACLE_WALLET_PATH ||
            'E:\\Castoline_Project With Oracle-Host\\Castolin-BackEnd-Oracle-Host\\Wallet_MYFREEDB',
        },
      },
      poolMin: parseInt(process.env.DB_POOL_MIN) || 2,
      poolMax: parseInt(process.env.DB_POOL_MAX) || 10,
      poolIncrement: parseInt(process.env.DB_POOL_INCREMENT) || 2,
      poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT) || 600,
    });

    // Test connection
    let connection;
    try {
      connection = await pool.getConnection();
      const result = await connection.execute(
        `SELECT USER AS CURRENT_USER, SYSDATE AS SERVER_TIME FROM dual`,
      );
      console.log('✅ Oracle connected successfully');
      console.log('   User:', result.rows[0].CURRENT_USER);
      console.log('   Server Time:', result.rows[0].SERVER_TIME);
    } finally {
      if (connection) {
        await connection.close();
      }
    }

    console.log('✅ Oracle connection pool created successfully');
    return pool;
  } catch (error) {
    console.error('❌ Error creating Oracle connection pool:', error);
    throw error;
  }
}

/* -------------------------------------------------------
   AUTH MIDDLEWARE
------------------------------------------------------- */
async function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = auth.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/* -------------------------------------------------------
   HELPER FUNCTIONS - UPDATED WITH PROPER BIND PARAMS
------------------------------------------------------- */
async function executeQuery(query, bindParams = {}, options = {}) {
  let connection;
  try {
    connection = await pool.getConnection();

    // Convert object bind params to array if needed
    // Oracle accepts either array or object for bind parameters
    const result = await connection.execute(query, bindParams, {
      autoCommit: false,
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...options,
    });

    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    console.error('Query:', query);
    console.error('Bind Params:', bindParams);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
}

async function closePool() {
  try {
    if (pool) {
      await pool.close();
      console.log('✅ Connection pool closed successfully');
    }
  } catch (error) {
    console.error('Error closing pool', error);
    throw error;
  }
}

/* -------------------------------------------------------
   HEALTH CHECK
------------------------------------------------------- */
app.get('/api/health', async (req, res) => {
  try {
    let oracleStatus = 'Disconnected';
    if (pool) {
      let conn;
      try {
        conn = await pool.getConnection();
        await conn.execute('SELECT 1 FROM dual');
        oracleStatus = 'Connected';
        await conn.close();
      } catch (error) {
        oracleStatus = 'Connection Error';
      }
    }

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      oracle: oracleStatus,
      pool: pool ? 'Active' : 'Not initialized',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
    });
  }
});

/* -------------------------------------------------------
   TEST ENDPOINT (For debugging)
------------------------------------------------------- */
app.get('/api/test-query', async (req, res) => {
  try {
    // Test with simple query first
    const result = await executeQuery(
      "SELECT 'Hello World' as message, SYSDATE as current_date FROM dual",
      {}, // Empty bind params
    );

    res.json({
      success: true,
      data: result.rows,
      meta: {
        rowsAffected: result.rowsAffected,
        rowsReturned: result.rows?.length || 0,
      },
    });
  } catch (error) {
    console.error('Test query error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.errorNum || error.code,
    });
  }
});

/* -------------------------------------------------------
   ADMIN PROFILE - FIXED
------------------------------------------------------- */
app.get('/me-admin', verifyToken, async (req, res) => {
  try {
    // FIX: Pass bind parameters as an array or properly formatted object
    const result = await executeQuery(
      `SELECT id, username, email, role, mobile_number
       FROM admins
       WHERE firebase_uid = :1`, // Use :1 for positional binding
      [req.uid], // Pass as array
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

/* -------------------------------------------------------
   CUSTOMERS - FIXED
------------------------------------------------------- */
app.get('/customer', async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT * FROM customer ORDER BY customer_name`,
      {}, // No bind parameters needed
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

/* -------------------------------------------------------
   ALTERNATIVE VERSION WITH NAMED BIND PARAMETERS
------------------------------------------------------- */
app.get('/me-admin-alt', verifyToken, async (req, res) => {
  try {
    // Alternative: Using named bind parameters with proper object
    const result = await executeQuery(
      `SELECT id, username, email, role, mobile_number
       FROM admins
       WHERE firebase_uid = :uid`,
      { uid: { val: req.uid, dir: oracledb.BIND_IN, type: oracledb.STRING } },
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

/* -------------------------------------------------------
   SIMPLIFIED VERSION (Easiest to debug)
------------------------------------------------------- */
app.get('/me-admin-simple', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Direct approach - easier to debug
    const result = await connection.execute(
      `SELECT id, username, email, role, mobile_number
       FROM admins
       WHERE firebase_uid = :uid`,
      { uid: req.uid },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Admin profile error (direct):', error);
    res.status(500).json({
      error: 'Database error',
      details: error.message,
      code: error.errorNum,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

/* -------------------------------------------------------
   DISTRIBUTOR PROFILE
------------------------------------------------------- */
app.get('/me-distributor', verifyToken, async (req, res) => {
  try {
    const result = await executeQuery(
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

/* -------------------------------------------------------
   CORPORATE PROFILE
------------------------------------------------------- */
app.get('/me-corporate', verifyToken, async (req, res) => {
  try {
    const result = await executeQuery(
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

/* -------------------------------------------------------
   UPDATE DISTRIBUTOR
------------------------------------------------------- */
app.put('/distributors/:customer_code', async (req, res) => {
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
    const result = await executeQuery(sql, values);

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

/* -------------------------------------------------------
   UPDATE CORPORATE
------------------------------------------------------- */
app.put('/corporates/:customer_code', async (req, res) => {
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
    const result = await executeQuery(sql, values);

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

/* -------------------------------------------------------
   ADMIN SIGNUP
------------------------------------------------------- */
app.post('/signup-admin', verifyToken, async (req, res) => {
  const { username, email, mobile_number } = req.body;
  const firebaseUid = req.uid;

  console.log('Admin signup request:', { username, email, firebaseUid });

  if (!username || !email) {
    return res.status(400).json({
      success: false,
      error: 'Username and email are required',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
    });
  }

  try {
    // Check if admin already exists
    const checkResult = await executeQuery(
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
      RETURNING id INTO :6
    `;

    const role = 'admin';
    const outBind = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT };

    const result = await executeQuery(
      insertSql,
      [username, email, firebaseUid, role, mobile_number || null, outBind],
      { autoCommit: true },
    );

    const newId = result.outBinds[0][0];
    console.log('New admin added to Oracle, ID:', newId);

    res.status(201).json({
      success: true,
      message: 'Admin signup successful',
      role,
      userType: 'admin',
      userId: newId,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* -------------------------------------------------------
   ADMIN LOGIN
------------------------------------------------------- */
app.post('/login-admin', verifyToken, async (req, res) => {
  const firebaseUid = req.uid;

  try {
    const result = await executeQuery(
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

/* -------------------------------------------------------
   GET SPECIFIC DISTRIBUTOR
------------------------------------------------------- */
app.get('/distributors/:customer_code', async (req, res) => {
  const { customer_code } = req.params;

  if (!customer_code) {
    return res.status(400).json({
      success: false,
      error: 'Distributor usercode is required',
    });
  }

  try {
    const result = await executeQuery(`SELECT * FROM customer WHERE customer_code = :1`, [
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

/* -------------------------------------------------------
   GET SPECIFIC CORPORATE
------------------------------------------------------- */
app.get('/corporates/:customer_code', async (req, res) => {
  const { customer_code } = req.params;

  if (!customer_code) {
    return res.status(400).json({
      success: false,
      error: 'Customer Code is required!',
    });
  }

  try {
    const result = await executeQuery(`SELECT * FROM customer WHERE customer_code = :1`, [
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

/* -------------------------------------------------------
   STOCK ITEMS
------------------------------------------------------- */
app.get('/stock_item', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM stock_item');

    res.json({
      success: true,
      data: result.rows,
      count: result.rows?.length || 0,
    });
  } catch (error) {
    console.error('Stock item fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock items',
      details: error.message,
    });
  }
});

/* -------------------------------------------------------
   ADMINS LIST
------------------------------------------------------- */
app.get('/admins', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM admins');

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

/* -------------------------------------------------------
   DISTRIBUTORS LIST
------------------------------------------------------- */
app.get('/distributors', async (req, res) => {
  try {
    const result = await executeQuery(`SELECT * FROM customer WHERE customer_type = 'distributor'`);

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

/* -------------------------------------------------------
   CORPORATES LIST
------------------------------------------------------- */
app.get('/corporates', async (req, res) => {
  try {
    const result = await executeQuery(`SELECT * FROM customer WHERE customer_type = 'direct'`);

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

/* -------------------------------------------------------
   ORDERS LIST
------------------------------------------------------- */
app.get('/orders', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM orders');

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

/* -------------------------------------------------------
   GET SPECIFIC STOCK ITEM
------------------------------------------------------- */
app.get('/stock_item/:item_code', async (req, res) => {
  const { item_code } = req.params;

  if (!item_code) {
    return res.status(400).json({
      success: false,
      error: 'Stock Item Code is required',
    });
  }

  try {
    const result = await executeQuery(`SELECT * FROM stock_item WHERE item_code = :1`, [item_code]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Stock item not found',
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

/* -------------------------------------------------------
   GET SPECIFIC CUSTOMER
------------------------------------------------------- */
app.get('/customer/:customer_code', async (req, res) => {
  const { customer_code } = req.params;

  if (!customer_code) {
    return res.status(400).json({
      success: false,
      error: 'Customer code is required',
    });
  }

  try {
    const result = await executeQuery(`SELECT * FROM customer WHERE customer_code = :1`, [
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

/* -------------------------------------------------------
   GET SPECIFIC ADMIN
------------------------------------------------------- */
app.get('/admins/:id', async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'Admin ID is required',
    });
  }

  try {
    const result = await executeQuery(`SELECT * FROM admins WHERE id = :1`, [userId]);

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

/* -------------------------------------------------------
   GET SPECIFIC ORDER
------------------------------------------------------- */
app.get('/orders/:id', async (req, res) => {
  const orderId = req.params.id;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      error: 'Order ID is required',
    });
  }

  try {
    const result = await executeQuery(`SELECT * FROM orders WHERE id = :1`, [orderId]);

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

/* -------------------------------------------------------
   GET ORDERS BY ORDER NUMBER
------------------------------------------------------- */
app.get('/orders-by-number/:order_no', async (req, res) => {
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

  // Optional created_at filter
  if (created_at) {
    sql += ' AND created_at = :2';
    params.push(created_at);
  }

  try {
    const result = await executeQuery(sql, params);

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

/* -------------------------------------------------------
   GET NEXT ORDER NUMBER
------------------------------------------------------- */
app.get('/api/orders/next-order-number', async (req, res) => {
  try {
    // Get the latest order number from database
    const result = await executeQuery(
      `SELECT order_no FROM orders 
       WHERE order_no LIKE 'SQ-%' 
       ORDER BY created_at DESC FETCH FIRST 1 ROWS ONLY`,
    );

    let nextSequence = '0001';
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString().slice(-2);

    if (result.rows.length > 0 && result.rows[0].order_no) {
      const orderNo = result.rows[0].order_no;
      const parts = orderNo.split('-');

      if (parts.length >= 5) {
        const lastDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
        const currentDate = `${day}-${month}-${year}`;

        if (lastDate === currentDate) {
          const lastSequence = parseInt(parts[4]) || 0;
          nextSequence = (lastSequence + 1).toString().padStart(4, '0');
        }
      }
    }

    res.json({
      success: true,
      orderNumber: `SQ-${day}-${month}-${year}-${nextSequence}`,
    });
  } catch (error) {
    console.error('Next order number error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* -------------------------------------------------------
   CREATE ORDERS (BATCH INSERT)
------------------------------------------------------- */
app.post('/orders', async (req, res) => {
  const data = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No orders provided',
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    // await connection.execute('BEGIN');

    const insertedIds = [];

    for (const item of data) {
      const insertSql = `
  INSERT INTO orders 
  (voucher_type, order_no, order_date, status, customer_code, executive, role, 
   customer_name, item_code, item_name, hsn, gst, sgst, cgst, igst, delivery_date, 
   delivery_mode, transporter_name, quantity, uom, rate, amount, net_rate, gross_amount, 
   disc_percentage, disc_amount, spl_disc_percentage, spl_disc_amount, total_quantity, 
   total_amount_without_tax, total_cgst_amount, total_sgst_amount, total_igst_amount, 
   total_amount, remarks) 
  VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, 
          :14, :15, TO_DATE(:16, 'YYYY-MM-DD'), :17, :18, :19, :20, :21, :22, :23, :24, 
          :25, :26, :27, :28, :29, :30, :31, :32, :33, :34, :35)
  RETURNING id INTO :36
`;

      const outBind = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT };

      const result = await connection.execute(
        insertSql,
        [
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
          outBind,
        ],
        { autoCommit: false },
      );

      insertedIds.push(result.outBinds[0][0]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Orders inserted successfully',
      insertedCount: insertedIds.length,
      ids: insertedIds,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    console.error('Insert orders error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Close connection error:', closeError);
      }
    }
  }
});

/* -------------------------------------------------------
   UPDATE ORDERS BY ORDER NUMBER (COMPLEX TRANSACTION)
------------------------------------------------------- */

function toOracleDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;

  // Accept YYYY-MM-DD safely
  const d = new Date(val);
  return isNaN(d) ? null : d;
}

app.put('/orders-by-number/:order_no', async (req, res) => {
  const { order_no } = req.params;
  const allItems = [...req.body].sort((a, b) => (a.id || 0) - (b.id || 0));

  if (!order_no?.trim()) {
    return res.status(400).json({ success: false, error: 'Order Number is required' });
  }

  if (!Array.isArray(allItems) || allItems.length === 0) {
    return res.status(400).json({ success: false, error: 'No data provided' });
  }

  console.log(`🔧 Processing order_no: ${order_no}`);
  console.log(`📋 Total items received: ${allItems.length}`);

  const itemsToInsert = allItems.filter(i => !i.id && !i._deleted);
  const itemsToUpdate = allItems.filter(i => i.id && !i._deleted);
  const itemsToDelete = allItems.filter(i => i.id && i._deleted);

  console.log(`➕ Items to insert: ${itemsToInsert.length}`);
  console.log(`📝 Items to update: ${itemsToUpdate.length}`);
  console.log(`🗑️ Items to delete: ${itemsToDelete.length}`);

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.execute('SAVEPOINT before_update');

    // ---------------- DELETE ----------------
    if (itemsToDelete.length) {
      const ids = itemsToDelete.map(i => i.id);
      const binds = ids.map((_, i) => `:${i + 1}`).join(',');
      await connection.execute(
        `DELETE FROM orders WHERE id IN (${binds}) AND order_no = :${ids.length + 1}`,
        [...ids, order_no]
      );
    }

    // ---------------- UPDATE ----------------
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

      const sql = `
        UPDATE orders
        SET ${setClause}
        WHERE id = :${values.length - 1}
          AND order_no = :${values.length}
      `;

      await connection.execute(sql, values);
    }

    // ---------------- INSERT ----------------
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

      await connection.execute(
        `INSERT INTO orders (${cols.join(',')}) VALUES (${binds})`,
        vals
      );
    }

    await connection.commit();

    const result = await connection.execute(
      'SELECT * FROM orders WHERE order_no = :1 ORDER BY id',
      [order_no],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
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

  } catch (err) {
    if (connection) await connection.execute('ROLLBACK');
    console.error('❌ Transaction failed:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

/* -------------------------------------------------------
   START SERVER
------------------------------------------------------- */
const PORT = process.env.PORT || 10000;

(async () => {
  console.log('🚀 Starting Castolin Backend...');

  try {
    initFirebase();
    await initOracle();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
      console.log(`✅ Test query: http://localhost:${PORT}/api/test-query`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

/* -------------------------------------------------------
   GRACEFUL SHUTDOWN
------------------------------------------------------- */
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await closePool();
  console.log('✅ Server shutdown complete');
  process.exit(0);
});

export { app, pool, executeQuery, closePool };
