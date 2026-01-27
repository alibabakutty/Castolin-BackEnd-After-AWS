// tests/fixtures/mock-utils.js

class MockUtils {
  static mockModule(modulePath, mockImplementation) {
    // In Playwright, we can use proxyquire or manual dependency injection
    // For simplicity, we'll use manual mocking
    return mockImplementation;
  }

  static createMockRequest(options = {}) {
    return {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body || {},
      query: options.query || {},
      params: options.params || {},
      user: options.user || null,
      header: function(name) {
        return this.headers[name];
      }
    };
  }

  static createMockResponse() {
    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      send: function(data) {
        this.body = data;
        return this;
      },
      setHeader: function(name, value) {
        this.headers[name] = value;
        return this;
      },
      getHeader: function(name) {
        return this.headers[name];
      },
      end: function() {
        return this;
      }
    };
    return res;
  }

  static createMockNext() {
    return function next() {};
  }

  static mockFirebase() {
    return {
      auth: () => ({
        verifyIdToken: async (token) => {
          if (token === 'valid-token') {
            return { uid: 'firebase-uid', email: 'test@example.com' };
          }
          throw new Error('Invalid token');
        },
        createCustomToken: async (uid) => `custom-token-${uid}`,
        getUserByEmail: async (email) => {
          const users = {
            'admin@test.com': { uid: 'admin-uid', email: 'admin@test.com' },
            'user@test.com': { uid: 'user-uid', email: 'user@test.com' }
          };
          return users[email] || null;
        }
      })
    };
  }

  static mockOracle() {
    const mockData = {
      customers: [],
      orders: [],
      stockItems: []
    };

    return {
      executeQuery: async (sql, params = []) => {
        console.log(`Mock Oracle Query: ${sql}`);
        
        // Parse SQL and return appropriate mock data
        if (sql.includes('SELECT')) {
          if (sql.includes('customers')) {
            return { rows: mockData.customers, rowsAffected: mockData.customers.length };
          }
          if (sql.includes('COUNT')) {
            return { rows: [{ COUNT: mockData.customers.length }], rowsAffected: 1 };
          }
        }
        
        if (sql.includes('INSERT')) {
          const newItem = { ID: mockData.customers.length + 1, ...params };
          mockData.customers.push(newItem);
          return { rowsAffected: 1, outBinds: { ID: newItem.ID } };
        }
        
        return { rows: [], rowsAffected: 0 };
      },
      
      _setData: (data) => {
        Object.assign(mockData, data);
      },
      
      _getData: () => ({ ...mockData })
    };
  }
}

module.exports = MockUtils;