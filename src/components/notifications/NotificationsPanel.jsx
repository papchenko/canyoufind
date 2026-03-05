import { useNotifications } from "../../context/NotificationsContext";
import { motion, AnimatePresence } from "framer-motion";

import "./notifications.scss";

const NotificationsPanel = ({ onClose }) => {
  const { notifications, markAsRead } = useNotifications();

  return (
    <AnimatePresence>
      <motion.div
        className="notifications-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="notifications-panel"
          onClick={(e) => e.stopPropagation()}
          initial={{ y: "-20%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-20%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="notifications-header">
            <h5 className="title vh">Notifications</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="notifications-body">
            {notifications.length === 0 ? (
              <p className="text-muted text-center mt-5">No notifications yet</p>
            ) : (
              <ul className="notifications-list">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`notification-item ${
                      n.read ? "read" : "unread"
                    }`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="notification-message">{n.message}</div>
                    <div className="notification-time">
                      {n.createdAt?.toDate?.().toLocaleString?.() || "—"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationsPanel;