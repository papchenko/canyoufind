import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const SeasonContext = createContext();

export const useSeason = () => useContext(SeasonContext);

export const SeasonProvider = ({ children }) => {
  const [spam] = useState("Season");
  const [r, setR] = useState("Mysterious places");

  const season = `${spam} ${r}`;

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.season) {
          const parts = data.season.split(" ");
          if (parts.length > 1) {
            setR(parts.slice(1).join(" "));
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const setSeason = async (newR) => {
    setR(newR);
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { season: `${spam} ${newR}` }).catch(console.error);
    }
  };

  return (
    <SeasonContext.Provider value={{ season, spam, r, setSeason }}>
      {children}
    </SeasonContext.Provider>
  );
};