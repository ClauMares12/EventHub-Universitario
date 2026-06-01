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

function firestoreMessage(error) {
  const code = error?.code || "";
  if (code === "permission-denied") {
    return "Firestore rechazo la operacion. Revisa que hayas publicado las reglas en Firestore Database > Reglas.";
  }
  if (code === "unavailable") {
    return "No se pudo conectar con Firestore. Revisa tu internet o recarga la pagina.";
  }
  if (code === "not-found") {
    return "Firestore Database no existe todavia en este proyecto. Crea la base de datos en Firebase.";
  }
  if (code === "failed-precondition") {
    return "Firestore necesita una configuracion o indice adicional. Revisa el mensaje de Firebase en consola.";
  }
  return error?.message || "Ocurrio un error al conectar con Firestore.";
}

async function withFirestoreTimeout(operation, label = "operacion") {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Firestore tardo demasiado en completar la ${label}. Revisa que Firestore Database exista y que las reglas esten publicadas.`)), 12000);
  });

  try {
    return await Promise.race([operation, timeout]);
  } catch (error) {
    console.error("Firestore error:", error);
    throw new Error(firestoreMessage(error));
  }
}

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
  const snapshot = await withFirestoreTimeout(
    getDocs(query(collection(db, name), orderBy(orderField, "desc"))),
    `consulta de ${name}`
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getRecord(name, id) {
  const snapshot = await withFirestoreTimeout(getDoc(doc(db, name, id)), `consulta de ${name}`);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function createCategory(data) {
  return withFirestoreTimeout(addDoc(collection(db, "event_categories"), { ...data, ...baseCreate() }), "creacion de categoria");
}

export async function updateCategory(id, data) {
  return withFirestoreTimeout(updateDoc(doc(db, "event_categories", id), { ...data, ...baseUpdate() }), "actualizacion de categoria");
}

export async function deleteCategory(id) {
  return withFirestoreTimeout(deleteDoc(doc(db, "event_categories", id)), "eliminacion de categoria");
}

export async function createEvent(data) {
  return withFirestoreTimeout(addDoc(collection(db, "events"), { ...data, capacity: Number(data.capacity), ...baseCreate() }), "creacion de evento");
}

export async function updateEvent(id, data) {
  return withFirestoreTimeout(updateDoc(doc(db, "events", id), { ...data, capacity: Number(data.capacity), ...baseUpdate() }), "actualizacion de evento");
}

export async function changeEventStatus(id, status) {
  return withFirestoreTimeout(updateDoc(doc(db, "events", id), { status, ...baseUpdate() }), "cambio de estado");
}

export async function deleteEvent(id) {
  return withFirestoreTimeout(deleteDoc(doc(db, "events", id)), "eliminacion de evento");
}

export async function publicEvents() {
  const snapshot = await withFirestoreTimeout(
    getDocs(query(collection(db, "events"), where("status", "==", "published"))),
    "consulta de eventos publicos"
  );
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => String(a.eventDate || "").localeCompare(String(b.eventDate || "")));
}

export async function listRegistrations() {
  const snapshot = await withFirestoreTimeout(
    getDocs(query(collection(db, "event_registrations"), orderBy("registeredAt", "desc"))),
    "consulta de asistentes"
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function registrationsByEvent(eventId) {
  const snapshot = await withFirestoreTimeout(
    getDocs(query(collection(db, "event_registrations"), where("eventId", "==", eventId))),
    "consulta de asistentes por evento"
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function registerAttendee(data) {
  const event = await getRecord("events", data.eventId);
  if (!event || event.status !== "published") throw new Error("El evento no esta disponible para registro.");

  const duplicated = await withFirestoreTimeout(getDocs(query(
    collection(db, "event_registrations"),
    where("eventId", "==", data.eventId),
    where("studentEmail", "==", data.studentEmail),
    limit(1)
  )), "validacion de registro duplicado");
  if (!duplicated.empty) throw new Error("Este correo ya esta registrado en el evento.");

  const currentRegistrations = await registrationsByEvent(data.eventId);
  const activeRegistrations = currentRegistrations.filter((item) => item.status !== "cancelled");
  if (activeRegistrations.length >= Number(event.capacity)) throw new Error("El cupo maximo del evento ya fue alcanzado.");

  const code = `EVH-${Date.now().toString(36).toUpperCase()}`;
  return withFirestoreTimeout(addDoc(collection(db, "event_registrations"), {
    ...data,
    confirmationCode: code,
    status: "registered",
    active: true,
    registeredAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: currentUser() ? currentUser().uid : "public"
  }), "registro de asistente");
}

export async function updateRegistrationStatus(id, status) {
  return withFirestoreTimeout(updateDoc(doc(db, "event_registrations", id), { status, active: status !== "cancelled", ...baseUpdate() }), "actualizacion de asistente");
}

export async function deleteRegistration(id) {
  return withFirestoreTimeout(deleteDoc(doc(db, "event_registrations", id)), "eliminacion de asistente");
}

