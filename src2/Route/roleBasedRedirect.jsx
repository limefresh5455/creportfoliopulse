import { Navigate } from "react-router-dom";

export const RoleBasedRedirect = () => {
  const role = sessionStorage.getItem("role");

  if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
  if (role === "user") return <Navigate to="/dashboard" replace />;
  if (role === "superuser") return <Navigate to="/admin-management" replace />;

  return <Navigate to="/" replace />;
};
