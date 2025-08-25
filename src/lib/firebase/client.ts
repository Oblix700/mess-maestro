
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "new-prototype-gfpxx",
  "appId": "1:18667109327:web:868ee0488bfda938bf70ba",
  "storageBucket": "new-prototype-gfpxx.firebasestorage.app",
  "apiKey": "AIzaSyDHTtAnItPuBjsveCqCyp3RUhI1nNEMcQM",
  "authDomain": "new-prototype-gfpxx.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "18667109327"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
