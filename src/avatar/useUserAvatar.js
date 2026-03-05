import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function useUserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      }
    });

    return () => unsubscribe();
  }, []);

  return avatarUrl;
}
