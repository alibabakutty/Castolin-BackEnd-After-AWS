import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

// ------------------
// Mock auth middleware
// ------------------
const createAuthMiddleware = () => {
  return (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    try {
      const decoded = jwt.verify(token, 'test-secret');
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  };
};

// ------------------
// Mock helpers
// ------------------
const mockRequest = (headers = {}) => ({
  headers,
});

const mockResponse = () => {
  const res = {};
  res.statusCode = 200;
  res.body = null;

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (payload) => {
    res.body = payload;
    return res;
  };

  return res;
};

// ------------------
// Tests
// ------------------
test.describe('Auth Middleware', () => {
  let authMiddleware;

  test.beforeEach(() => {
    authMiddleware = createAuthMiddleware();
  });

  test('should allow request with valid token', () => {
    const token = jwt.sign(
      { userId: 123, role: 'admin' },
      'test-secret'
    );

    const req = mockRequest({
      authorization: `Bearer ${token}`,
    });
    const res = mockResponse();

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    authMiddleware(req, res, next);

    expect(nextCalled).toBe(true);
    expect(req.user.userId).toBe(123);
    expect(req.user.role).toBe('admin');
  });

  test('should reject request without token', () => {
    const req = mockRequest();
    const res = mockResponse();

    authMiddleware(req, res, () => {});

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('No token provided');
  });

  test('should reject request with invalid token', () => {
    const req = mockRequest({
      authorization: 'Bearer invalid-token',
    });
    const res = mockResponse();

    authMiddleware(req, res, () => {});

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid token');
  });

  test('should reject request with expired token', () => {
    const token = jwt.sign(
      { userId: 123 },
      'test-secret',
      { expiresIn: '-1h' }
    );

    const req = mockRequest({
      authorization: `Bearer ${token}`,
    });
    const res = mockResponse();

    authMiddleware(req, res, () => {});

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
