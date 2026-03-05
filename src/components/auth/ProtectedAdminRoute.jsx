import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ADMIN_EMAIL = "cadmin@gmail.com";

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
