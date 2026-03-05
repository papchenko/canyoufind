import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { doc, updateDoc } from "firebase/firestore";

import modeImg from "../../../assets/mode.png";

import Animation from "../../animation/Animation";

import QuestOne from "../quests/quest-one/QuestOne";
import QuestTwo from "../quests/quest-two/QuestTwo";
import QuestThree from "../quests/quest-three/QuestThree";
import FinalForm from "../quests/final/FinalForm";

import { MdTimer } from "react-icons/md";
import { AiOutlineStop } from "react-icons/ai";

import "./modes.scss";

const Modes = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lockTime, setLockTime] = useState(null);
  const [showRules, setShowRules] = useState(null); // "single" | "team" | null
  const [alreadyStarted, setAlreadyStarted] = useState(false);
  const [questStep, setQuestStep] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [penaltyCountdown, setPenaltyCountdown] = useState(null);
  const [mode, setMode] = useState(null); // "single" | "team" | null

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const savedStep = parseInt(localStorage.getItem("questStep") || "0", 10);
    const unlockTime = localStorage.getItem("questUnlockTime");
    const penaltyEnd = localStorage.getItem("penaltyEndTime");
    const savedMode = localStorage.getItem("questMode");

    setQuestStep(savedStep);
    if (savedMode) setMode(savedMode);

    if (unlockTime && new Date(unlockTime) > new Date()) {
      setCountdown(new Date(unlockTime) - Date.now());
    }
    if (penaltyEnd && new Date(penaltyEnd) > new Date()) {
      setPenaltyCountdown(new Date(penaltyEnd) - Date.now());
      setLockTime(new Date(penaltyEnd));
    }

    const hasUnlockFuture = unlockTime && new Date(unlockTime) > new Date();
    const hasPenaltyFuture = penaltyEnd && new Date(penaltyEnd) > new Date();
    setAlreadyStarted(savedStep > 0 || !!savedMode || hasUnlockFuture || hasPenaltyFuture);

    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(userRef, { season: localStorage.getItem("season") }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const unlockTime = localStorage.getItem("questUnlockTime");
      const penaltyEnd = localStorage.getItem("penaltyEndTime");

      if (unlockTime) {
        const diff = new Date(unlockTime) - Date.now();
        if (diff <= 0) {
          handleQuestTimeout();
        } else {
          setCountdown(diff);
        }
      }

      if (penaltyEnd) {
        const diff = new Date(penaltyEnd) - Date.now();
        if (diff <= 0) {
          localStorage.removeItem("penaltyEndTime");
          setPenaltyCountdown(null);
          setLockTime(null);
        } else {
          setPenaltyCountdown(diff);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startCountdown = (selectedMode) => {
    const duration = selectedMode === "single" ? 30 : 20; // min
    const unlockAt = new Date(Date.now() + duration * 60 * 1000);
    localStorage.setItem("questUnlockTime", unlockAt.toISOString());
    localStorage.setItem("questMode", selectedMode);
    setMode(selectedMode);
    setCountdown(unlockAt - Date.now());
  };

  const handleQuestSuccess = () => {
    const nextStep = questStep + 1;
    setQuestStep(nextStep);
    localStorage.setItem("questStep", nextStep.toString());

    if (nextStep < 4) {
      startCountdown(mode);
    } else {
      localStorage.removeItem("questUnlockTime");
      setCountdown(null);
    }
  };

  const handleQuestTimeout = () => {
    setCountdown(null);
    const penaltyEnd = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    localStorage.setItem("penaltyEndTime", penaltyEnd.toISOString());
    localStorage.removeItem("questUnlockTime");
    setPenaltyCountdown(penaltyEnd - Date.now());
    setLockTime(penaltyEnd);
  };

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return "00:00:00";
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${min
      .toString()
      .padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const renderQuest = () => {
    switch (questStep) {
      case 1:
        return <QuestOne onSuccess={handleQuestSuccess} />;
      case 2:
        return <QuestTwo onSuccess={handleQuestSuccess} />;
      case 3:
        return <QuestThree onSuccess={handleQuestSuccess} />;
      case 4:
        return <FinalForm />;
      default:
        return null;
    }
  };

  const startGame = (selectedMode) => {
    const duration = selectedMode === "single" ? 30 : 20;
    const unlockAt = new Date(Date.now() + duration * 60 * 1000);

    localStorage.setItem("questStep", "1");
    localStorage.setItem("questMode", selectedMode);
    localStorage.setItem("questUnlockTime", unlockAt.toISOString());
    localStorage.removeItem("penaltyEndTime");

    setShowRules(null);
    window.location.reload();
  };

  const renderRulesPopup = () => {
    if (!showRules) return null;

    const rulesText =
      showRules === "single"
        ? [
            "Single Mode Rules:",
            "- You have 30 minutes to find the secret place.",
            "- If you fail, your screen will be locked for 24 hours.",
            "- Only one player can play in this mode.",
            "- Focus, explore, and don’t waste time!",
          ]
        : [
            "Team Mode Rules:",
            "- You have 20 minutes to find the secret place.",
            "- If you fail, your team is locked out for 24 hours.",
            "- Collaboration is key—communicate with your teammates.",
            "- Every second matters—divide tasks smartly!",
          ];

    return (
      <div
        className="popup-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="btn-modal">
          <button
            className="close-modal-mode"
            onClick={() => setShowRules(null)}
          >
            &times;
          </button>
          <h3 style={{color: "#598392", opacity: "0.4"}}>{rulesText[0]}</h3>
          <ul>
            {rulesText.slice(1).map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
          <div className="d-flex gap-3 mt-3">
            <button
              className="btn btn-primary"
              onClick={() => startGame(showRules)}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoggedIn && alreadyStarted) {
    return (
      <>
        {renderQuest()}

        {countdown !== null && questStep < 4 && (
          <div
            className="timer-box top-right"
            style={{
              position: "fixed",
              top: 134,
              right: 20,
              fontSize: "1.2rem",
              background: "#000",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              zIndex: "9999999",
              textAlign: "center",
            }}
          >
            <div>
              <MdTimer /> {formatTime(countdown)}
            </div>
            {mode && (
              <div style={{ marginTop: "0.3rem", fontSize: "0.9rem" }}>
                {mode === "single" ? "Single Mode" : "Team Mode"}
              </div>
            )}
          </div>
        )}

        {penaltyCountdown !== null && (
          <div
            className="popup-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.9)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "1.5rem",
              flexDirection: "column",
            }}
          >
            <p>
              <AiOutlineStop /> Time’s up! You can try again after:
            </p>
            <p style={{ fontSize: "2rem", marginTop: "1rem" }}>
              {formatTime(penaltyCountdown)}
            </p>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="modes section" id="modes">
      <div className="section__page d-none d-lg-block">
        <div className="aboutimg">
          <img src={modeImg} alt="Image" className="mode-img" id="animatopDown" />
        </div>
      </div>

      <div className="about__title section__title">
        <Animation fadeOnly duration={0.8} delay={0.2}>
          <span>Modes</span>
        </Animation>
        <Animation direction="up" duration={0.8} delay={0.2}>
          {/* <h1>Single & Team</h1> */}
          <h1>Solo adventure or teamwork?</h1>
        </Animation>
        <div className="rules__text-wrapper">
          <Animation direction="up" duration={0.8} delay={0.3}>
            <p>
              We present you a single mode as well as a team mode for searching for secret locations.
              Up to 4 people can participate in team mode. After completing all quests, you must enter the email or social networks of all participants in the submission form.
            </p>
          </Animation>

          {!isLoggedIn && (
            <p
              className="puls-anim"
              style={{ color: "#fb8500", fontWeight: "bold" }}
            >
              Please log in to start the quest.
            </p>
          )}

          <div className="mode-buttons d-flex gap-4 mt-3">
            {isLoggedIn && (
              <>
                <button
                  className="btn btn-mode"
                  onClick={() => setShowRules("single")}
                  disabled={lockTime && new Date(lockTime) > new Date()}
                >
                  Single mode
                </button>
                <button
                  className="btn btn-mode"
                  onClick={() => setShowRules("team")}
                  disabled={lockTime && new Date(lockTime) > new Date()}
                >
                  Team mode
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="section__page d-block d-lg-none">
        <div className="pb-5">
          <img src={modeImg} alt="Image" id="animatopDown" />
        </div>
      </div>

      {renderRulesPopup()}
    </div>
  );
};

export default Modes;