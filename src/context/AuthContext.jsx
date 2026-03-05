import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";

const AuthContext = createContext(null);

async function ensureUserDoc(user, name = null) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const role = user.email === "cadmin@gmail.com" ? "admin" : "user";
    await setDoc(ref, {
      cyfCoins: 0,
      username: name || user.displayName || user.email,
      lockUntil: 0,
      email: user.email || null,
      role,
      createdAt: serverTimestamp(),
    });
    return 0;
  } else {
    const data = snap.data();
    const updates = {};
    if (data.lockUntil === undefined) updates.lockUntil = 0;
    if (data.role === undefined) updates.role = user.email === "cadmin@gmail.com" ? "admin" : "user";
    if (Object.keys(updates).length) await updateDoc(ref, updates);
    return data?.cyfCoins ?? 0;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cyfCoins, setCyfCoins] = useState(0);
  const [userName, setUserName] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const coinsUnsubRef = useRef(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (coinsUnsubRef.current) {
        coinsUnsubRef.current();
        coinsUnsubRef.current = null;
      }

      if (fbUser) {
        const ref = doc(db, "users", fbUser.uid);

        coinsUnsubRef.current = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setCyfCoins(data?.cyfCoins ?? 0);
            setUserName(data?.username || fbUser.displayName || fbUser.email || "User");
            setAvatarUrl(data?.avatarUrl || null);

            setUser({
              ...fbUser,
              role: data?.role || (fbUser.email === "cadmin@gmail.com" ? "admin" : "user"),
            });
          } else {
            setCyfCoins(0);
            setUserName(fbUser.displayName || fbUser.email || "User");
            setAvatarUrl(null);
            setUser({ ...fbUser, role: fbUser.email === "cadmin@gmail.com" ? "admin" : "user" });
          }
        });
      } else {
        setUser(null);
        setCyfCoins(0);
        setUserName("User");
      }
      setLoading(false);
    });

    return () => {
      if (coinsUnsubRef.current) coinsUnsubRef.current();
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) await ensureUserDoc(res.user);
      } catch {}
    })();
  }, []);

  const api = useMemo(() => {
    return {
      user,
      role: user?.role || "user",
      isLoggedIn: !!user,
      userName,
      cyfCoins,
      avatarUrl,
      loading,

      async signUp(name, email, password) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });

        const role = email === "cadmin@gmail.com" ? "admin" : "user";

        await setDoc(doc(db, "users", cred.user.uid), {
          cyfCoins: 0,
          username: name,
          email,
          lockUntil: 0,
          role,
          createdAt: serverTimestamp(),
        });

        // await addDoc(collection(db, "notifications"), {
        //   userId: cred.user.uid,
        //   title: "👋 Welcome!",
        //   message: `Hi ${name || email}! Welcome to CanYouFind — have fun!`,
        //   createdAt: serverTimestamp(),
        //   read: false,
        // });

        return cred.user;
      },

      async signIn(email, password) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await ensureUserDoc(cred.user);
        return cred.user;
      },

      async googleSignIn() {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        try {
          const res = await signInWithPopup(auth, provider);
          await ensureUserDoc(res.user);
          return res.user;
        } catch (error) {
          if (
            error?.code === "auth/popup-blocked" ||
            error?.code === "auth/operation-not-supported-in-this-environment"
          ) {
            await signInWithRedirect(auth, provider);
            return null;
          }
          if (error?.code === "auth/popup-closed-by-user") return null;
          throw error;
        }
      },

      async signOut() {
        await signOut(auth);
      },
    };
  }, [user, cyfCoins, userName, avatarUrl, loading]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}