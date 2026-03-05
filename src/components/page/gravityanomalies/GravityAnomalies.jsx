import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import { HiPlusSm, HiMinusSm } from "react-icons/hi";
import { auth, db } from "../../../firebase";
import { doc, updateDoc, increment, getDoc, onSnapshot } from "firebase/firestore";

import gravityImg from "../../../assets/gravity-anomalies.png";
import Animation from "../../animation/Animation";

import { createUserIcon } from "../../../avatar/userIcon";

import useUserData from "../hooks/useUserData";

import "./gravityanomalies.scss";

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function ZoomControls() {
  const map = useMap();
  return (
    <div style={{ position: "absolute", top: 10, left: 15, zIndex: 1000 }}>
      <button className="zoom-nav" onClick={() => map.setZoom(map.getZoom() + 1)}>
        <HiPlusSm className="zoom-nav-icon" />
      </button>
      <button className="zoom-nav" onClick={() => map.setZoom(map.getZoom() - 1)}>
        <HiMinusSm className="zoom-nav-icon" />
      </button>
    </div>
  );
}

const GravityAnomalies = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");
  const watchIdRef = useRef(null);
  const [showRules, setShowRules] = useState(false);

  const successRef = useRef(false);
  const shownTrapsRef = useRef(new Set());

  const anomalyCoords = [
    { lat: 50.905937395255094, lng: 34.827258786888564 },
    { lat: 50.906335780448934, lng: 34.82934962198371 },
    { lat: 50.90682901453688, lng: 34.831997010305614 },
    { lat: 50.906335780448934, lng: 34.834223223212675, correct: true },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setAvatarUrl("https://cdn-icons-png.flaticon.com/512/149/149071.png");
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const unsubscribeAvatar = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
          } else {
            setAvatarUrl("https://cdn-icons-png.flaticon.com/512/149/149071.png");
          }
        } else {
          setAvatarUrl("https://cdn-icons-png.flaticon.com/512/149/149071.png");
        }
      },
      (err) => {
        console.error("avatar onSnapshot error:", err);
      }
    );
    return () => unsubscribeAvatar();
  }, [user]);

  useEffect(() => {
    const checkLock = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.lockUntil && data.lockUntil > Date.now()) {
            const remaining = Math.floor((data.lockUntil - Date.now()) / 1000);
            setCooldown(remaining);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkLock();
  }, [user]);

  const startGame = async () => {
    if (!user) {
      toast.error("Please log in to start the game!");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data.lockUntil && data.lockUntil > Date.now()) {
          const remaining = Math.floor((data.lockUntil - Date.now()) / 1000);
          setCooldown(remaining);
          toast.error("Your account is locked for 30 days after the last attempt!");
          return;
        }
      }

      const lockUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await updateDoc(userRef, { lockUntil });

      const now = Date.now();
      localStorage.setItem("gravityAnomalyStart", now);
      localStorage.removeItem("gravityAnomalyCooldown");
      setTimeLeft(900); // 15 min
      setCooldown(0);
      setCurrentIndex(0);
      successRef.current = false;
      shownTrapsRef.current.clear();
    } catch (err) {
      console.error(err);
      toast.error("Error starting the game");
    }
  };

  useEffect(() => {
    const start = localStorage.getItem("gravityAnomalyStart");
    const cd = localStorage.getItem("gravityAnomalyCooldown");

    if (cd) {
      const remaining = Math.floor((parseInt(cd) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
        return;
      } else {
        localStorage.removeItem("gravityAnomalyCooldown");
      }
    }

    if (start) {
      const passed = Math.floor((Date.now() - parseInt(start)) / 1000);
      if (passed < 900) {
        setTimeLeft(900 - passed);
        setCurrentIndex(Math.min(Math.floor(passed / 60), 3));
      } else {
        const lockUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem("gravityAnomalyCooldown", lockUntil);
        setCooldown(30 * 24 * 60 * 60);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft((t) => t - 1);
        setCurrentIndex((i) => Math.min(3, Math.floor((900 - (timeLeft - 1)) / 60)));
      } else if (timeLeft === 0 && localStorage.getItem("gravityAnomalyStart")) {
        localStorage.removeItem("gravityAnomalyStart");
        const lockUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem("gravityAnomalyCooldown", lockUntil);
        setCooldown(30 * 24 * 60 * 60);
      }

      if (cooldown > 0) {
        setCooldown((c) => c - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, cooldown]);

  useEffect(() => {
    if (!navigator.geolocation || timeLeft <= 0) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);

        const target = anomalyCoords[currentIndex];
        if (!target) return;

        if (getDistance(coords.lat, coords.lng, target.lat, target.lng) <= 80) {
          if (target.correct && !successRef.current) {
            successRef.current = true;
            handleSuccess();
          } else if (!target.correct) {
            if (!shownTrapsRef.current.has(currentIndex)) {
              toast.warning("This is a gravitational anomaly! Get out of here quickly!");
              shownTrapsRef.current.add(currentIndex);
            }
          }
        }
      },
      () => toast.error("Cannot get location."),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [timeLeft, currentIndex]);

  const handleSuccess = async () => {
    toast.success(
      "You have overcome the gravitational anomalies and found a stable zone! You have been awarded +1 CYF Coin."
    );
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { cyfCoins: increment(1) });
      } catch (err) {
        console.error(err);
        toast.error("Error saving progress");
      }
    }

    localStorage.removeItem("gravityAnomalyStart");
    const lockUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem("gravityAnomalyCooldown", lockUntil);
    setCooldown(30 * 24 * 60 * 60);
    setTimeLeft(0);
  };

  const formatTime = (s) => {
    const d = Math.floor(s / (24 * 3600));
    const h = Math.floor((s % (24 * 3600)) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}d ${h}h ${m}m ${sec}s`;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  const userData = useUserData();

  return (
    <section className="gravity-anomalies section">
      <div className="gravity__title section__title">
        <Animation fadeOnly duration={0.8} delay={0.2}>
          <span>Gravity Anomalies</span>
        </Animation>
        <Animation direction="up" duration={0.8} delay={0.2}>
          <h1>Have you heard anything about anomalies?</h1>
        </Animation>
        <div className="rules__text-wrapper">
          <Animation direction="up" duration={0.8} delay={0.3}>
            <p>
              Secret locations shift across the map every minute, leaving traps. Memorize their path, track the real anomaly, and
              reach it before time runs out.
            </p>
          </Animation>
        </div>
      </div>

      <div className="gravity-content">
        {timeLeft <= 0 && <img src={gravityImg} alt="Image" className="gravity-img" id="animatopDown" />}

        {user ? (
          cooldown > 0 ? (
            <p>The field is locked! It will be available again in: {formatTime(cooldown)}</p>
          ) : timeLeft <= 0 ? (
            <button onClick={() => setShowRules(true)} className="btn btn-mode">
              Go Gravity!
            </button>
          ) : null
        ) : (
          <p className="puls-anim" style={{ color: "#fb8500", fontWeight: "bold" }}>
            Please log in to receive the bonus!
          </p>
        )}

        {timeLeft > 0 && (
          <>
            <MapContainer
              center={[anomalyCoords[currentIndex].lat, anomalyCoords[currentIndex].lng]}
              zoom={15}
              style={{ height: "60vh", width: "100%", borderRadius: "12px" }}
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {anomalyCoords.slice(0, currentIndex).map((trap, i) => (
                <Circle
                  key={`trap-${i}`}
                  center={[trap.lat, trap.lng]}
                  radius={80}
                  pathOptions={{
                    color: "red",
                    fillColor: "red",
                    fillOpacity: 0.25,
                  }}
                />
              ))}

              <Circle
                center={[anomalyCoords[currentIndex].lat, anomalyCoords[currentIndex].lng]}
                radius={100}
                pathOptions={{
                  color: "orange",
                  fillColor: "orange",
                  fillOpacity: 0.3,
                }}
              />

              {userLocation && user && avatarUrl && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={createUserIcon(
                  userData?.username || user.displayName || "Player",
                  avatarUrl || user.photoURL || "/default-avatar.png"
                  )}
                />
              )}

              <ZoomControls />
            </MapContainer>
            <p className="time-left">Time left: {formatTime(timeLeft)}</p>
          </>
        )}
      </div>

      {showRules && (
        <div className="popup-overlay">
          <div className="btn-modal" style={{ position: "relative" }}>
            <button className="close-modal-mode" onClick={() => setShowRules(false)}>
              &times;
            </button>
            <h3 style={{ color: "#598392", opacity: "0.4" }}>Gravity Anomalies Rules:</h3>
            <ul>
              <li>Time Limit – You have 15 minutes to find the correct anomaly.</li>
              <li>Moving Target – The anomaly changes position every 2 minute, leaving traps behind.</li>
              <li>Traps – Entering a wrong anomaly gives a warning.</li>
              <li>Victory – If you reach the final stable zone, you get +1 CYF Coin.</li>
              <li>Cooldown – After success or failure, the anomaly field locks for 30 days.</li>
            </ul>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowRules(false);
                startGame();
              }}
            >
              Start
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default GravityAnomalies;