// firebase-config.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3bQPYdV4Radx6xohL40KbOq2vnVVspzE",
  authDomain: "spirit-sidekick.firebaseapp.com",
  projectId: "spirit-sidekick",
  storageBucket: "spirit-sidekick.firebasestorage.app",
  messagingSenderId: "662710493586",
  appId: "1:662710493586:web:06ea3d0282c3243cd7a14b",
  measurementId: "G-V6SF73FXMK"
};

// Prevent duplicate initialization
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
