import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { HiPlusSm, HiMinusSm } from "react-icons/hi";
import { auth, db } from "../../../firebase";
import { doc, updateDoc, increment, onSnapshot } from "firebase/firestore";

import Animation from "../../animation/Animation";

import useUserAvatar from "../../../avatar/useUserAvatar";
import { createUserIcon } from "../../../avatar/userIcon";

import weeklyImg from '../../../assets/weekly-bonus.png';

import useUserData from "../hooks/useUserData";

import "./weeklybonus.scss";

const AutoResizeMap = ({ mapRef }) => {
  const map = useMap();
  useEffect(() => {
    if (mapRef.current) setTimeout(() => map.invalidateSize(), 200);
  }, [map, mapRef]);
  return null;
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

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const deg2rad = (deg) => deg * (Math.PI / 180);
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const LOCAL_KEY = "weeklyBonusState_v2";

const WeeklyBonus = () => {
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [started, setStarted] = useState(false);
  const [found, setFound] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [blockText, setBlockText] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [weeklyFoundText, setWeeklyFoundText] = useState("You did not find the bonus yet");

  const [startedExpiresAt, setStartedExpiresAt] = useState(null);
  const [blockedUntilAt, setBlockedUntilAt] = useState(null);

  const mapRef = useRef(null);
  const foundRef = useRef(false);
  const watchIdRef = useRef(null);
  const hasCenteredRef = useRef(false);
  const timerRef = useRef(null);
  const localStateRef = useRef(null);

const [avatarUrl, setAvatarUrl] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");

useEffect(() => {
  const unsubscribeAuth = auth.onAuthStateChanged((u) => {
    if (!u) {
      setAvatarUrl("https://cdn-icons-png.flaticon.com/512/149/149071.png");
      return;
    }
    const userRef = doc(db, "users", u.uid);
    const unsubscribeSnap = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAvatarUrl(data.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png");
      }
    });
    return () => unsubscribeSnap();
  });
  return () => unsubscribeAuth();
}, []);

  const locations = [
    { lat: 50.894729511063474, lng: 34.800078075402155, correct: true },
    { lat: 50.90551499603709, lng: 34.826550767399745, correct: false },
    { lat: 50.908891098011296, lng: 34.79549824922208, correct: false },
  ];

  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(LOCAL_KEY);
      if (!savedRaw) return;
      const data = JSON.parse(savedRaw || "{}");
      localStateRef.current = data;
      const now = Date.now();

      if (data.blockedUntilAt && data.blockedUntilAt > now) {
        setBlocked(true);
        setBlockedUntilAt(data.blockedUntilAt);
        setCountdown(data.blockedUntilAt - now);
        setFound(!!data.found);
        setWeeklyFoundText(
          data.found ? "You have already found the bonus" : data.weeklyFoundText || "You did not find the bonus yet"
        );
        setBlockText(
          data.blockText ||
            (data.found
              ? "You already found the secret location! Wait 7 days for a new bonus."
              : "Time’s up! Wait 7 days for a new secret location.")
        );
        setStarted(false);
        setStartedExpiresAt(null);
        return;
      }

      if (data.startedExpiresAt && data.startedExpiresAt > now) {
        setStarted(true);
        setStartedExpiresAt(data.startedExpiresAt);
        setCountdown(data.startedExpiresAt - now);
        setFound(!!data.found);
        setWeeklyFoundText(data.weeklyFoundText || "You did not find the bonus yet");
        setBlocked(false);
        setBlockedUntilAt(null);
        setBlockText("");
        return;
      }

      localStorage.removeItem(LOCAL_KEY);
      localStateRef.current = null;
    } catch (e) {
      console.error("Failed to parse local state", e);
    }
  }, []);

  useEffect(() => {
    const toSave = {
      started: !!started,
      found: !!found,
      startedExpiresAt: startedExpiresAt || null,
      blocked: !!blocked,
      blockedUntilAt: blockedUntilAt || null,
      blockText: blockText || "",
      weeklyFoundText: weeklyFoundText || "",
      userLocation: userLocation || null,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(toSave));
      localStateRef.current = toSave;
    } catch (e) {
      console.error("Failed to save weekly bonus state", e);
    }
  }, [started, startedExpiresAt, found, blocked, blockedUntilAt, blockText, weeklyFoundText, userLocation]);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, "users", u.uid);
        const unsubSnapshot = onSnapshot(userRef, (docSnap) => {
          if (!docSnap.exists()) return;
          const data = docSnap.data();
          let serverLocked = null;
          if (data.weeklyBonusLockedUntil) {
            if (typeof data.weeklyBonusLockedUntil.toDate === "function") {
              serverLocked = data.weeklyBonusLockedUntil.toDate().getTime();
            } else if (typeof data.weeklyBonusLockedUntil === "number") {
              serverLocked = data.weeklyBonusLockedUntil;
            } else {
              const tmp = new Date(data.weeklyBonusLockedUntil);
              if (!isNaN(tmp.getTime())) serverLocked = tmp.getTime();
            }
          }
          const hasFound = !!data.weeklyFound;
          const now = Date.now();
          const local = localStateRef.current;

          if (local && local.startedExpiresAt && local.startedExpiresAt > now) {
            if (local.blockedUntilAt && local.blockedUntilAt > now) {
              return;
            }
            if (serverLocked && serverLocked > now) {
              setBlocked(true);
              setBlockedUntilAt(serverLocked);
              setCountdown(serverLocked - now);
              setFound(hasFound);
              setWeeklyFoundText(hasFound ? "You have already found the bonus" : "You did not find the bonus yet");
              setBlockText(
                hasFound
                  ? "You already found the secret location! Wait 7 days for a new bonus."
                  : "Time’s up! Wait 7 days for a new secret location."
              );
              setStarted(false);
              setStartedExpiresAt(null);
            }
          } else {
            if (serverLocked && serverLocked > now) {
              setBlocked(true);
              setBlockedUntilAt(serverLocked);
              setCountdown(serverLocked - now);
              setFound(hasFound);
              setWeeklyFoundText(hasFound ? "You have already found the bonus" : "You did not find the bonus yet");
              setBlockText(
                hasFound
                  ? "You already found the secret location! Wait 7 days for a new bonus."
                  : "Time’s up! Wait 7 days for a new secret location."
              );
              setStarted(false);
              setStartedExpiresAt(null);
            } else {
              setBlocked(false);
              setBlockedUntilAt(null);
              setFound(hasFound);
              setWeeklyFoundText(hasFound ? "You have already found the bonus" : "You did not find the bonus yet");
              setBlockText("");
              if (
                local &&
                ((local.blockedUntilAt && local.blockedUntilAt <= now) ||
                  (local.startedExpiresAt && local.startedExpiresAt <= now))
              ) {
                localStorage.removeItem(LOCAL_KEY);
                localStateRef.current = null;
              }
            }
          }
        });
        return () => unsubSnapshot();
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
  if (!started || blocked) return;
  if (!navigator.geolocation) {
    toast.error("Geolocation not supported.");
    return;
  }

  hasCenteredRef.current = false;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
      setUserLocation(pos);

      if (mapRef.current && !hasCenteredRef.current) {
        mapRef.current.setView([pos.lat, pos.lng], mapRef.current.getZoom());
        hasCenteredRef.current = true;
      }
    },
    (error) => {
      toast.error("Cannot get initial location: " + error.message);
    },
    { enableHighAccuracy: true, timeout: 15000 }
  );

  watchIdRef.current = navigator.geolocation.watchPosition(
    (position) => {
      const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
      setUserLocation(pos);

      if (!hasCenteredRef.current && mapRef.current) {
        mapRef.current.setView([pos.lat, pos.lng], mapRef.current.getZoom());
        hasCenteredRef.current = true;
      }

      if (!foundRef.current) {
        for (let loc of locations) {
          const distance = getDistanceFromLatLonInM(pos.lat, pos.lng, loc.lat, loc.lng);
          if (distance <= 100) {
            if (loc.correct) handleSuccess();
            else toast.info("This is a trap! Try another location.");
          }
        }
      }
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          toast.error("Permission to access location was denied.");
          break;
        case error.POSITION_UNAVAILABLE:
          toast.error("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          toast.warn("Could not update location in time, still watching...");
          break;
        default:
          toast.error("An unknown geolocation error occurred.");
      }
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  );

  return () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };
}, [started, blocked]);


  useEffect(() => {
    if (!countdown || countdown <= 0) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (!prev) return 0;
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleTimeout();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [countdown]);

  const startBonus = () => {
    const expires = Date.now() + 25 * 60 * 1000;
    setStarted(true);
    setFound(false);
    foundRef.current = false;
    setStartedExpiresAt(expires);
    setCountdown(expires - Date.now());
    setShowRules(false);
    setBlocked(false);
    setBlockedUntilAt(null);
    setBlockText("");
    setWeeklyFoundText("You did not find the bonus yet");
  };

  const handleSuccess = async () => {
    if (foundRef.current) return;
    foundRef.current = true;
    setFound(true);
    setStarted(false);
    setStartedExpiresAt(null);
    setBlocked(true);

    const blockUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    setBlockedUntilAt(blockUntil);
    setCountdown(blockUntil - Date.now());
    setBlockText("You already found the secret location! Wait 7 days for a new bonus.");
    setWeeklyFoundText("You have already found the bonus");

    try {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          cyfCoins: increment(1),
          weeklyBonusLockedUntil: new Date(blockUntil),
          weeklyFound: true,
        });
      }
      toast.success("You found the secret location! +1 CYF Coin");
    } catch (err) {
      console.error(err);
      toast.error("Error updating Firestore.");
    }
  };

  const handleTimeout = async () => {
    const now = Date.now();

    if (blockedUntilAt && blockedUntilAt <= now) {
      setBlocked(false);
      setBlockedUntilAt(null);
      setCountdown(null);
      setBlockText("");
      setWeeklyFoundText(found ? "You have already found the bonus" : "You did not find the bonus yet");
      try {
        localStorage.removeItem(LOCAL_KEY);
        localStateRef.current = null;
      } catch (e) {}
      return;
    }

    const blockUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    setStarted(false);
    setStartedExpiresAt(null);
    setBlocked(true);
    setBlockedUntilAt(blockUntil);
    setCountdown(blockUntil - Date.now());
    setBlockText("Time’s up! Wait 7 days for a new secret location.");
    setWeeklyFoundText("You did not find the bonus yet");
    setFound(false);
    foundRef.current = false;

    try {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          weeklyBonusLockedUntil: new Date(blockUntil),
          weeklyFound: false,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating Firestore.");
    }
  };

  const formatTimeDetailed = (ms) => {
    if (!ms || ms <= 0) return "0d 00:00:00";
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hrs = Math.floor((totalSec % 86400) / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    return `${days}d ${hrs.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const userData = useUserData();

  return (
    <div className="weekly-bonus section">
      <div className="weekly__title section__title">
        <Animation fadeOnly duration={0.8} delay={0.2}>
          <span>
            Weekly Bonus{" "}
            <i className="ri-flask-line" style={{ color: "#fd5200" }}></i>{" "}
            <p className="fs-6" style={{ color: "#598392" }}>Updated every week!</p>
          </span>
        </Animation>
        <Animation direction="up" duration={0.8} delay={0.2}>
          <h1>Which one is real? Don't fall into the traps!</h1>
        </Animation>
          <div className="weekly__subtitle">
            <Animation direction="up" duration={0.8} delay={0.3}>
              <p>You are given 3 locations. One of them is real, entering which you will receive a CYFCoin. The others are traps.</p>
            </Animation>
          </div>
      </div>
      
      <div className="weekly-col">
      {(!started || blocked) && (
        <>
          <img 
            src={weeklyImg} 
            alt="Image" 
            className="weekly-img pb-4" 
            id="animatopDown" 
            />

        </>
      )}
        {!user && (
          <p className="puls-anim" style={{ color: "#fb8500", fontWeight: "bold", margin: "0 auto" }}>
            Please log in to receive the bonus!
          </p>
        )}
        {user && <p style={{ margin: "20px auto", fontWeight: "bold" }}>{weeklyFoundText}</p>}
        {user && !started && !blocked && (
          <button className="btn btn-mode btn-centered" onClick={() => setShowRules(true)}>
            Get Bonus
          </button>
        )}
        {started && !blocked && (
          <div className="w-100" style={{ position: "relative" }}>
            <MapContainer
              center={[50.9071, 34.8067]}
              zoom={14}
              style={{ height: "60vh", width: "100%", borderRadius: "12px" }}
              whenCreated={(map) => (mapRef.current = map)}
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {locations.map((loc, i) => (
                <Circle
                  key={i}
                  center={[loc.lat, loc.lng]}
                  radius={120}
                  pathOptions={{ color: "orange", fillColor: "orange", fillOpacity: 0.3 }}
                />
              ))}
              {userLocation && auth.currentUser && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={createUserIcon(
                  userData?.username || user.displayName || "Player",
                  avatarUrl || user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  )}
                />
              )}
              <AutoResizeMap mapRef={mapRef} />
              <ZoomControls />
            </MapContainer>
            <div className="timer-box" style={{ marginTop: "10px" }}>
              ⏱ {formatTimeDetailed(countdown)}
            </div>
          </div>
        )}
        {blocked && (
          <div style={{ marginTop: "15px" }}>
            <p style={{ fontWeight: "bold", color: "#fb8500" }}>{blockText}</p>
            <div className="timer-box" style={{ marginTop: "10px" }}>
              ⏱ {formatTimeDetailed(countdown)}
            </div>
          </div>
        )}
          {showRules && (
            <div className="popup-overlay">
              <div className="btn-modal" style={{ position: "relative" }}>
                <button className="close-modal-mode" onClick={() => setShowRules(false)}>&times;</button>
                <h3 style={{color: "#598392", opacity: "0.4"}}>Weekly Bonus Rules:</h3>
                <ul>
                  <li>You have 25 minutes to find the secret location.</li>
                  <li>If you fail, your account will be blocked from playing for 7 days.</li>
                  <li>Finding the secret location gives you +1 CYF Coin.</li>
                  <li>Only one attempt per week is allowed.</li>
                </ul>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    startBonus();
                    setShowRules(false);
                  }}
                >
                  Start
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default WeeklyBonus;