import { useState, useEffect } from "react";
import { db, auth } from "../../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function useCoinUnlock() {
  const [coins, setCoins] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchCoins = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setCoins(snap.data().cyfCoins || 0);
        }
      } catch (err) {
        console.error("Failed to fetch coins:", err);
      }
    };
    fetchCoins();
  }, [user]);

  const unlockWithCoins = async (cost = 1, onSuccess) => {
    if (!user) {
      toast.error("You must be logged in!");
      return;
    }

    if (coins < cost) {
      toast.error("Not enough CYF Coins");
      return;
    }

    const newBalance = coins - cost;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { cyfCoins: newBalance });
      setCoins(newBalance);

      toast.success(`Secret location unlocked! -${cost} Coins`);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Failed to update coins in database");
      console.error(err);
    }
  };

  return { coins, unlockWithCoins };
}