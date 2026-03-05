import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { doc, onSnapshot } from "firebase/firestore";

const useUserData = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let unsubSnap = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setUserData(null);
        if (unsubSnap) unsubSnap();
        return;
      }

      const ref = doc(db, "users", user.uid);
      unsubSnap = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          setUserData(snap.data());
        }
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnap) unsubSnap();
    };
  }, []);

  return userData;
};

export default useUserData;