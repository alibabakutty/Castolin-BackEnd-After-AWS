import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

export const initFirebase = () => { 
  try {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!base64) {
      console.warn('⚠️ Firebase service account missing');
      return null;
    }

    const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(json)
      });
    }

    console.log('✅ Firebase initialized');
    return admin;
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error.message);
    return null;
  }
};