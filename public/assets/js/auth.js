import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ADMIN_EMAIL, auth, db, isFirebaseConfigured } from "./firebase.js";

export function requireFirebaseConfig() {
  if (!isFirebaseConfigured) {
    throw new Error("Configura primero las credenciales de Firebase en public/assets/js/firebase.js.");
  }
}

export async function registerUser({ name, email, password }) {
  requireFirebaseConfig();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await setDoc(doc(db, "users", credential.user.uid), {
    uid: credential.user.uid,
    name,
    email,
    role: email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "organizer",
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return credential.user;
}

export async function loginUser(email, password) {
  requireFirebaseConfig();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
  window.location.href = "login.html";
}

export function protectPage() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      resolve(user);
    });
  });
}

export function guestOnly() {
  // La sesion puede quedar activa en Firebase, pero login/register se mantienen visibles
  // para que la demo siempre pida una accion manual del usuario.
  onAuthStateChanged(auth, () => {});
}

export function currentUser() {
  return auth.currentUser;
}

