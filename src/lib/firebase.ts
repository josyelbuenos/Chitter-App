import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// =================================================================
// IMPORTANT: ACTION REQUIRED
// =================================================================
// The app is crashing because the Firebase configuration below
// is using placeholder values. You MUST replace them with the
// actual credentials from your Firebase project.
//
// HOW TO GET YOUR FIREBASE CONFIG:
// 1. Go to your Firebase project console: https://console.firebase.google.com/
// 2. In the sidebar, click the gear icon -> Project settings.
// 3. In the "Your apps" card, find your web app.
// 4. In the "Firebase SDK snippet" section, select "Config".
// 5. Copy the entire configuration object and paste it below,
//    REPLACING the `firebaseConfig` object.
// =================================================================
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};


// Do not change the code below this line
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
