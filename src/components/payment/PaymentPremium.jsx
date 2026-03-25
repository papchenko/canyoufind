import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

import "./payment.scss";

const PaymentPremium = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const orderNumberRef = useRef("");
  const [orderNumber, setOrderNumber] = useState("");
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem("premiumPaymentStep");
    return saved ? Number(saved) : 1;
  });

  const PREMIUM_PRICE = 99;

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    localStorage.setItem("premiumPaymentStep", step);
  }, [step]);

  useEffect(() => {
    if (!orderNumberRef.current) {
      const random = Math.floor(100000 + Math.random() * 900000);
      orderNumberRef.current = `PR-${new Date().getFullYear()}${
        new Date().getMonth() + 1
      }${new Date().getDate()}-${random}`;
    }
    setOrderNumber(orderNumberRef.current);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const required = ["lastName", "firstName", "phone", "email"];

    for (let key of required) {
      if (!formData[key]) {
        toast.error("Please fill all required fields");
        return;
      }
    }

    setStep(2);
  };

  const handlePaymentConfirm = async () => {
    const emailData = {
      ...formData,
      orderNumber,
      message: `Premium Purchase - Canyoufind!\n\nOrder: ${orderNumber}\nTotal: ${PREMIUM_PRICE}₴\n\nCustomer: ${formData.lastName} ${formData.firstName}\nPhone: ${formData.phone}\nEmail: ${formData.email}\n\nProduct:\nPremium Account (30 days) — ${PREMIUM_PRICE}₴`,
    };

    try {
      await emailjs.send(
        "service_hllb7p1",
        "template_gdn6fcv",
        emailData,
        "v13Oo-YtABqCO9JLF"
      );

      await addDoc(collection(db, "orders"), {
        userId: user?.uid || null,
        orderNumber,
        type: "premium",
        total: PREMIUM_PRICE,
        customer: formData,
        activated: false,
        createdAt: serverTimestamp(),
      });

      if (user?.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          "premium-account": false,
          premiumExpiresAt: null,
        });
      }

      toast.success("Order received! Wait for activation");

      localStorage.removeItem("premiumPaymentStep");
      setStep(3);
    } catch (err) {
      console.error(err);
      toast.error("Error processing order");
    }
  };

  return (
    <div className="payment-container container text-white py-5">
      <h2 className="fs-2 mb-3 ms-3" style={{ color: "#fd5200" }}>
        {step === 1
          ? "Step 1: Fill Your Details"
          : step === 2
          ? "Step 2: Payment"
          : "Step 3: Done"}
      </h2>

      {step === 1 && (
        <form className="payment-form" onSubmit={handleFormSubmit}>
          <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <div className="color-red">* Be sure to provide the email address of the account you registered on the site so that we can activate your premium!</div>
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

          <input
            type="tel"
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
            Next
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="payment-summary text-center">
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
          <p><b>Total:</b> {PREMIUM_PRICE}₴</p>

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
            <p className="m-0 w-100 text-center">In payment description, enter order number and time of payment {orderNumber}</p>
          </div>

          <button className="btn btn-pay mt-3 p-1" onClick={handlePaymentConfirm}>
            I Paid, Get My Order!
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center">
          <h4>Order sent</h4>
          <p>After payment, we will activate your premium subscription.</p>
          <button className="btn btn-home mt-3" onClick={() => navigate("/")}>
            Home
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentPremium;