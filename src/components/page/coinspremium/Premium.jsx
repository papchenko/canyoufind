import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import { toast } from 'react-toastify';
import Animation from "../../animation/Animation";

import starterImg from "../../../assets/premium-starter-img.png";
import heroImg from "../../../assets/premium-hero-img.png";
import legendImg from "../../../assets/premium-legend-img.png";

import "./coins-premium.scss";

const Premium = () => {
  const { addToCart } = useCart();
  const [showPopup, setShowPopup] = useState(false);

  const premiumPlans = [
    {
      id: "premium-starter",
      name: "Starter",
      coins: 3,
      price: 150,
      img: starterImg,
    },
    {
      id: "premium-hero",
      name: "Hero",
      coins: 7,
      price: 270,
      img: heroImg,
    },
    {
      id: "premium-legend",
      name: "Legend",
      coins: 10,
      price: 320,
      img: legendImg,
    },
  ];

  const handleAddToCart = (plan) => {
  const existing = JSON.parse(localStorage.getItem("cart"))?.find(
        (p) => p.id === plan.id
    );

    if (existing) {
        toast.info(`${plan.name} is already in your cart 🛒`);
        return;
    }

    addToCart({
        id: plan.id,
        name: plan.name,
        img: plan.img,
        price: plan.price,
        quantity: 1,
    });

    toast.success(`${plan.name} added to cart 🛒`);
    setShowPopup(false);
    };

  return (
    <div className="premium section" id="coinspremium">
      <div className="about__title section__title">
        <Animation fadeOnly duration={0.8} delay={0.2}>
          <span>Coin Shop</span>
        </Animation>
        <Animation direction="up" duration={0.8} delay={0.2}>
          <h1>Buy Coins - be ahead!</h1>
        </Animation>
        <div className="rules__text-wrapper">
          <Animation direction="up" duration={0.8} delay={0.3}>
            <p>
              After purchase, new coins will be credited to your account.
            </p>
          </Animation>
          <Animation direction="up" duration={0.8} delay={0.5}>
            <p>Select the option to purchase coins.</p>
          </Animation>
        </div>
      </div>

      <div className="section__page premium__plan pt-1">
        <div className="premium-values">
          <h1>Starter</h1>
          <p>
            <span>+ 3</span> Coins on Your Account
          </p>
          <h1>Hero</h1>
          <p>
            <span>+ 7</span> Coins on Your Account
          </p>
          <h1>Legend</h1>
          <p>
            <span>+ 10</span> Coins on Your Account
          </p>
          <button
            className="btn btn-unactive puls-anim"
            onClick={() => setShowPopup(true)}
          >
            Buy Coins
          </button>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="premium-popup-overlay" onClick={() => setShowPopup(false)}>
          <div
            className="premium-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Choose a coin purchase package</h3>
            <ul className="premium-list">
              {premiumPlans.map((plan) => (
                <li key={plan.id} className="premium-option">
                  <div className="d-flex align-items-center gap-3">
                    {/* <img
                      src={plan.img}
                      alt={plan.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "10px",
                        objectFit: "cover",
                      }}
                    /> */}
                    <div>
                      <h4>{plan.name}</h4>
                      <p>
                        <b>₴{plan.price}</b> — +{plan.coins} coins
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary p-1"
                    onClick={() => handleAddToCart(plan)}
                  >
                    Add to Cart
                  </button>
                </li>
              ))}
            </ul>
            <button className="btn-close-popup" onClick={() => setShowPopup(false)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;