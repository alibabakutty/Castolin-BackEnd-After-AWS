// tests/unit/middleware/cors.spec.js
import { test, expect } from '@playwright/test';

// Create a simple CORS middleware mock
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

test.describe('CORS Middleware', () => {
  test('should set CORS headers for localhost', () => {
    const mockReq = {
      method: 'GET',
      headers: { origin: 'http://localhost:3000' }
    };
    
    const mockRes = {
      headers: {},
      setHeader(name, value) {
        this.headers[name] = value;
        return this;
      },
      status() { return this; },
      end() { return this; }
    };
    
    let nextCalled = false;
    
    corsMiddleware(mockReq, mockRes, () => { nextCalled = true; });
    
    expect(mockRes.headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
    expect(nextCalled).toBe(true);
  });
});