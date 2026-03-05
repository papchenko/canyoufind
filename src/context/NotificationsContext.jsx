import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnread([]);
      return;
    }

    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribeNotifications = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      const userCreatedAt = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime)
        : new Date(0);

      const filtered = all.filter(
        (n) =>
          (n.userId === "all" || n.userId === user.uid) &&
          n.createdAt?.toDate?.() >= userCreatedAt
      );

      const readRef = collection(db, `users/${user.uid}/readNotifications`);
      const unsubscribeRead = onSnapshot(readRef, (snap) => {
        const readIds = snap.docs.map((d) => d.id);

        const unreadList = filtered.filter((n) => !readIds.includes(n.id));

        setUnread(unreadList);
        setNotifications(unreadList);
      });

      return unsubscribeRead;
    });

    return () => {
      unsubscribeNotifications();
    };
  }, [user]);

  const addNotification = async (notification) => {
    await addDoc(collection(db, "notifications"), {
      ...notification,
      createdAt: serverTimestamp(),
    });
  };

  const markAsRead = async (notificationId) => {
    if (!user) return;
    const readRef = doc(db, `users/${user.uid}/readNotifications/${notificationId}`);
    await setDoc(readRef, { readAt: serverTimestamp() });
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, unread, addNotification, markAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);