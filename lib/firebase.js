import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';



const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


// const firebaseConfig = {
//   apiKey: "AIzaSyC5hcTgV69PfumXLYQ0mnh9ePmNWUrLc8A",
//   authDomain: "learningfirebase-467e7.firebaseapp.com",
//   databaseURL: "https://learningfirebase-467e7-default-rtdb.firebaseio.com",
//   projectId: "learningfirebase-467e7",
//   storageBucket: "learningfirebase-467e7.appspot.com",
//   messagingSenderId: "498411385755",
//   appId: "1:498411385755:web:6b1dabe9c0c429109ce73e",
//   measurementId: "G-XDFM60NXLM"
// };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app);
