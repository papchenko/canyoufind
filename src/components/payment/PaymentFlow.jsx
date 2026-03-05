import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

import "./payment.scss";

const PaymentFlow = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const orderNumberRef = useRef("");
  const [orderNumber, setOrderNumber] = useState("");
  const [total, setTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [orderCart, setOrderCart] = useState([]);
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("paymentStep");
    return savedStep ? Number(savedStep) : 1;
  });

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    city: "",
    post: "",
    department: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    localStorage.setItem("paymentStep", step);
  }, [step]);

  useEffect(() => {
    if (!orderNumberRef.current) {
      const random = Math.floor(100000 + Math.random() * 900000);
      orderNumberRef.current = `ORD-${new Date().getFullYear()}${
        new Date().getMonth() + 1
      }${new Date().getDate()}-${random}`;
    }
    setOrderNumber(orderNumberRef.current);

    const totalAmount = cart.reduce((sum, item) => {
      const price = String(item.id).startsWith("premium-")
        ? item.price
        : (item.size === "64x64" ? 110 : 90) * item.quantity;
      return sum + price;
    }, 0);
    setTotal(totalAmount);
  }, [cart]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const hasPremium = cart.some((i) => String(i.id).startsWith("premium-"));
    const hasRegular = cart.some((i) => !String(i.id).startsWith("premium-"));

    const requiredFields = hasPremium && !hasRegular
      ? ["lastName", "firstName", "phone", "email"]
      : ["lastName", "firstName", "city", "post", "department", "phone"];

    for (let key of requiredFields) {
      if (!formData[key]) {
        toast.error("Please fill all required fields");
        return;
      }
    }

    setStep(2);
  };

  const handlePaymentConfirm = async () => {
    setOrderCart([...cart]);
    setFinalTotal(total);

    const itemsList = cart
      .map((item) => {
        const isPremium = String(item.id).startsWith("premium-");
        if (isPremium) {
          return `${item.name} — Premium Plan (${item.price}₴)`;
        } else {
          const size = item.size || "34x34";
          const price = size === "64x64" ? 110 : 90;
          return `${item.name} — ${item.quantity} pcs, size: ${size}, price: ${price}₴`;
        }
      })
      .join("\n");

    const emailData = {
      ...formData,
      orderNumber,
      message: `🧾 New order Canyoufind!\n\nOrder: ${orderNumber}\nTotal: ${total}₴\n\nCustomer: ${
        formData.lastName
      } ${formData.firstName}\n${
        cart.some((i) => !String(i.id).startsWith("premium-"))
          ? `City: ${formData.city}\nPost: ${formData.post}, Department: ${formData.department}\n`
          : ""
      }Phone: ${formData.phone}${
        formData.email ? `\nEmail: ${formData.email}` : ""
      }\n\nOrdered Items:\n${itemsList}`,
    };

    try {
      await emailjs.send(
        "service_hllb7p1",
        "template_gdn6fcv",
        emailData,
        "v13Oo-YtABqCO9JLF"
      );

      if (user?.uid) {
        await addDoc(collection(db, "orders"), {
          userId: user.uid,
          orderNumber,
          items: cart,
          total,
          createdAt: serverTimestamp(),
        });
      }

      toast.success("✅ Order received! Wait for shipment 🚚");
      clearCart();
      localStorage.removeItem("paymentStep");
      setStep(3);
    } catch (err) {
      console.error(err);
      toast.error("Error processing order. Try again later.");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("receipt").innerHTML;
    const newWin = window.open("", "_blank");
    newWin.document.write(
      `<html><head><title>Receipt</title></head><body>${printContent}</body></html>`
    );
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  };

  const hasPremium = cart.some((i) => String(i.id).startsWith("premium-"));
  const hasRegular = cart.some((i) => !String(i.id).startsWith("premium-"));

  return (
    <div className="payment-container container text-white py-5">
      <h2 className="fs-2 mb-3 ms-3" style={{ color: "#fd5200" }}>
        {step === 1
          ? "Step 1: Fill Your Details"
          : step === 2
          ? "Step 2: Payment"
          : "Step 3: Order Receipt"}
      </h2>

      {/* STEP 1 */}
      {step === 1 && (
        <form className="payment-form" onSubmit={handleFormSubmit}>
               <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          {(!hasPremium || hasRegular) && (
            <>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <select
                name="post"
                value={formData.post}
                onChange={handleChange}
                required
                className="fs-4 text-dark"
              >
                <option value="">Select Delivery Service</option>
                <option value="Nova Poshta">Nova Poshta</option>
                <option value="Ukrposhta">Ukrposhta</option>
              </select>
              <input
                type="text"
                name="department"
                placeholder="Department Number"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </>
          )}

          {hasPremium && (
            <>
              <div className="color-red">
                * Be sure to indicate the email address of the account you
                registered on the site to credit CYFcoins.
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email (registered on site)"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone || "+380"}
            onChange={(e) => {
              let value = e.target.value;
              if (!value.startsWith("+380")) value = "+380";
              if (!/^\+380\d{0,9}$/.test(value)) return;
              setFormData({ ...formData, phone: value });
            }}
            required
          />

          <button type="submit" className="btn btn-next mt-3">
            Next: Payment
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="payment-summary d-flex align-items-center gap-2 flex-column">
           <div className="d-flex align-items-center gap-2 flex-column">
            <p className="m-0">
              <b>Order Number:</b>
            </p>
            <div  className="p-3 rounded bg-black text-white border border-secondary d-inline-block"
              style={{ fontSize: "1rem", letterSpacing: "2px" }} >
            <span
              style={{
                color: "#fff",
                fontSize: "1rem",
                cursor: "pointer",
                userSelect: "all",
              }}
              onClick={() => {
                navigator.clipboard.writeText(orderNumber);
                toast.success("Order number copied");
              }}
            >
              {orderNumber}
            </span>
            </div>
          </div>

          <p>
            <b>Total Amount:</b> {total}₴
          </p>

          <div className="d-flex align-items-center gap-2 flex-column pb-3">
            <b>Card for Payment:</b>
            <div
              className="p-3 rounded bg-black text-white border border-secondary d-inline-block"
              style={{ fontSize: "1.2rem", letterSpacing: "2px" }}
            >
            <span
              style={{
                color: "#fd5200",
                fontSize: "1.2rem",
                cursor: "pointer",
                userSelect: "all",
              }}
              onClick={() => {
                navigator.clipboard.writeText("4790729928936954");
                toast.success("Card number copied");
              }}
            >
              4790&nbsp;7299&nbsp;2893&nbsp;6954
            </span>
            </div>
          </div>

          <div
            className="d-flex flex-column w-100 p-3 justify-content-center align-items-center"
            style={{ backgroundColor: "#ffffff11", borderRadius: "8px" }}
          >
            <p
              className="m-0"
              style={{
                color: "red",
                textTransform: "uppercase",
                fontWeight: "600",
              }}
            >
              mandatory condition for payment!
            </p>
            <p className="m-0 w-100 text-center">In payment description, enter order number and time of payment{orderNumber}</p>
          </div>
          <button
            className="btn btn-pay mt-3 p-1"
            onClick={handlePaymentConfirm}
          >
            I Paid, Get My Order!
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div id="receipt">
          <div className="payment-summary">
            <p>
              <b>Order Number:</b> {orderNumber}
            </p>
            <p>
              <b>Total Amount:</b> {finalTotal}₴
            </p>
            <p>
              <b>Card for Payment:</b> 4790 7299 2893 6954
            </p>
          </div>

          <div className="ordered-items ms-2">
            <h4>Ordered Items:</h4>
            <ul>
              {orderCart.map((item) => {
                const isPremium = String(item.id).startsWith("premium-");
                return (
                  <li key={item.id}>
                    {item.name}
                    {!isPremium && item.size && `, size: ${item.size}`}
                    {!isPremium && item.quantity > 1 && ` × ${item.quantity}`}
                    — {item.price * (item.quantity || 1)}₴
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="d-flex gap-3 ms-2">
            <button className="btn-print mt-2" onClick={handlePrint}>
              Print Receipt
            </button>
            <button
              className="btn-home mt-2"
              onClick={() => {
                localStorage.removeItem("paymentStep");
                navigate("/");
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentFlow;