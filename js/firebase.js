// Firebase modular SDK v9+
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDadEwbBwKpdtvC0qWq9dcYTVGca9l42L0",
  authDomain: "brightpathadmin.firebaseapp.com",
  databaseURL: "https://brightpathadmin-default-rtdb.firebaseio.com",
  projectId: "brightpathadmin",
  storageBucket: "brightpathadmin.firebasestorage.app",
  messagingSenderId: "78221711013",
  appId: "1:78221711013:web:575a190251d14a4364df4c",
  measurementId: "G-0MSDFHMGKW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getDatabase(app);
