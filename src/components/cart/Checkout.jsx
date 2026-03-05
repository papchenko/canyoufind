import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import OrderHistory from "./OrderHistory";

import "./checkout.scss";

const Checkout = () => {
  const { cart, removeFromCart, updateSize } = useCart();
  const navigate = useNavigate();

  const getPriceBySize = (size) => {
    switch (size) {
      case "64x64":
        return 110;
      case "34x34":
      default:
        return 90;
    }
  };

  const total = cart.reduce((sum, item) => {
    const price = String(item.id).startsWith("premium-")
      ? item.price
      : getPriceBySize(item.size) * item.quantity;
    return sum + price;
  }, 0);

  return (
    <div className="checkout-page container">
      <h2 className="checkout-title">Checkout</h2>
      {cart.length === 0 ? (
        <div className="d-flex flex-column gap-2 justify-content-center align-items-center">
        <p className="empty-text">Your cart is empty 🛒</p>
        <button className="btn-home mt-2" onClick={() => navigate("/")}>Back to Home</button>
        </div>
      ) : (
        <div className="checkout-items">
          {cart.map((item) => {
            const isPremium = String(item.id).startsWith("premium-");
            const price = isPremium
              ? item.price
              : getPriceBySize(item.size) * item.quantity;

            return (
              <div key={item.id} className="checkout-item">
                <img src={item.img} alt={item.name} className="checkout-img" />
                <div className="checkout-info">
                  <h4>{item.name}</h4>

                  {!isPremium && (
                    <div className="size-selector">
                      <label>Size: </label>
                      <select
                        value={item.size}
                        onChange={(e) =>
                          updateSize(item.id, e.target.value)
                        }
                      >
                        <option value="34x34">34 × 34 mm (90₴)</option>
                        <option value="64x64">64 × 64 mm (110₴)</option>
                      </select>
                    </div>
                  )}

                  <p>
                    <b>Price:</b> {item.price}₴
                    {!isPremium && ` × ${item.quantity}`}
                  </p>
                  <p>
                    <b>Total:</b> {price}₴
                  </p>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
          <hr />
          <div className="checkout-total">
            <h3>Total amount: {total}₴</h3>
            <button
              className="confirm-btn"
              onClick={() => navigate("/payment", { state: { cart } })}
            >
              Confirm and Pay
            </button>
          </div>
        </div>
      )}
      <div className="my-5">
        <OrderHistory />
      </div>
    </div>
  );
};

export default Checkout;