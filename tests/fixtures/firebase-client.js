// tests/fixtures/firebase-client.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // add other keys if needed
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function getFirebaseToken(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return await userCredential.user.getIdToken();
}
