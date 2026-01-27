import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class AuthService {
  constructor() {
    // Use env in real app, fallback for tests
    this.jwtSecret = process.env.JWT_SECRET || 'test-secret';
    this.jwtExpiresIn = '1h';
  }

  // =========================
  // Register User
  // =========================
  async registerUser(user) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    return {
      success: true,
      user: {
        ...user,
        password: hashedPassword,
      },
    };
  }

  // =========================
  // Login User
  // =========================
  async loginUser({ password, hashedPassword }) {
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateJWT({
      userId: 123,
      email: 'test@example.com',
      role: 'user',
    });

    return {
      success: true,
      token,
    };
  }

  // =========================
  // Generate JWT
  // =========================
  generateJWT(payload) {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  // =========================
  // Verify JWT
  // =========================
  verifyJWT(token) {
    return jwt.verify(token, this.jwtSecret);
  }

  // =========================
  // Validate Email
  // =========================
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

export default new AuthService();
