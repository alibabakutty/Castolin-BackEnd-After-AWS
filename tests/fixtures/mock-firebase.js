// tests/fixtures/mock-firebase.js

const mockFirebase = {
  auth: () => ({
    verifyIdToken: async (token) => {
      if (token === 'valid-token') {
        return {
          uid: 'mockFirebaseUID123',
          email: 'distributor@test.com',
          role: 'distributor'
        };
      }
      throw new Error('Invalid token');
    },
    
    createCustomToken: async (uid, additionalClaims = {}) => {
      return 'mock-custom-token-' + uid;
    },
    
    getUserByEmail: async (email) => {
      const users = {
        'distributor@test.com': { uid: 'mockFirebaseUID123', email, displayName: 'Test Distributor' },
        'admin@test.com': { uid: 'mockAdminUID', email, displayName: 'Admin User' }
      };
      return users[email] || null;
    }
  })
};

module.exports = mockFirebase;