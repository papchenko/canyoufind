import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminPanel = () => {
  // role: "admin"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendNotification = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "notifications"), {
        userId: "all",
        message,
        createdAt: serverTimestamp(),
      });
      setMessage("");
      toast.success("Notification sent!");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Error sending notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin Panel</h2>
      <textarea
        className="form-control mt-3"
        placeholder="Enter notification message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        className="btn btn-primary mt-3"
        onClick={sendNotification}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Notification"}
      </button>
    </div>
  );
};

export default AdminPanel;
