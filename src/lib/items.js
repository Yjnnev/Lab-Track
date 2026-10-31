import {
  collection, doc, addDoc, updateDoc, query, where, onSnapshot, serverTimestamp, increment,
} from "firebase/firestore";
import { db } from "../firebase";

const itemsRef = collection(db, "items");

// Live list. Students use { onlyActive: true }; the admin catalog page shows everything.
export function watchItems(callback, { onlyActive = false } = {}) {
  const q = onlyActive ? query(itemsRef, where("active", "==", true)) : itemsRef;
  return onSnapshot(q, { includeMetadataChanges: true }, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => a.name.localeCompare(b.name));
    callback(items, { fromCache: snap.metadata.fromCache });
  });
}

export function addItem({ name, totalQty }) {
  return addDoc(itemsRef, {
    name,
    totalQty,
    availableQty: totalQty,
    active: true,
    createdAt: serverTimestamp(),
  });
}

export function updateItem(id, changes) {
  return updateDoc(doc(db, "items", id), changes);
}

// Deactivate instead of deleting, so old slips still make sense.
export function setItemActive(id, active) {
  return updateDoc(doc(db, "items", id), { active });
}

// Change an item's name or total. Available stock moves by the same difference,
// so items that are currently borrowed stay consistent.
export function editItem(item, { name, totalQty }) {
  const diff = totalQty - item.totalQty;
  return updateDoc(doc(db, "items", item.id), {
    name,
    totalQty,
    availableQty: increment(diff),
  });
}
