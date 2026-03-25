// import { useState } from "react";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "../../firebase";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const AdminPanel = () => {
//   // role: "admin"
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const sendNotification = async () => {
//     if (!message.trim()) return;
//     setLoading(true);
//     try {
//       await addDoc(collection(db, "notifications"), {
//         userId: "all",
//         message,
//         createdAt: serverTimestamp(),
//       });
//       setMessage("");
//       toast.success("Notification sent!");
//     } catch (error) {
//       console.error("Error sending notification:", error);
//       toast.error("Error sending notification");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2>Admin Panel</h2>
//       <textarea
//         className="form-control mt-3"
//         placeholder="Enter notification message..."
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//       />
//       <button
//         className="btn btn-primary mt-3"
//         onClick={sendNotification}
//         disabled={loading}
//       >
//         {loading ? "Sending..." : "Send Notification"}
//       </button>
//     </div>
//   );
// };

// export default AdminPanel;

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";

const AdminPanel = () => {
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const q = query(collection(db, "orders"), where("type", "==", "premium"));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setOrders(data.reverse());
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const sendNotification = async () => {
    if (!message.trim()) return;

    await addDoc(collection(db, "notifications"), {
      userId: "all",
      message,
      createdAt: serverTimestamp(),
    });

    setMessage("");
    toast.success("Notification sent!");
  };

  const activatePremium = async (order) => {
    try {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);

      await updateDoc(doc(db, "users", order.userId), {
        "premium-account": true,
        premiumExpiresAt: Timestamp.fromDate(expires),
      });

      await updateDoc(doc(db, "orders", order.id), {
        activated: true,
      });

      toast.success("Premium activated");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Error activating premium");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin Panel</h2>

      <textarea
        className="form-control mt-3"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button className="btn btn-primary mt-2" onClick={sendNotification}>
        Send Notification
      </button>

      <h3 className="mt-5">Premium Orders</h3>

      {orders.map((order) => (
        <div key={order.id} className="border p-3 mt-3">
          <p><b>{order.orderNumber}</b></p>
          <p>{order.customer?.email}</p>
          <p>{order.total}₴</p>

          {order.activated ? (
            <span style={{ color: "lime" }}>Activated</span>
          ) : (
            <button
              className="btn btn-success"
              onClick={() => activatePremium(order)}
            >
              Activate
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;