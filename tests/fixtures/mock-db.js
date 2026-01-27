// tests/fixtures/mock-db.js

class MockOracleDB {
  constructor() {
    this.tables = {
      CUSTOMERS: [],
      ORDERS: [],
      ORDER_ITEMS: [],
      STOCK_ITEMS: [],
      USERS: [],
      LOGS: []
    };
    
    this.sequences = {
      CUSTOMER_ID: 1000,
      ORDER_ID: 1000,
      ITEM_ID: 1000,
      USER_ID: 1000
    };
    
    this.initializeMockData();
  }

  /**
   * Initialize with some test data
   */
  initializeMockData() {
    // Initialize customers
    this.tables.CUSTOMERS = [
      {
        ID: 1,
        CUSTOMER_CODE: 1100,
        CUSTOMER_NAME: '3rd Party Provision',
        MOBILE_NUMBER: '9876543211',
        STATE: 'not_applicable',
        EMAIL: '3rdpartyprovision@gmail.com',
        PASSWORD: '$2a$10$hashedpassword123', // Mock hashed password
        CUSTOMER_TYPE: 'direct',
        ROLE: 'direct',
        STATUS: 'active',
        PARENT_GROUP: 'Sundry Debtors',
        FIREBASE_UID: 'aCRsiXFlkycNcenxmvrJzS5S6TI3',
        CREATED_AT: new Date().toISOString(),
        UPDATED_AT: new Date().toISOString()
      },
      {
        ID: 2,
        CUSTOMER_CODE: 1106,
        CUSTOMER_NAME: 'ALLOY METAL SURFACE TECHNOLOGIES',
        MOBILE_NUMBER: '9876543212',
        STATE: 'Rajasthan',
        EMAIL: 'distributor@test.com',
        PASSWORD: '$2a$10$hashedpassword456',
        CUSTOMER_TYPE: 'distributor',
        ROLE: 'distributor',
        STATUS: 'active',
        PARENT_GROUP: 'Sundry Debtors',
        FIREBASE_UID: 'mockFirebaseUID123',
        CREATED_AT: new Date().toISOString(),
        UPDATED_AT: new Date().toISOString()
      },
      {
        ID: 3,
        CUSTOMER_CODE: 1157,
        CUSTOMER_NAME: 'YOAM ENGINEERS',
        MOBILE_NUMBER: '9873566614',
        STATE: 'Delhi',
        EMAIL: 'yoamengineers@gmail.com',
        PASSWORD: null,
        CUSTOMER_TYPE: 'distributor',
        ROLE: 'distributor',
        STATUS: 'inactive',
        PARENT_GROUP: 'Sundry Debtors',
        FIREBASE_UID: null,
        CREATED_AT: new Date().toISOString(),
        UPDATED_AT: new Date().toISOString()
      }
    ];

    // Initialize stock items
    this.tables.STOCK_ITEMS = [
      {
        ID: 1,
        ITEM_CODE: 'CAST001',
        ITEM_NAME: 'Castolin Hardfacing Rod',
        DESCRIPTION: 'Hardfacing electrode for mining equipment',
        CATEGORY: 'Welding Consumables',
        UNIT_PRICE: 1250.75,
        STOCK_QUANTITY: 500,
        MIN_STOCK_LEVEL: 50,
        MAX_STOCK_LEVEL: 1000,
        STATUS: 'active',
        CREATED_AT: new Date().toISOString(),
        UPDATED_AT: new Date().toISOString()
      },
      {
        ID: 2,
        ITEM_CODE: 'CAST002',
        ITEM_NAME: 'Anti-Corrosion Paint',
        DESCRIPTION: 'High temperature anti-corrosion coating',
        CATEGORY: 'Coatings',
        UNIT_PRICE: 850.50,
        STOCK_QUANTITY: 300,
        MIN_STOCK_LEVEL: 30,
        MAX_STOCK_LEVEL: 600,
        STATUS: 'active',
        CREATED_AT: new Date().toISOString(),
        UPDATED_AT: new Date().toISOString()
      },
      {
        ID: 3,
        ITEM_CODE: 'CAST003',
        ITEM_NAME: 'Welding Machine X200',
        DESCRIPTION: 'Industrial welding machine',
        CATEGORY: 'Equipment',
        UNIT_PRICE: 45000.00,
        STOCK_QUANTITY: 10,
        MIN_STOCK_LEVEL: 2,
        MAX_STOCK_LEVEL: 20,
        STATUS: 'active',
        CREATED_AT: new Date().toISOString(),
        UPDATED_AT: new Date().toISOString()
      }
    ];

    // Initialize orders
    this.tables.ORDERS = [
      {
        ID: 1,
        ORDER_NUMBER: 'ORD-2024-001',
        CUSTOMER_ID: 2,
        CUSTOMER_CODE: 1106,
        ORDER_DATE: new Date('2024-01-15').toISOString(),
        DELIVERY_DATE: new Date('2024-01-20').toISOString(),
        TOTAL_AMOUNT: 3752.25,
        STATUS: 'completed',
        PAYMENT_STATUS: 'paid',
        NOTES: 'Urgent delivery required',
        CREATED_AT: new Date('2024-01-15').toISOString(),
        UPDATED_AT: new Date('2024-01-20').toISOString()
      },
      {
        ID: 2,
        ORDER_NUMBER: 'ORD-2024-002',
        CUSTOMER_ID: 1,
        CUSTOMER_CODE: 1100,
        ORDER_DATE: new Date('2024-01-18').toISOString(),
        DELIVERY_DATE: new Date('2024-01-25').toISOString(),
        TOTAL_AMOUNT: 850.50,
        STATUS: 'pending',
        PAYMENT_STATUS: 'pending',
        NOTES: 'Awaiting confirmation',
        CREATED_AT: new Date('2024-01-18').toISOString(),
        UPDATED_AT: new Date('2024-01-18').toISOString()
      }
    ];

    // Initialize order items
    this.tables.ORDER_ITEMS = [
      {
        ID: 1,
        ORDER_ID: 1,
        ITEM_ID: 1,
        ITEM_CODE: 'CAST001',
        ITEM_NAME: 'Castolin Hardfacing Rod',
        QUANTITY: 3,
        UNIT_PRICE: 1250.75,
        TOTAL_PRICE: 3752.25,
        CREATED_AT: new Date().toISOString()
      },
      {
        ID: 2,
        ORDER_ID: 2,
        ITEM_ID: 2,
        ITEM_CODE: 'CAST002',
        ITEM_NAME: 'Anti-Corrosion Paint',
        QUANTITY: 1,
        UNIT_PRICE: 850.50,
        TOTAL_PRICE: 850.50,
        CREATED_AT: new Date().toISOString()
      }
    ];

    // Initialize admin users
    this.tables.USERS = [
      {
        ID: 1,
        USERNAME: 'admin',
        EMAIL: 'admin@test.com',
        PASSWORD: '$2a$10$adminhashedpassword', // Mock hashed password
        ROLE: 'admin',
        STATUS: 'active',
        CREATED_AT: new Date().toISOString(),
        UPDATED_AT: new Date().toISOString()
      },
      {
        ID: 2,
        USERNAME: 'manager',
        EMAIL: 'manager@test.com',
        PASSWORD: '$2a$10$managerhashedpass',
        ROLE: 'manager',
        STATUS: 'active',
        CREATED_AT: new Date().toISOString(),
        UPDATED_AT: new Date().toISOString()
      }
    ];
  }

  /**
   * Mock connection pool
   */
  async getConnection() {
    return {
      execute: async (sql, params = [], options = {}) => {
        return await this.executeQuery(sql, params, options);
      },
      commit: async () => {
        return { success: true };
      },
      rollback: async () => {
        return { success: true };
      },
      close: async () => {
        return { success: true };
      }
    };
  }

  /**
   * Mock query execution
   */
  async executeQuery(sql, params = [], options = {}) {
    console.log(`📊 Mock DB Query: ${sql.substring(0, 100)}...`);
    console.log(`📊 Mock DB Params:`, params);

    // Parse SQL to determine operation
    const sqlUpper = sql.toUpperCase();
    
    if (sqlUpper.includes('SELECT')) {
      return await this.handleSelect(sql, params);
    } else if (sqlUpper.includes('INSERT')) {
      return await this.handleInsert(sql, params);
    } else if (sqlUpper.includes('UPDATE')) {
      return await this.handleUpdate(sql, params);
    } else if (sqlUpper.includes('DELETE')) {
      return await this.handleDelete(sql, params);
    } else if (sqlUpper.includes('CALL')) {
      return await this.handleProcedure(sql, params);
    } else {
      return this.mockSuccessResult();
    }
  }

  /**
   * Handle SELECT queries
   */
  async handleSelect(sql, params) {
    const sqlUpper = sql.toUpperCase();
    
    // Check which table is being queried
    if (sqlUpper.includes('FROM CUSTOMERS') || sqlUpper.includes('FROM "CUSTOMERS"')) {
      return this.handleCustomerSelect(sql, params);
    } else if (sqlUpper.includes('FROM ORDERS') || sqlUpper.includes('FROM "ORDERS"')) {
      return this.handleOrderSelect(sql, params);
    } else if (sqlUpper.includes('FROM STOCK_ITEMS') || sqlUpper.includes('FROM "STOCK_ITEMS"')) {
      return this.handleStockItemSelect(sql, params);
    } else if (sqlUpper.includes('FROM USERS') || sqlUpper.includes('FROM "USERS"')) {
      return this.handleUserSelect(sql, params);
    } else if (sqlUpper.includes('FROM ORDER_ITEMS') || sqlUpper.includes('FROM "ORDER_ITEMS"')) {
      return this.handleOrderItemSelect(sql, params);
    } else if (sqlUpper.includes('COUNT(*)')) {
      return this.handleCountQuery(sql, params);
    }
    
    return this.mockSuccessResult();
  }

  /**
   * Handle customer SELECT queries
   */
  handleCustomerSelect(sql, params) {
    let customers = [...this.tables.CUSTOMERS];
    
    // Apply WHERE conditions from params
    if (params.length > 0) {
      customers = customers.filter(customer => {
        // Handle ID filter
        if (sql.includes('ID = :') && params[0] !== undefined) {
          return customer.ID === params[0];
        }
        // Handle CUSTOMER_CODE filter
        if (sql.includes('CUSTOMER_CODE = :') && params[0] !== undefined) {
          return customer.CUSTOMER_CODE === params[0];
        }
        // Handle EMAIL filter
        if (sql.includes('EMAIL = :') && params[0] !== undefined) {
          return customer.EMAIL === params[0];
        }
        // Handle STATUS filter
        if (sql.includes('STATUS = :') && params[0] !== undefined) {
          return customer.STATUS === params[0];
        }
        return true;
      });
    }

    // Handle ORDER BY
    if (sql.includes('ORDER BY')) {
      if (sql.includes('ORDER BY CUSTOMER_NAME')) {
        customers.sort((a, b) => a.CUSTOMER_NAME.localeCompare(b.CUSTOMER_NAME));
      } else if (sql.includes('ORDER BY ID')) {
        customers.sort((a, b) => a.ID - b.ID);
      }
    }

    // Handle LIMIT/OFFSET for pagination
    if (sql.includes('OFFSET') && sql.includes('FETCH NEXT')) {
      const offsetMatch = sql.match(/OFFSET (\d+)/);
      const limitMatch = sql.match(/FETCH NEXT (\d+)/);
      
      if (offsetMatch && limitMatch) {
        const offset = parseInt(offsetMatch[1]);
        const limit = parseInt(limitMatch[1]);
        customers = customers.slice(offset, offset + limit);
      }
    }

    return this.mockSuccessResult(customers);
  }

  /**
   * Handle order SELECT queries
   */
  handleOrderSelect(sql, params) {
    let orders = [...this.tables.ORDERS];
    
    if (params.length > 0) {
      orders = orders.filter(order => {
        if (sql.includes('ID = :') && params[0] !== undefined) {
          return order.ID === params[0];
        }
        if (sql.includes('CUSTOMER_CODE = :') && params[0] !== undefined) {
          return order.CUSTOMER_CODE === params[0];
        }
        if (sql.includes('STATUS = :') && params[0] !== undefined) {
          return order.STATUS === params[0];
        }
        return true;
      });
    }

    return this.mockSuccessResult(orders);
  }

  /**
   * Handle stock item SELECT queries
   */
  handleStockItemSelect(sql, params) {
    let items = [...this.tables.STOCK_ITEMS];
    
    if (params.length > 0) {
      items = items.filter(item => {
        if (sql.includes('ITEM_CODE = :') && params[0] !== undefined) {
          return item.ITEM_CODE === params[0];
        }
        if (sql.includes('CATEGORY = :') && params[0] !== undefined) {
          return item.CATEGORY === params[0];
        }
        if (sql.includes('STATUS = :') && params[0] !== undefined) {
          return item.STATUS === params[0];
        }
        return true;
      });
    }

    return this.mockSuccessResult(items);
  }

  /**
   * Handle user SELECT queries
   */
  handleUserSelect(sql, params) {
    let users = [...this.tables.USERS];
    
    if (params.length > 0) {
      users = users.filter(user => {
        if (sql.includes('EMAIL = :') && params[0] !== undefined) {
          return user.EMAIL === params[0];
        }
        if (sql.includes('USERNAME = :') && params[0] !== undefined) {
          return user.USERNAME === params[0];
        }
        return true;
      });
    }

    return this.mockSuccessResult(users);
  }

  /**
   * Handle order item SELECT queries
   */
  handleOrderItemSelect(sql, params) {
    let items = [...this.tables.ORDER_ITEMS];
    
    if (params.length > 0) {
      items = items.filter(item => {
        if (sql.includes('ORDER_ID = :') && params[0] !== undefined) {
          return item.ORDER_ID === params[0];
        }
        return true;
      });
    }

    return this.mockSuccessResult(items);
  }

  /**
   * Handle COUNT queries
   */
  handleCountQuery(sql, params) {
    let count = 0;
    
    if (sql.includes('FROM CUSTOMERS')) {
      count = this.tables.CUSTOMERS.length;
    } else if (sql.includes('FROM ORDERS')) {
      count = this.tables.ORDERS.length;
    } else if (sql.includes('FROM STOCK_ITEMS')) {
      count = this.tables.STOCK_ITEMS.length;
    }
    
    return this.mockSuccessResult([{ COUNT: count }]);
  }

  /**
   * Handle INSERT queries
   */
  async handleInsert(sql, params) {
    const sqlUpper = sql.toUpperCase();
    const now = new Date().toISOString();
    
    if (sqlUpper.includes('INTO CUSTOMERS')) {
      const newCustomer = {
        ID: ++this.sequences.CUSTOMER_ID,
        CUSTOMER_CODE: params[0] || this.generateCustomerCode(),
        CUSTOMER_NAME: params[1] || 'New Customer',
        MOBILE_NUMBER: params[2] || '9876543210',
        STATE: params[3] || 'Test State',
        EMAIL: params[4] || `customer${this.sequences.CUSTOMER_ID}@test.com`,
        PASSWORD: params[5] || '$2a$10$hashedpassword',
        CUSTOMER_TYPE: params[6] || 'direct',
        ROLE: params[7] || 'direct',
        STATUS: params[8] || 'active',
        PARENT_GROUP: params[9] || 'Sundry Debtors',
        FIREBASE_UID: params[10] || null,
        CREATED_AT: now,
        UPDATED_AT: now
      };
      
      this.tables.CUSTOMERS.push(newCustomer);
      return this.mockSuccessResult({ rowsAffected: 1 }, newCustomer);
      
    } else if (sqlUpper.includes('INTO ORDERS')) {
      const newOrder = {
        ID: ++this.sequences.ORDER_ID,
        ORDER_NUMBER: params[0] || `ORD-${new Date().getFullYear()}-${this.sequences.ORDER_ID}`,
        CUSTOMER_ID: params[1] || 1,
        CUSTOMER_CODE: params[2] || 1100,
        ORDER_DATE: params[3] || now,
        DELIVERY_DATE: params[4] || null,
        TOTAL_AMOUNT: params[5] || 0,
        STATUS: params[6] || 'pending',
        PAYMENT_STATUS: params[7] || 'pending',
        NOTES: params[8] || '',
        CREATED_AT: now,
        UPDATED_AT: now
      };
      
      this.tables.ORDERS.push(newOrder);
      return this.mockSuccessResult({ rowsAffected: 1 }, newOrder);
      
    } else if (sqlUpper.includes('INTO STOCK_ITEMS')) {
      const newItem = {
        ID: ++this.sequences.ITEM_ID,
        ITEM_CODE: params[0] || `ITEM${this.sequences.ITEM_ID}`,
        ITEM_NAME: params[1] || 'New Item',
        DESCRIPTION: params[2] || '',
        CATEGORY: params[3] || 'General',
        UNIT_PRICE: params[4] || 0,
        STOCK_QUANTITY: params[5] || 0,
        MIN_STOCK_LEVEL: params[6] || 10,
        MAX_STOCK_LEVEL: params[7] || 100,
        STATUS: params[8] || 'active',
        CREATED_AT: now,
        UPDATED_AT: now
      };
      
      this.tables.STOCK_ITEMS.push(newItem);
      return this.mockSuccessResult({ rowsAffected: 1 }, newItem);
    }
    
    return this.mockSuccessResult({ rowsAffected: 1 });
  }

  /**
   * Handle UPDATE queries
   */
  async handleUpdate(sql, params) {
    const sqlUpper = sql.toUpperCase();
    const now = new Date().toISOString();
    
    if (sqlUpper.includes('CUSTOMERS SET')) {
      const customerId = this.extractIdFromWhereClause(sql);
      const customerIndex = this.tables.CUSTOMERS.findIndex(c => c.ID === customerId);
      
      if (customerIndex !== -1) {
        // Update customer fields based on params
        const updates = {};
        if (sql.includes('STATUS = :')) {
          updates.STATUS = params[0];
        }
        if (sql.includes('CUSTOMER_NAME = :')) {
          updates.CUSTOMER_NAME = params[0];
        }
        if (sql.includes('MOBILE_NUMBER = :')) {
          updates.MOBILE_NUMBER = params[0];
        }
        
        updates.UPDATED_AT = now;
        this.tables.CUSTOMERS[customerIndex] = {
          ...this.tables.CUSTOMERS[customerIndex],
          ...updates
        };
        
        return this.mockSuccessResult({ rowsAffected: 1 });
      }
      
    } else if (sqlUpper.includes('ORDERS SET')) {
      const orderId = this.extractIdFromWhereClause(sql);
      const orderIndex = this.tables.ORDERS.findIndex(o => o.ID === orderId);
      
      if (orderIndex !== -1) {
        const updates = {};
        if (sql.includes('STATUS = :')) {
          updates.STATUS = params[0];
        }
        if (sql.includes('PAYMENT_STATUS = :')) {
          updates.PAYMENT_STATUS = params[0];
        }
        
        updates.UPDATED_AT = now;
        this.tables.ORDERS[orderIndex] = {
          ...this.tables.ORDERS[orderIndex],
          ...updates
        };
        
        return this.mockSuccessResult({ rowsAffected: 1 });
      }
    }
    
    return this.mockSuccessResult({ rowsAffected: 0 });
  }

  /**
   * Handle DELETE queries
   */
  async handleDelete(sql, params) {
    const sqlUpper = sql.toUpperCase();
    
    if (sqlUpper.includes('FROM CUSTOMERS')) {
      const customerId = this.extractIdFromWhereClause(sql);
      const initialLength = this.tables.CUSTOMERS.length;
      this.tables.CUSTOMERS = this.tables.CUSTOMERS.filter(c => c.ID !== customerId);
      const rowsAffected = initialLength - this.tables.CUSTOMERS.length;
      
      return this.mockSuccessResult({ rowsAffected });
    }
    
    return this.mockSuccessResult({ rowsAffected: 0 });
  }

  /**
   * Handle stored procedure calls
   */
  async handleProcedure(sql, params) {
    const procedureName = sql.match(/CALL\s+(\w+)/i)?.[1];
    
    if (procedureName === 'GET_CUSTOMER_ORDERS') {
      const customerCode = params[0];
      const orders = this.tables.ORDERS.filter(o => o.CUSTOMER_CODE === customerCode);
      return this.mockSuccessResult(orders);
    }
    
    if (procedureName === 'UPDATE_STOCK_QUANTITY') {
      const itemCode = params[0];
      const quantity = params[1];
      
      const itemIndex = this.tables.STOCK_ITEMS.findIndex(i => i.ITEM_CODE === itemCode);
      if (itemIndex !== -1) {
        this.tables.STOCK_ITEMS[itemIndex].STOCK_QUANTITY = quantity;
        this.tables.STOCK_ITEMS[itemIndex].UPDATED_AT = new Date().toISOString();
        return this.mockSuccessResult({ success: true });
      }
    }
    
    return this.mockSuccessResult();
  }

  /**
   * Helper methods
   */
  extractIdFromWhereClause(sql) {
    const match = sql.match(/WHERE\s+ID\s*=\s*:(\d+)/i) || 
                  sql.match(/WHERE\s+ID\s*=\s*(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }

  generateCustomerCode() {
    return 1000 + this.tables.CUSTOMERS.length;
  }

  mockSuccessResult(rows = [], metaData = null) {
    return {
      rows: rows,
      metaData: metaData || this.generateMockMetaData(rows),
      rowsAffected: Array.isArray(rows) ? rows.length : 1,
      outBinds: {}
    };
  }

  generateMockMetaData(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }
    
    const sampleRow = rows[0];
    return Object.keys(sampleRow).map(key => ({
      name: key.toUpperCase()
    }));
  }

  /**
   * Reset database to initial state
   */
  reset() {
    this.tables = {
      CUSTOMERS: [],
      ORDERS: [],
      ORDER_ITEMS: [],
      STOCK_ITEMS: [],
      USERS: [],
      LOGS: []
    };
    
    this.sequences = {
      CUSTOMER_ID: 1000,
      ORDER_ID: 1000,
      ITEM_ID: 1000,
      USER_ID: 1000
    };
    
    this.initializeMockData();
    console.log('🔄 Mock database reset to initial state');
  }

  /**
   * Seed additional test data
   */
  seedTestData(data) {
    if (data.customers) {
      this.tables.CUSTOMERS.push(...data.customers);
    }
    if (data.orders) {
      this.tables.ORDERS.push(...data.orders);
    }
    if (data.stockItems) {
      this.tables.STOCK_ITEMS.push(...data.stockItems);
    }
    console.log(`🌱 Seeded ${Object.keys(data).length} table(s) with test data`);
  }

  /**
   * Get all data for debugging
   */
  getData() {
    return {
      customers: [...this.tables.CUSTOMERS],
      orders: [...this.tables.ORDERS],
      stockItems: [...this.tables.STOCK_ITEMS],
      users: [...this.tables.USERS],
      orderItems: [...this.tables.ORDER_ITEMS]
    };
  }

  /**
   * Clear specific table
   */
  clearTable(tableName) {
    if (this.tables[tableName.toUpperCase()]) {
      this.tables[tableName.toUpperCase()] = [];
      console.log(`🗑️  Cleared table: ${tableName}`);
      return true;
    }
    return false;
  }
}

/**
 * Mock Oracle Service for tests
 */
class MockOracleService {
  constructor() {
    this.db = new MockOracleDB();
    this.isConnected = true;
  }

  async connect() {
    this.isConnected = true;
    console.log('✅ Mock Oracle connected');
    return this;
  }

  async disconnect() {
    this.isConnected = false;
    console.log('🔌 Mock Oracle disconnected');
    return true;
  }

  async executeQuery(sql, params = []) {
    if (!this.isConnected) {
      throw new Error('Mock database not connected');
    }
    return await this.db.executeQuery(sql, params);
  }

  async getConnection() {
    return await this.db.getConnection();
  }

  async executeProcedure(procedureName, params = []) {
    const sql = `CALL ${procedureName}(${params.map((_, i) => `:${i + 1}`).join(',')})`;
    return await this.executeQuery(sql, params);
  }

  reset() {
    this.db.reset();
  }

  seed(data) {
    this.db.seedTestData(data);
  }

  getData() {
    return this.db.getData();
  }
}

/**
 * Export singleton instances
 */
const mockDB = new MockOracleDB();
const mockOracleService = new MockOracleService();

module.exports = {
  MockOracleDB,
  MockOracleService,
  mockDB,
  mockOracleService,
  
  // Helper functions for tests
  createMockCustomer: (overrides = {}) => ({
    ID: mockDB.sequences.CUSTOMER_ID + 1,
    CUSTOMER_CODE: overrides.CUSTOMER_CODE || 1000 + mockDB.tables.CUSTOMERS.length + 1,
    CUSTOMER_NAME: overrides.CUSTOMER_NAME || `Test Customer ${Date.now()}`,
    MOBILE_NUMBER: overrides.MOBILE_NUMBER || '9876543210',
    STATE: overrides.STATE || 'Test State',
    EMAIL: overrides.EMAIL || `test${Date.now()}@example.com`,
    PASSWORD: overrides.PASSWORD || '$2a$10$hashedpassword',
    CUSTOMER_TYPE: overrides.CUSTOMER_TYPE || 'direct',
    ROLE: overrides.ROLE || 'direct',
    STATUS: overrides.STATUS || 'active',
    PARENT_GROUP: overrides.PARENT_GROUP || 'Sundry Debtors',
    FIREBASE_UID: overrides.FIREBASE_UID || null,
    CREATED_AT: new Date().toISOString(),
    UPDATED_AT: new Date().toISOString()
  }),
  
  createMockOrder: (overrides = {}) => ({
    ID: mockDB.sequences.ORDER_ID + 1,
    ORDER_NUMBER: overrides.ORDER_NUMBER || `ORD-${new Date().getFullYear()}-${mockDB.tables.ORDERS.length + 1}`,
    CUSTOMER_ID: overrides.CUSTOMER_ID || 1,
    CUSTOMER_CODE: overrides.CUSTOMER_CODE || 1100,
    ORDER_DATE: overrides.ORDER_DATE || new Date().toISOString(),
    DELIVERY_DATE: overrides.DELIVERY_DATE || null,
    TOTAL_AMOUNT: overrides.TOTAL_AMOUNT || 1000.00,
    STATUS: overrides.STATUS || 'pending',
    PAYMENT_STATUS: overrides.PAYMENT_STATUS || 'pending',
    NOTES: overrides.NOTES || '',
    CREATED_AT: new Date().toISOString(),
    UPDATED_AT: new Date().toISOString()
  }),
  
  createMockStockItem: (overrides = {}) => ({
    ID: mockDB.sequences.ITEM_ID + 1,
    ITEM_CODE: overrides.ITEM_CODE || `ITEM${mockDB.tables.STOCK_ITEMS.length + 1}`,
    ITEM_NAME: overrides.ITEM_NAME || `Test Item ${Date.now()}`,
    DESCRIPTION: overrides.DESCRIPTION || 'Test description',
    CATEGORY: overrides.CATEGORY || 'Test Category',
    UNIT_PRICE: overrides.UNIT_PRICE || 100.00,
    STOCK_QUANTITY: overrides.STOCK_QUANTITY || 50,
    MIN_STOCK_LEVEL: overrides.MIN_STOCK_LEVEL || 10,
    MAX_STOCK_LEVEL: overrides.MAX_STOCK_LEVEL || 100,
    STATUS: overrides.STATUS || 'active',
    CREATED_AT: new Date().toISOString(),
    UPDATED_AT: new Date().toISOString()
  })
};