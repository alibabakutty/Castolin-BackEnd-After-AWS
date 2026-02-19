import oracledb from 'oracledb';
import dotenv from 'dotenv';  

dotenv.config();

let pool;

export async function initOracle() {
  if (pool) return pool;

  console.log('🔄 Initializing Oracle connection pool...');

  // ✅ REQUIRED in Docker
  oracledb.initOracleClient({
    libDir: '/opt/oracle/instantclient_21_21',
  });

  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
    queueTimeout: 60000
  });

  const conn = await pool.getConnection();
  const res = await conn.execute(`select sysdate from dual`);
  await conn.close();

  console.log('✅ Oracle connected:', res.rows[0]);
  return pool;
}

export function getPool() {
  if (!pool) throw new Error('Pool not initialized');
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.close(10);
    pool = null;
    console.log('🔒 Oracle pool closed');
  }
}
