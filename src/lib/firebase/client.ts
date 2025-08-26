// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHTtAnItPuBjsveCqCyp3RUhI1nNEMcQM",
  authDomain: "new-prototype-gfpxx.firebaseapp.com",
  projectId: "new-prototype-gfpxx",
  storageBucket: "new-prototype-gfpxx.firebasestorage.app",
  messagingSenderId: "18667109327",
  appId: "1:18667109327:web:868ee0488bfda938bf70ba"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

export { app, firestore, doc, getDoc };
