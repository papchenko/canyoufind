import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALhF4qIXzfnDYRd58ENoFhnZV20v-ehKQ",
  authDomain: "canyoufind-auth.firebaseapp.com",
  projectId: "canyoufind-auth",
  storageBucket: "canyoufind-auth.appspot.com",
  messagingSenderId: "347535147466",
  appId: "1:347535147466:web:78af52aa94031f488acf33"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);