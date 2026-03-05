import { useEffect, useState } from "react";
import logoImg from "../assets/logo.png";

import "./cookie.scss";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const localConsent = localStorage.getItem("cookie_consent");
    if (!localConsent) setVisible(true);
  }, []);

  const handleConsent = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent">
      <div className="cookie-content">
        <img src={logoImg} alt="Logo" className="cookie-icon" />
        <p>
          We use cookies to improve your experience. More details in{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
      <div className="cookie-buttons">
        <button className="accept" onClick={handleConsent}>
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;