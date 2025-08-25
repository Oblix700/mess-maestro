
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "new-prototype-gfpxx",
  appId: "1:18667109327:web:868ee0488bfda938bf70ba",
  storageBucket: "new-prototype-gfpxx.firebasestorage.app",
  apiKey: "AIzaSyDHTtAnItPuBjsveCqCyp3RUhI1nNEMcQM",
  authDomain: "new-prototype-gfpxx.firebaseapp.com",
  messagingSenderId: "18667109327"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
