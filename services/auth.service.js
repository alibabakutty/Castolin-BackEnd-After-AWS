import admin from 'firebase-admin';

export class AuthService {
  async verifyToken(token) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async getUserByUid(uid) {
    try {
      return await admin.auth().getUser(uid);
    } catch (error) {
      throw new Error('User not found');
    }
  }
}