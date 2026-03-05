import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useSeason } from "../../context/SeasonContext";
import axios from "axios";

import "./auth.scss";

export default function AccountModal({ id = "dashboardModal" }) {
  const { user, userName, signOut } = useAuth();
  const [cyfCoins, setCyfCoins] = useState(0);
  const [questsStatus, setQuestsStatus] = useState({
    questOneCompleted: false,
    questTwoCompleted: false,
    questThreeCompleted: false,
  });
  const { spam, r } = useSeason();
  const [avatarUrl, setAvatarUrl] = useState(
    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [canChangeAvatar, setCanChangeAvatar] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);

  const [newUsername, setNewUsername] = useState("");
  const [canChangeName, setCanChangeName] = useState(true);
  const [daysLeftName, setDaysLeftName] = useState(0);

  const hideModal = (modalId) => {
    const el = document.getElementById(modalId);
    const instance =
      window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el);
    instance.hide();
  };

  const onLogout = async () => {
    try {
      await signOut();
      hideModal(id);
      toast.info("Signed out.");
    } catch (e) {
      toast.error("Sign out failed. Try again.");
    }
  };

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCyfCoins(data.cyfCoins || 0);
        setQuestsStatus({
          questOneCompleted: !!data.questOneCompleted,
          questTwoCompleted: !!data.questTwoCompleted,
          questThreeCompleted: !!data.questThreeCompleted,
        });

        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);

        if (data.lastAvatarUpdate) {
          const lastUpdate = data.lastAvatarUpdate.toDate
            ? data.lastAvatarUpdate.toDate()
            : new Date(data.lastAvatarUpdate);
          const diffHours = (new Date() - lastUpdate) / (1000 * 60 * 60);
          if (diffHours >= 24) {
            setCanChangeAvatar(true);
            setDaysLeft(0);
          } else {
            setCanChangeAvatar(false);
            setDaysLeft(Math.ceil(24 - diffHours));
          }
        } else {
          setCanChangeAvatar(true);
          setDaysLeft(0);
        }

        if (data.lastNameUpdate) {
          const lastUpdate = data.lastNameUpdate.toDate
            ? data.lastNameUpdate.toDate()
            : new Date(data.lastNameUpdate);
          const diffDays = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
          if (diffDays >= 7) {
            setCanChangeName(true);
            setDaysLeftName(0);
          } else {
            setCanChangeName(false);
            setDaysLeftName(Math.ceil(7 - diffDays));
          }
        } else {
          setCanChangeName(true);
          setDaysLeftName(0);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const calculateProgress = () => {
    const completed = Object.values(questsStatus).filter(Boolean).length;
    return Math.round((completed / 3) * 100);
  };

  const handleFileChange = async (e) => {
    if (!canChangeAvatar) {
      toast.info(`You can change your avatar in ${daysLeft} day(s).`);
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "y8wvdb5c");
    const cloudName = "dggvnbw4a";

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );
      const url = res.data.secure_url;
      setAvatarUrl(url);

      await updateDoc(doc(db, "users", user.uid), {
        avatarUrl: url,
        lastAvatarUpdate: new Date(),
      });

      toast.success("Avatar updated!");
      setCanChangeAvatar(false);
      setDaysLeft(24);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload avatar.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUsernameChange = async () => {
    if (!canChangeName) {
      toast.info(`You can change your username in ${daysLeftName} day(s).`);
      return;
    }
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: newUsername.trim(),
        lastNameUpdate: new Date(),
      });

      setNewUsername("");
      setCanChangeName(false);
      setDaysLeftName(7);

      toast.success("Username updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update username.");
    }
  };

  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4 text-center">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Personal account</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div
              className="avatar-container mb-2"
              style={{ position: "relative", display: "inline-block" }}
            >
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: "80px", height: "80px", borderRadius: "50%" }}
              />
              <label
                htmlFor="avatarInput"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: canChangeAvatar ? "green" : "gray",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  color: "#fff",
                  textAlign: "center",
                  lineHeight: "24px",
                  cursor: canChangeAvatar ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                  fontSize: "0.7rem",
                }}
              >
                {canChangeAvatar ? "+" : `${daysLeft}h`}
              </label>
              <input
                type="file"
                id="avatarInput"
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*"
                disabled={!canChangeAvatar || uploading}
              />
            </div>

            {uploading && (
              <div className="progress mt-2" style={{ height: "6px" }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: uploadProgress + "%" }}
                  aria-valuenow={uploadProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            )}
            <h4 className="text-dark">Welcome, {userName}!</h4>
            <div className="username-container mt-2">
              {/* <p className="text-dark mb-1">
                Username: <strong>{userName}</strong>
              </p> */}

              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-changeusername"
                  placeholder="Enter new username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={!canChangeName}
                />
                <button
                  className="btn-changeusername"
                  onClick={handleUsernameChange}
                  disabled={!canChangeName}
                >
                  Change  
                </button>
              </div>

              {!canChangeName && (
                <small className="text-muted">
                  You can change your username in {daysLeftName} day(s).
                </small>
              )}
            </div>

            {/* <h4 className="text-dark">Welcome, {userName}!</h4> */}
            <p className="text-dark">
              You have <span className="cyf-coins">{cyfCoins}</span> CYF Coins.
            </p>

            <div className="quests-status mt-3">
              <div className="season-progress mt-2">
                <div className="season-header">
                  <span className="season-subtitle">{spam}</span>{" "}
                  <span className="season-title">{r}</span>
                  <span className="season-percentage">{calculateProgress()}%</span>
                </div>
                <div className="season-bar">
                  <div
                    className="season-fill"
                    style={{ width: calculateProgress() + "%" }}
                  ></div>
                </div>
              </div>
            </div>
            {window.location.pathname === "/" && (
              <p
                className="text-dark"
                style={{ fontSize: "0.8rem", opacity: "0.7" }}
              >
                What is CYF Coins and why is it needed?{" "}
                <a
                  href="#coinspremium"
                  onClick={(e) => {
                    e.preventDefault();
                    hideModal(id);

                    const el = document.getElementById("coinspremium");
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}
                >
                  Read here.
                </a>
              </p>
            )}
            <button className="btn btn-outline-danger mt-3" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}