import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCTxdj4yhbWRrfPFSOIWY71_iOkVPR1Me8",
  authDomain: "eventhub-universitario.firebaseapp.com",
  projectId: "eventhub-universitario",
  storageBucket: "eventhub-universitario.firebasestorage.app",
  messagingSenderId: "479195424438",
  appId: "1:479195424438:web:eedc9cc9eb04b0edeb6817"
};

export const ADMIN_EMAIL = "admin@eventhub.edu.mx";

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith("TU_");
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
