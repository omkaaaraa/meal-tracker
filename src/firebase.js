// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLcsBEf-p2Gs-7aaw-brykYxk8nc_KjYw",
  authDomain: "meal-tracker-e3296.firebaseapp.com",
  projectId: "meal-tracker-e3296",
  storageBucket: "meal-tracker-e3296.firebasestorage.app",
  messagingSenderId: "844820917051",
  appId: "1:844820917051:web:5189fdb649084ab0cf651e",
  measurementId: "G-Z68RK8CWBN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
