// tests/fixtures/auth-tokens.js

class AuthHelper {
  static async getAdminToken() {
    // Generate admin token for testing
    const response = await fetch(`${process.env.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      })
    });
    return await response.json();
  }

  static async getDistributorToken() {
    // Get distributor token (like in your existing test)
    const response = await fetch(`${process.env.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'distributor@test.com',
        password: 'Test@123'
      })
    });
    return await response.json();
  }
}

module.exports = AuthHelper;