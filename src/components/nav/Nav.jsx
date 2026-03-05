import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { IoPersonOutline } from "react-icons/io5";
import { MdOutlineNewReleases } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../context/AuthContext";

import SignUpModal from "../auth/SignUpModal";
import SignInModal from "../auth/SignInModal";
import AccountModal from "../auth/AccountModal";
import NotificationBell from "../notifications/NotificationBell";
import { MdOutlineAdminPanelSettings } from "react-icons/md";

import { useCart } from "../../context/CartContext";

import logo from "../../assets/logo.png";

import "./nav.scss";

const Nav = ({ onToggleNotifications }) => {
  const [scrollNav, setScrollNav] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isLoggedIn, avatarUrl, role } = useAuth();
  const { cart, updateQuantity, removeFromCart } = useCart(); //!
  const location = useLocation();
  const navigate = useNavigate();

  const changeNav = () => {
    if (location.pathname === "/" || location.pathname === "/cyf") {
      setScrollNav(window.scrollY >= 50);
    } else {
      setScrollNav(true);
    }
  };

  useEffect(() => {
    changeNav();
    window.addEventListener("scroll", changeNav);
    return () => window.removeEventListener("scroll", changeNav);
  }, [location.pathname]);

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    const collapseEl = document.getElementById("navbarNav");
    if (collapseEl?.classList.contains("show")) {
      const bsCollapse =
        window.bootstrap.Collapse.getInstance(collapseEl) ||
        new window.bootstrap.Collapse(collapseEl, { toggle: false });
      bsCollapse.hide();
    }
  };

  const togglePanel = (panelName) => {
    closeMobileMenu();
    if (activePanel === panelName) {
      setActivePanel(null);
    } else {
      setTransitioning(true);
      setActivePanel(null);
      setTimeout(() => {
        setActivePanel(panelName);
        setTransitioning(false);
      }, 300);
    }
  };

  const handleMenuToggle = () => {
    setActivePanel(null);
    setIsMenuOpen((prev) => !prev);
  };

  const handleSmoothScroll = (e, targetId, isCYF = false) => {
    e.preventDefault();
    closeMobileMenu();

    if (targetId === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.querySelector(targetId);
    if (target) {
      const yOffset = isCYF ? 0 : 0;
      const y =
        target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const openModal = (id) => {
    const el = document.getElementById(id);
    const modal =
      window.bootstrap?.Modal.getInstance(el) ||
      new window.bootstrap.Modal(el);
    modal.show();
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    closeMobileMenu();
    setActivePanel(null);
    if (isLoggedIn) openModal("dashboardModal");
    else openModal("loginModal");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const navEl = document.querySelector(".nav");
      if (navEl && !navEl.contains(e.target)) {
        setActivePanel(null);
        closeMobileMenu();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const isHomePage = location.pathname === "/";

  return (
    <>
      <div
        className={`${
          scrollNav || activePanel || isMenuOpen ? "scroll-header" : ""
        } nav w100 fixed-top shadow-sm ${
          activePanel && !transitioning ? "expand" : ""
        }`}
      >
        <nav className="navbar navbar-expand-lg py-1 justify-content-between align-items-center w-100 nav-wrapper flex-column">
          <div className="d-flex w-100 justify-content-between align-items-center">
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              onClick={handleMenuToggle}
            >
              <span className="navbar-toggler-icons">
                <HiOutlineMenuAlt2 className="burger" />
              </span>
            </button>

            <ul className="nav-items d-lg-none d-flex align-items-center gap-3 mb-2">
              {isLoggedIn && (
              <li className="nav-item">
                <a
                  className="p-0"
                  onClick={onToggleNotifications}
                  style={{ cursor: "pointer", fontSize: "30px", opacity: "0.9" }}
                >
                  <NotificationBell />
                </a>
              </li>
              )}
              <li className="nav-item">
                <a className="p-0" onClick={() => togglePanel("settings")}>
                  <MdOutlineNewReleases style={{ fontSize: "30px", opacity: "0.9" }} />
                </a>
              </li>
              <li className="nav-item">
                <a href="#" onClick={handleProfileClick}>
                  {isLoggedIn && avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="avatar" 
                      style={{ 
                        width: "32px", 
                        height: "32px", 
                        border: "2px solid #fff",
                        borderRadius: "50%", 
                        objectFit: "cover" 
                      }} 
                    />
                  ) : (
                    <IoPersonOutline className="fs-1" />
                  )}
                </a>
              </li>
              <li className="nav-item position-relative">
                <a className="p-0" onClick={() => togglePanel("cart")}>
                  <i className="bi bi-bag fs-5 text-white"></i>
                  <span className="position-absolute top-0 start-100 translate-middle cart-qount rounded-pill" style={{color: "#598392"}}>
                    {/* 0 */}
                    {cart.length}
                  </span>
                </a>
              </li>
            </ul>
            <a href="#" className="navbar-logo mx-auto order-0 d-lg-none d-flex">
              <img src={logo} alt="Logo" />
            </a>
          </div>

          <div
            className="collapse navbar-collapse justify-content-between w-100 mt-3"
            id="navbarNav"
          >
            <ul className="navbar-nav nav-menu align-items-center gap-4">
              {isHomePage
                ? ["Home", "CYF"].map((text, idx) => {
                    const pathMap = { Home: "#", CYF: "/cyf" };
                    return (
                      <li className="nav-item" key={idx}>
                        <a
                          href={pathMap[text]}
                          className={`nav-link text-white ${
                            text === "CYF" ? "cyf" : ""
                          }`}
                          onClick={(e) => {
                            if (text === "CYF") {
                              e.preventDefault();
                              navigate("/cyf");
                              return;
                            }
                            handleSmoothScroll(e, pathMap[text], text === "CYF");
                          }}
                        >
                          {text}
                        </a>
                      </li>
                    );
                  })
                : ["Home", "CYF"].map((text, idx) => (
                    <li className="nav-item" key={idx}>
                      <a
                        href={text === "Home" ? "/" : "#"}
                        className={`nav-link text-white ${
                          text === "CYF" ? "cyf" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (text === "Home") navigate("/");
                          else if (text === "CYF")
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        {text}
                      </a>
                    </li>
                  ))}
              {role === "admin" && (
                <li className="nav-item-mobile d-lg-none">
                  <a
                    className="text-warning fw-bold"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/notification-panel")}
                  >
                    Admin Panel
                  </a>
                </li>
              )}
            </ul>

            <a href="#" className="navbar-logo order-0 d-none d-lg-flex">
              <img src={logo} alt="Logo" />
            </a>

            <ul className="navbar-nav d-none d-lg-flex align-items-center gap-4">
              {role === "admin" && (
                <li className="nav-item">
                  <a
                    className="text-warning fw-bold"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/notification-panel")}
                  >
                    <MdOutlineAdminPanelSettings className="admin-icon" />
                  </a>
                </li>
              )}
              {isLoggedIn && (
              <li className="nav-item">
                <a
                  className="p-0"
                  onClick={onToggleNotifications}
                  style={{ cursor: "pointer" }}
                >
                  <NotificationBell />
                </a>
              </li>
              )}
              <li className="nav-item">
                <a className="p-0" onClick={() => togglePanel("settings")} style={{cursor: "pointer"}}>
                  <MdOutlineNewReleases className="fs-2" />
                </a>
              </li>
              <li className="nav-item">
                <a href="#" onClick={handleProfileClick}>
                  {isLoggedIn && avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="avatar" 
                      style={{ 
                        width: "32px", 
                        height: "32px", 
                        border: "2px solid #fff",
                        borderRadius: "50%", 
                        objectFit: "cover" 
                      }} 
                    />
                  ) : (
                    <IoPersonOutline className="fs-3" />
                  )}
                </a>
              </li>
              <li className="nav-item position-relative">
                <a
                  className="p-0 position-relative"
                  onClick={() => togglePanel("cart")}
                >
                  <i className="bi bi-bag fs-5 text-white" style={{cursor: "pointer"}}></i>
                  <span className="position-absolute top-0 start-100 translate-middle cart-qount rounded-pill" style={{color: "#598392"}}>
                    {/* 0 */}
                    {cart.length}
                  </span>
                </a>
              </li>
            </ul>
          </div>
          {activePanel === "cart" && !transitioning && (
            <div className="nav-dropdown-bar">
              <div className="inner cart-dropdown">
                {cart.length === 0 ? (
                  <div className="d-flex flex-column align-items-center justify-content-center text-center">
                    <span className="text-white fw-semibold mb-2">Cart is Empty</span>
                    <a
                      onClick={() => {
                        navigate("/checkout");
                        setActivePanel(null);
                      }}
                      className="text-decoration-none text-white fw-semibold"
                      style={{ cursor: "pointer", fontSize: "0.7rem", opacity: "0.7", padding: "5px", border: "1px solid #fff", borderRadius: "8px", marginTop: "5px" }}
                    >
                      Go to Checkout
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cart.map((item) => {
                        const isPremium = String(item.id).startsWith("premium-");

                        return (
                          <div key={item.id} className="cart-item d-flex align-items-center mb-2">
                            <img
                              src={item.img}
                              alt={item.name}
                              className="cart-thumb me-2"
                              style={{ width: "45px", height: "45px", borderRadius: "10px", objectFit: "contain" }}
                            />
                            <div className="cart-info flex-grow-1 text-white">
                              <h6 className="mb-0">{item.name}</h6>
                              <small>₴{item.price}</small>

                              {!isPremium && (
                                <div className="d-flex align-items-center mt-1">
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateQuantity(item.id, parseInt(e.target.value))
                                    }
                                    className="form-control form-control-sm me-2"
                                    style={{ width: "90px" }}
                                  />
                                  <button
                                    className="btn-remove-cart"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                              {isPremium && (
                                <div className="d-flex align-items-center mt-1">
                                  <button
                                    className="btn-remove-cart ms-auto"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <hr style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                    <div className="d-flex justify-content-between text-white fw-semibold">
                      <span>Total:</span>
                      <span>
                        ₴
                        {cart.reduce(
                          (sum, item) =>
                            sum + item.price * (String(item.id).startsWith("premium-") ? 1 : item.quantity),
                          0
                        )}
                      </span>
                    </div>
                      <button
                        className={`btn btn-primary w-100 mt-2 ${!isLoggedIn ? "btn-disabled" : ""}`}
                        onClick={() => {
                          if (!isLoggedIn) {
                            toast.info("Please sign in to proceed with checkout");
                            return;
                          }
                          navigate("/checkout");
                          setActivePanel(null);
                        }}
                      >
                        Proceed to Checkout
                      </button>
                  </>
                )}
              </div>
            </div>
          )}
          {activePanel === "settings" && !transitioning && (
            <div className="nav-dropdown-bar d-flex align-items-center justify-content-center">
              <div className="inner version-body">
                <p className="fw-semibold fs-4" style={{ color: "#fd5200" }}>
                  Stable version 4.2.0
                </p>
                <p className="text-white fw-semibold fs-7">
                  Release 29_110
                </p>
                <div className="version-descriptions">
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    3.1.0 Release project.
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    3.2.1 Single and Team modes.
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    3.3.1 Weekly Bonus.
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    3.4.1 Quests reworked to VR Codes (old be QR Codes).
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    3.5.1 Season progress.
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    3.6.1 Gravity Anomalies
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    3.7.1 Avatar, change Avatar image & Change Username.
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    3.8.1 Multiplayer Mode.
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    3.9.9 Added sound effect (seasons) in the halo of secret locations.
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    4.0.1 Notifications for users.
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    4.1.0 Shop is now available for orders.
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: "0.6" }}>
                    4.2.0 Premium is now available for orders.
                  </span>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Modals */}
      <SignUpModal id="signupModal" switchToLoginId="loginModal" />
      <SignInModal id="loginModal" switchToSignUpId="signupModal" />
      <AccountModal id="dashboardModal" />
    </>
  );
};

export default Nav;