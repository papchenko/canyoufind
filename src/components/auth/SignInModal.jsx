import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function humanizeAuthError(code) {
  switch (code) {
    case "auth/invalid-email": return "Invalid email format.";
    case "auth/user-not-found": return "User not found.";
    case "auth/wrong-password": return "Incorrect password.";
    case "auth/too-many-requests": return "Too many attempts. Try later.";
    case "auth/invalid-credential": return "Email or password is incorrect.";
    default: return "Login error. Please try again.";
  }
}

export default function SignInModal({ id = "loginModal", switchToSignUpId = "signupModal" }) {
  const { signIn, googleSignIn, isLoggedIn } = useAuth();
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
  const switchModal = (fromId, toId) => {
    hideModal(fromId);
    showModal(toId);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email.trim(), password);
      hideModal(id);
      showModal("dashboardModal");
      setEmail(""); setPassword("");
    } catch (error) {
      toast.error(humanizeAuthError(error?.code));
    }
  };

  const onGoogle = async () => {
    try {
      const resUser = await googleSignIn();
      if (resUser) {
        hideModal(id);
        showModal("dashboardModal");
      }
    } catch (error) {
      toast.error("Google Sign-In failed: " + (error?.message || "Unknown error"));
    }
  };
  useEffect(() => {
    if (isLoggedIn) {
      const loginEl = document.getElementById(id);
      const isVisible = loginEl?.classList?.contains("show");
      if (isVisible) {
        hideModal(id);
        showModal("dashboardModal");
      }
    }
  }, [isLoggedIn]);

  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Sign In</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div className="modal-body">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="Enter Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="Enter Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-dark w-100">Sign In</button>
            </form>

            <button type="button" className="btn btn-outline-danger w-100 mt-2" onClick={onGoogle}>
              <i className="bi bi-google me-2"></i> Sign In with Google
            </button>

            <div className="text-center mt-3">
              <p>
                Don't have an account?{" "}
                <a
                  href="#"
                  className="text-success fw-bold"
                  onClick={(e) => {
                    e.preventDefault();
                    switchModal(id, switchToSignUpId);
                  }}
                >
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}