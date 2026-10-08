import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  // If user is authenticated but doesn't have the required role, redirect to their default dashboard
  // (You could also redirect to an unauthorized page)
  return <Navigate to="/" replace />;
};

export default RoleRoute;
