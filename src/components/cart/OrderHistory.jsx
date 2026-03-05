import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

import './order-history.scss';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(list);
    });

    return () => unsub();
  }, [user]);

  if (!user) return <p>Please log in to view your orders.</p>;

  if (orders.length === 0) return <p>You have no orders yet.</p>;

  return (
    <div className="order-history container">
    <h5 className="order-history-title" onClick={() => setIsOpen(!isOpen)}>
      Order History <span className={`arrow ${isOpen ? "open" : ""}`}></span>
    </h5>
      {isOpen && (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card mb-3 p-3 border rounded">
              <p><b>Order Number:</b> {order.orderNumber}</p>
              <p><b>Total:</b> {order.total}₴</p>
              <p><b>Items:</b></p>
              <ul>
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.name}
                    {item.size ? `, size: ${item.size}` : ""}
                    {item.quantity ? ` × ${item.quantity}` : ""}
                    — {item.price * (item.quantity || 1)}₴
                  </li>
                ))}
              </ul>
              <p><b>Date:</b> {order.createdAt?.toDate().toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;