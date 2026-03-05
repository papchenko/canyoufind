import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import Webcam from "react-webcam";
import L from "leaflet"; 

import { auth, db } from "../../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  increment,
  collection,
  deleteDoc,
} from "firebase/firestore";

import multyplayerImg from "../../../assets/multiplay-mode.png";
import Animation from "../../animation/Animation";
import useUserAvatar from "../../../avatar/useUserAvatar";
import { createUserIcon } from "../../../avatar/userIcon";

import useUserData from "../hooks/useUserData";

import "./multiplayer-mode.scss";

const secretPlace = { lat: 50.9028939, lng: 34.8328359 };
const winRadius = 300; // radius
const correctCode = "CYF09SDG11";
const lockPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
const gameDuration = 35 * 60 * 1000; // 35 min
const MAX_PLAYERS = 3;

const formatMs = (ms) => {
  if (!ms || ms <= 0) return "0s";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hrs = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const secs = Math.floor((ms % (60 * 1000)) / 1000);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

const MultiplayerMode = () => {

  const [userPosition, setUserPosition] = useState(null);
  const [secretVisible, setSecretVisible] = useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [showRules, setShowRules] = useState(false);


  
  const arRadius = 3; // 3 meters

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const posObj = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPosition(posObj);
        setSecretVisible(
          getDistance(
            posObj.lat,
            posObj.lng,
            secretPlace.lat,
            secretPlace.lng
          ) <= arRadius
        );
      },
      (err) => console.error("Geo error:", err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleQuestionClick = () => {
    setCodeInput(correctCode);
    setCodeRevealed(true);
    setSecretVisible(false);
  };


  const [players, setPlayers] = useState([]);
  const [gameData, setGameData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [locations, setLocations] = useState([]);
  const [codeInput, setCodeInput] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [userLockUntil, setUserLockUntil] = useState(0);
  const [userLockLeft, setUserLockLeft] = useState(0);



const userData = useUserData();
const avatarUrl = useUserAvatar();
  const mapRef = useRef(null);
  const prevPlayersRef = useRef([]);

  useEffect(() => {
    const ref = doc(db, "multiplayerGame", "active");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setGameData(data);
        setPlayers(data.players || []);
      } else {
        setDoc(ref, { players: [], isActive: false, winnerUid: null, gameStartTime: 0 });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const locCol = collection(db, "usersLocations");
    const unsub = onSnapshot(locCol, (snap) => {
      const arr = snap.docs.map((d) => d.data());
      setLocations(arr);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) {
      setUserLockUntil(0);
      return;
    }
    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      setUserLockUntil(data.lockUntil ? Number(data.lockUntil) : 0);
    });
    return () => unsub();
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    if (!gameData) return;
    const tick = () => {
      const now = Date.now();
      if (gameData.gameStartTime && gameData.gameStartTime > now) {
        setGameStarted(false);
        setTimeLeft(gameData.gameStartTime - now);
      } else if (gameData.gameStartTime && gameData.gameStartTime + gameDuration > now) {
        setGameStarted(true);
        setTimeLeft(gameData.gameStartTime + gameDuration - now);
      } else {
        setGameStarted(false);
        setTimeLeft(0);
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [gameData]);

  useEffect(() => {
    const tick = () => {
      const left = userLockUntil && userLockUntil > Date.now() ? userLockUntil - Date.now() : 0;
      setUserLockLeft(left);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [userLockUntil]);

  useEffect(() => {
    if (!gameData) return;
    const now = Date.now();
    if (gameData.isActive && gameData.gameStartTime && gameData.gameStartTime + gameDuration <= now) {
      (async () => {
        try {
          const gameRef = doc(db, "multiplayerGame", "active");
          const gSnap = await getDoc(gameRef);
          if (!gSnap.exists()) return;
          const g = gSnap.data();
          if (!g.isActive) return;

          await updateDoc(gameRef, { isActive: false, winnerUid: null, players: [], gameStartTime: 0 });

          if (auth.currentUser && g.players.some(p => p.uid === auth.currentUser.uid)) {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, { lockUntil: Date.now() + lockPeriod });
          }

          toast.info("Time is up! Participants are locked for 30 days.");
        } catch (err) {
          console.error("Error ending game on timeout:", err);
        }
      })();
    }
  }, [gameData]);

  useEffect(() => {
    const prev = prevPlayersRef.current || [];
    const prevUids = new Set(prev.map((p) => p.uid));
    const currUids = new Set(players.map((p) => p.uid));
    for (const p of prev) {
      if (!currUids.has(p.uid)) {
        toast.info(`${p.name} left the game`);
      }
    }
    prevPlayersRef.current = players;
  }, [players]);

  useEffect(() => {
    if (!auth.currentUser || !navigator.geolocation) return;
    const updateUserLocation = async (lat, lng) => {
      const userRef = doc(db, "usersLocations", auth.currentUser.uid);
      await setDoc(
        userRef,
        {
          uid: auth.currentUser.uid,
          lat,
          lng,
          name: userData?.username || "Player",
          avatarUrl: auth.currentUser.photoURL || avatarUrl,
        },
        { merge: true }
      );
    };
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateUserLocation(latitude, longitude);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [avatarUrl]);

    const handleRegister = async () => {
    if (!auth.currentUser) return toast.error("Please log in to start the registration!");
    const user = auth.currentUser;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const udata = userSnap.data();
        if (udata.lockUntil && udata.lockUntil > Date.now()) {
          return toast.error(`You are locked for ${formatMs(udata.lockUntil - Date.now())}`);
        }
      }
    } catch (err) {
      console.error(err);
    }

    setShowRules(true);
  };
  const confirmRegister = async () => {
    const user = auth.currentUser;
    const gameRef = doc(db, "multiplayerGame", "active");
    const snap = await getDoc(gameRef);

    if (snap.exists()) {
      const data = snap.data();
      if ((data.players || []).find((p) => p.uid === user.uid))
        return toast.info("Already registered");
      if ((data.players || []).length >= MAX_PLAYERS)
        return toast.error("Game already full");

      await updateDoc(gameRef, {
        players: arrayUnion({
          uid: user.uid,
          name: userData?.username || "Player", 
          avatarUrl: user.photoURL || avatarUrl,
        }),
      });

      if ((data.players || []).length + 1 === MAX_PLAYERS) {
        await updateDoc(gameRef, {
          gameStartTime: Date.now() + 24 * 60 * 60 * 1000,
          isActive: true,
          winnerUid: null,
        });
      }
    } else {
      await setDoc(gameRef, {
        players: [{ uid: user.uid, name: userData?.username || "Player", avatarUrl: avatarUrl || user.photoURL }],

        isActive: false,
        winnerUid: null,
        gameStartTime: 0,
      });
    }

    toast.success("Registered for the race");
    setShowRules(false);
  };

  const handleLeave = async (uid = auth.currentUser?.uid) => {
    if (!uid) return;
    try {
      const gameRef = doc(db, "multiplayerGame", "active");
      const gSnap = await getDoc(gameRef);
      if (!gSnap.exists()) return;
      const g = gSnap.data();
      const newPlayers = (g.players || []).filter((p) => p.uid !== uid);
      await updateDoc(gameRef, { players: newPlayers });

      if (auth.currentUser && auth.currentUser.uid === uid) {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, { lockUntil: Date.now() + lockPeriod });
      }

      await deleteDoc(doc(db, "usersLocations", uid)).catch(() => {});
      if (uid === auth.currentUser?.uid) toast.info("You left the game");
    } catch (err) {
      console.error(err);
      toast.error("Error leaving the game");
    }
  };

  const declareWinner = async (uid) => {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      return toast.error("Cannot declare winner for other users");
    }

    try {
      const gameRef = doc(db, "multiplayerGame", "active");
      const gSnap = await getDoc(gameRef);
      if (!gSnap.exists()) return;
      const data = gSnap.data();
      if (data.winnerUid) return toast.info("Bonus already taken");

      await updateDoc(gameRef, { winnerUid: uid, isActive: false, players: [], gameStartTime: 0 });

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { lockUntil: Date.now() + lockPeriod, cyfCoins: increment(1) });

      toast.success("You won! +1 CYF Coin");
    } catch (err) {
      console.error(err);
      toast.error("Error declaring winner");
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return toast.error("Login required");
    if (codeInput.trim().toUpperCase() !== correctCode) return toast.error("Wrong code!");
    await declareWinner(auth.currentUser.uid);
  };

  const isRegistered = auth.currentUser && players.some((p) => p.uid === auth.currentUser.uid);
  const userIsLocked = userLockUntil && Number(userLockUntil) > Date.now();


  return (
    <section className="gravity-anomalies section">
      <div className="gravity__title section__title">
        <Animation fadeOnly duration={0.8} delay={0.2}>
          <span>Multiplayer</span>
        </Animation>
        <Animation direction="up" duration={0.8} delay={0.2}>
          <h1>Find the secret place first!</h1>
        </Animation>
          <div className="multyplayer__subtitle">
            <Animation direction="up" duration={0.8} delay={0.3}>
              <p>This is a multiplayer adventure mode where players compete to find secret locations in the real world. The first person to enter the correct code will receive +1 CYF coin.</p>
            </Animation>
          </div>
      </div>

      <div className="multyplayer-content">
        {!gameStarted ? (
          <>
            <img src={multyplayerImg} alt="Image" className="multyplayer-img pb-5" id="animatopDown" />
            {gameData?.isActive ? (
              <p className="text-danger fw-bold">Wait for the start to begin to join the search for the secret location.</p>
            ) : userIsLocked ? (
              <div>
                <p className="text-danger fw-bold">You are blocked from joining for 30 days</p>
                <p>Time left: {formatMs(userLockLeft)}</p>
              </div>
            ) : (
              !isRegistered && (
              !auth.currentUser ? (
                <p className="puls-anim btn-centered" style={{ color: "#fb8500", fontWeight: "bold" }}>
                  Please log in to start the registration!
                </p>
              ) : (
                <button
                  className="btn btn-mode btn-centered"
                  onClick={handleRegister}
                  disabled={players.length >= MAX_PLAYERS}
                >
                  Register Me !
                </button>
              )
            )
            )}
            {players.length > 0 && (
              <div className="registered-list my-3">
                <h4 className="fw-bold text-primary mb-2">
                  Registered players: {players.length}/{MAX_PLAYERS}
                </h4>
                <ul className="list-unstyled d-flex flex-wrap gap-3">
                  {players.map((p) => (
                    <li
                      key={p.uid}
                      className="d-flex align-items-center gap-2 border rounded px-3 py-2 shadow-sm"
                    >
                      <img
                        src={p.avatarUrl || "/default-avatar.png"}
                        alt={p.name}
                        style={{ width: 32, height: 32, borderRadius: "50%" }}
                      />
                      <span className="fw-semibold">{p.name}</span>
                      {auth.currentUser?.uid === p.uid && (
                        <button
                          className="btn btn-sm btn-outline-secondary ms-2"
                          onClick={() => handleLeave(p.uid)}
                        >
                          Leave
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* {players.length === MAX_PLAYERS && (
              <div>
                {timeLeft > 0 ? (
                  <p>
                    Game starts in: {Math.floor(timeLeft / 1000 / 60)}m{" "}
                    {Math.floor((timeLeft / 1000) % 60)}s
                  </p>
                ) : (
                  <p>Waiting for start...</p>
                )}
              </div>
            )} */}
            {players.length === MAX_PLAYERS && (
              <div>
                {timeLeft > 0 ? (
                  <p>
                    Game starts in: {formatMs(timeLeft)}
                  </p>
                ) : (
                  <p>Waiting for start...</p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {gameData?.isActive && (
              <div style={{ marginTop: 12 }}>
                {gameData.winnerUid ? (
                  <div>
                    {gameData.winnerUid === auth.currentUser?.uid ? (
                      <p className="text-success fw-bold">🎉 You won! +1 CYF Coin</p>
                    ) : (
                      <p className="text-danger fw-bold">You lost. Someone else was faster.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ position: "relative", width: "100%", height: "300px", marginBottom: "20px" }}>
                      <Webcam
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
                      />

                      {secretVisible && !codeRevealed && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            fontSize: "160px",
                            fontWeight: "bold",
                            color: "#fd5200",
                            textShadow: "0 0 20px white",
                            animation: "pulse 1s infinite",
                            cursor: "pointer"
                          }}
                          onClick={handleQuestionClick}
                        >
                          !
                        </div>
                      )}
                      {codeRevealed && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%) scale(0)",
                            fontSize: "36px",
                            fontWeight: "bold",
                            color: "white",
                            backgroundColor: "rgba(0,0,0,0.5)",
                            padding: "10px 20px",
                            borderRadius: "10px",
                            animation: "scaleIn 0.5s forwards"
                          }}
                        >
                          {correctCode}
                        </div>
                      )}
                    </div>
                    <style>{`
                      @keyframes pulse {
                        0% { transform: translate(-50%, -50%) scale(1); }
                        50% { transform: translate(-50%, -50%) scale(1.1); }
                        100% { transform: translate(-50%, -50%) scale(1); }
                      }
                      @keyframes scaleIn {
                        0% { transform: translate(-50%, -50%) scale(0); }
                        100% { transform: translate(-50%, -50%) scale(1); }
                      }
                    `}</style>
                    <MapContainer
                      center={[secretPlace.lat, secretPlace.lng]}
                      zoom={14}
                      style={{ height: "60vh", width: "100%", borderRadius: 12 }}
                      whenCreated={(map) => (mapRef.current = map)}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Circle
                        center={[secretPlace.lat, secretPlace.lng]}
                        radius={winRadius}
                        pathOptions={{ color: "orange", fillColor: "orange", fillOpacity: 0.3 }}
                      />
                      {locations.map((loc) => (
                        <Marker
                          key={loc.uid}
                          position={[loc.lat, loc.lng]}
                          icon={createUserIcon(
                            loc.uid === auth.currentUser?.uid
                              ? userData?.username || "Player"
                              : loc.name || "Player",
                            loc.uid === auth.currentUser?.uid
                              ? avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                              : loc.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          )}
                        />
                      ))}
                    </MapContainer>
                    <p className="mt-3 text-center fw-bold">
                      Time left: {Math.floor(timeLeft / 1000 / 60)}m{" "}
                      {Math.floor((timeLeft / 1000) % 60)}s
                    </p>
                    <form onSubmit={handleSubmitCode} className="multiplay-form mt-3">
                      <input
                        type="text"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        placeholder="Enter the secret code"
                        className="mb-2 form__input"
                      />
                      <button type="submit" className="btn enter-btn" style={{color: "#fd5200"}}>
                        Enter Code
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {showRules && (
        <div className="popup-overlay">
          <div className="btn-modal" style={{ position: "relative" }}>
            <button className="close-modal-mode" onClick={() => setShowRules(false)}>
              &times;
            </button>
            <h3 style={{ color: "#598392", opacity: "0.4" }}>Multiplayer Rules:</h3>
            <ul>
              <li>Maximum 3 players can join the race.</li>
              <li>The game starts automatically once all players are registered.</li>
              <li>You have 35 minutes to find the secret location.</li>
              <li>Use the AR view to reveal the secret code when near the location.</li>
              <li>Enter the correct code first to win +1 CYF Coin.</li>
              <li>Leaving the game or failing locks your account for 30 days.</li>
              <li>Only one winner per game session.</li>
            </ul>
            <button className="btn btn-primary" onClick={confirmRegister}>
              Accept & Join
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default MultiplayerMode;