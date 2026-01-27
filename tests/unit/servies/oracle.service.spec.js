// tests/unit/services/oracle.service.spec.js
import { test, expect } from '@playwright/test';

// Mock Oracle Service
const createMockOracleService = () => {
  const mockData = {
    customers: [
      { ID: 1, NAME: 'Test Customer', STATUS: 'active' },
      { ID: 2, NAME: 'Another Customer', STATUS: 'inactive' },
    ],
    orders: [],
    stockItems: [],
  };

  return {
    isConnected: false, // <-- now a property of the object

    async connect() {
      this.isConnected = true; // <-- update property
      return this;
    },

    async disconnect() {
      this.isConnected = false; // <-- update property
      return true;
    },

    async executeQuery(sql, params = {}) {
      if (!this.isConnected) throw new Error('Database not connected');

      // Mock SELECT queries
      if (sql.toUpperCase().includes('SELECT')) {
        if (sql.includes('customers') || sql.includes('CUSTOMERS')) {
          return {
            rows: mockData.customers,
            metaData: Object.keys(mockData.customers[0]).map(key => ({ name: key })),
            rowsAffected: mockData.customers.length,
          };
        }

        if (sql.toUpperCase().includes('COUNT')) {
          return {
            rows: [{ COUNT: mockData.customers.length }],
            metaData: [{ name: 'COUNT' }],
            rowsAffected: 1,
          };
        }
      }

      // Mock INSERT queries
      if (sql.toUpperCase().includes('INSERT')) {
        const newId = mockData.customers.length + 1;
        mockData.customers.push({
          ID: newId,
          NAME: params.name || 'New Customer',
          STATUS: params.status || 'active',
        });
        return { rowsAffected: 1, outBinds: { ID: newId }, rows: [] };
      }

      // Mock UPDATE queries
      if (sql.toUpperCase().includes('UPDATE')) {
        return { rowsAffected: 1, rows: [] };
      }

      // Mock DELETE queries
      if (sql.toUpperCase().includes('DELETE')) {
        return { rowsAffected: 1, rows: [] };
      }

      return { rows: [], metaData: [], rowsAffected: 0 };
    },

    async executeProcedure(name, params = {}) {
      if (!this.isConnected) throw new Error('Database not connected');
      return { success: true, data: [], ...params };
    },

    async executeTransaction(callback) {
      return callback(this);
    },

    _getMockData() {
      return { ...mockData };
    },
  };
};

// ---------------- TESTS ----------------
test.describe('Oracle Service', () => {
  let oracleService;

  test.beforeEach(() => {
    oracleService = createMockOracleService();
  });

  test('should connect to database successfully', async () => {
    await oracleService.connect();
    expect(oracleService.isConnected).toBe(true);
  });

  test('should disconnect successfully', async () => {
    await oracleService.connect();
    await oracleService.disconnect();
    expect(oracleService.isConnected).toBe(false);
  });

  test('should execute SELECT query', async () => {
    await oracleService.connect();
    const result = await oracleService.executeQuery('SELECT * FROM customers');
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].NAME).toBe('Test Customer');
  });

  test('should execute INSERT query', async () => {
    await oracleService.connect();
    const result = await oracleService.executeQuery(
      'INSERT INTO customers (name, status) VALUES (:name, :status)',
      { name: 'New Customer', status: 'active' }
    );

    expect(result.rowsAffected).toBe(1);
    expect(result.outBinds.ID).toBe(3);

    const selectResult = await oracleService.executeQuery('SELECT * FROM customers');
    expect(selectResult.rows).toHaveLength(3);
  });

  test('should execute stored procedure', async () => {
    await oracleService.connect();
    const result = await oracleService.executeProcedure('GET_CUSTOMER_ORDERS', { customerId: 1 });
    expect(result.success).toBe(true);
    expect(result.customerId).toBe(1);
  });

  test('should handle transactions', async () => {
    await oracleService.connect();
    const result = await oracleService.executeTransaction(async connection => {
      const insertResult = await connection.executeQuery('INSERT INTO customers (name) VALUES (:name)', {
        name: 'Transaction Customer',
      });
      return insertResult;
    });

    expect(result.rowsAffected).toBe(1);
  });

  test('should throw error when not connected', async () => {
    await expect(oracleService.executeQuery('SELECT * FROM customers')).rejects.toThrow(
      'Database not connected'
    );
  });
});
