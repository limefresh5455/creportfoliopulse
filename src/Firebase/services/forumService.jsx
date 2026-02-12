import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";

export const createThread = async (clientId, userId, title, description) => {
  if (!clientId) throw new Error("clientId is MISSING!");
  if (!userId) throw new Error("userId is MISSING!");

  return await addDoc(collection(db, "clients", clientId, "threads"), {
    title,
    description,
    createdBy: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const createComment = async (clientId, threadId, text, userId) => {
  return await addDoc(collection(db, "clients", clientId, "comments"), {
    threadId,
    text,
    createdBy: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const getThreads = async (clientId) => {
  const q = query(collection(db, "clients", clientId, "threads"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getCommentsByThread = async (clientId, threadId) => {
  const q = query(
    collection(db, "clients", clientId, "comments"),
    where("threadId", "==", threadId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateThread = async (clientId, threadId, data) => {
  return await updateDoc(doc(db, "clients", clientId, "threads", threadId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteThread = async (clientId, threadId) => {
  return await deleteDoc(doc(db, "clients", clientId, "threads", threadId));
};

export const updateComment = async (clientId, commentId, data) => {
  return await updateDoc(doc(db, "clients", clientId, "comments", commentId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteComment = async (clientId, commentId) => {
  return await deleteDoc(doc(db, "clients", clientId, "comments", commentId));
};
