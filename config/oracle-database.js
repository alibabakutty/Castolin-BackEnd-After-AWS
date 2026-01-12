import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

let pool;

export const initOracle = async () => {
  try {
    console.log('🔄 Initializing Oracle connection pool...');

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
};

export const getPool = () => pool;

export const closePool = async () => {
  try {
    if (pool) {
      await pool.close();
      console.log('✅ Connection pool closed successfully');
    }
  } catch (error) {
    console.error('Error closing pool', error);
    throw error;
  }
};