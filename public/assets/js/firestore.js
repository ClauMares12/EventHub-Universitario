import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "./firebase.js";
import { currentUser } from "./auth.js";

function baseCreate() {
  const user = currentUser();
  return {
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: user ? user.uid : "public"
  };
}

function baseUpdate() {
  return { updatedAt: serverTimestamp() };
}

export async function listCollection(name, orderField = "createdAt") {
  const snapshot = await getDocs(query(collection(db, name), orderBy(orderField, "desc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getRecord(name, id) {
  const snapshot = await getDoc(doc(db, name, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function createCategory(data) {
  return addDoc(collection(db, "event_categories"), { ...data, ...baseCreate() });
}

export async function updateCategory(id, data) {
  return updateDoc(doc(db, "event_categories", id), { ...data, ...baseUpdate() });
}

export async function deleteCategory(id) {
  return deleteDoc(doc(db, "event_categories", id));
}

export async function createEvent(data) {
  return addDoc(collection(db, "events"), { ...data, capacity: Number(data.capacity), ...baseCreate() });
}

export async function updateEvent(id, data) {
  return updateDoc(doc(db, "events", id), { ...data, capacity: Number(data.capacity), ...baseUpdate() });
}

export async function changeEventStatus(id, status) {
  return updateDoc(doc(db, "events", id), { status, ...baseUpdate() });
}

export async function deleteEvent(id) {
  return deleteDoc(doc(db, "events", id));
}

export async function publicEvents() {
  const snapshot = await getDocs(query(collection(db, "events"), where("status", "==", "published"), orderBy("eventDate", "asc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function listRegistrations() {
  const snapshot = await getDocs(query(collection(db, "event_registrations"), orderBy("registeredAt", "desc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function registrationsByEvent(eventId) {
  const snapshot = await getDocs(query(collection(db, "event_registrations"), where("eventId", "==", eventId)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function registerAttendee(data) {
  const event = await getRecord("events", data.eventId);
  if (!event || event.status !== "published") throw new Error("El evento no esta disponible para registro.");

  const duplicated = await getDocs(query(
    collection(db, "event_registrations"),
    where("eventId", "==", data.eventId),
    where("studentEmail", "==", data.studentEmail),
    limit(1)
  ));
  if (!duplicated.empty) throw new Error("Este correo ya esta registrado en el evento.");

  const currentRegistrations = await registrationsByEvent(data.eventId);
  const activeRegistrations = currentRegistrations.filter((item) => item.status !== "cancelled");
  if (activeRegistrations.length >= Number(event.capacity)) throw new Error("El cupo maximo del evento ya fue alcanzado.");

  const code = `EVH-${Date.now().toString(36).toUpperCase()}`;
  return addDoc(collection(db, "event_registrations"), {
    ...data,
    confirmationCode: code,
    status: "registered",
    active: true,
    registeredAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: currentUser() ? currentUser().uid : "public"
  });
}

export async function updateRegistrationStatus(id, status) {
  return updateDoc(doc(db, "event_registrations", id), { status, active: status !== "cancelled", ...baseUpdate() });
}

export async function deleteRegistration(id) {
  return deleteDoc(doc(db, "event_registrations", id));
}
