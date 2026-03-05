import { Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationsContext";

import "./notification-bell.scss";

const NotificationBell = () => {
  const { unread } = useNotifications();

  return (
    <div style={{ position: "relative", cursor: "pointer" }}>
      <Bell size={30} color="white" />
      {unread.length > 0 && (
        <span
        className="unread-notification"
        ></span>
      )}
    </div>
  );
};

export default NotificationBell;