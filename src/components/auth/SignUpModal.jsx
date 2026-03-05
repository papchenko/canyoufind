import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import {
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";

export default function SignUpModal({ id = "signupModal", switchToLoginId = "loginModal" }) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const hideModal = (modalId) => {
    const el = document.getElementById(modalId);
    const instance = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el);
    instance.hide();
  };

  const showModal = (modalId) => {
    const el = document.getElementById(modalId);
    const instance = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el);
    instance.show();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await signUp(name.trim(), email.trim(), password);

      await setDoc(doc(db, "users", user.uid), {
        username: name.trim(),
        email: email.trim(),
        cyfCoins: 0,
        createdAt: serverTimestamp(),
        readAnnouncements: [],
        isAdmin: false,
      });

      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: "👋 Welcome to the CYF!",
        message: `Hi ${name.trim()}! 

        Here you can:
        - Explore, discover, and collect points.
        - Compete with others and climb the leaderboard.
        - Get notified about updates and hidden events.

        Have fun and good luck!`,
        createdAt: new Date(),
        read: false,
      });

      toast.success("Welcome to CYF!");
      setName("");
      setEmail("");
      setPassword("");

      hideModal(id);
      showModal("dashboardModal");
    } catch (error) {
      toast.error("Error: " + (error?.message || "Unknown"));
    }
  };

  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Sign Up</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div className="modal-body">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Your Name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Address"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                />
              </div>
              <button type="submit" className="btn btn-dark w-100">
                Sign Up
              </button>
            </form>

            <div className="text-center mt-3">
              <p>
                Already have an account?{" "}
                <a
                  href="#"
                  className="text-success fw-bold"
                  onClick={(e) => {
                    e.preventDefault();
                    hideModal(id);
                    const el = document.getElementById(switchToLoginId);
                    const instance = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el);
                    instance.show();
                  }}
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}