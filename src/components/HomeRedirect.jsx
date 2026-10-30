import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Sends each person to the first screen that makes sense for what they do. */
const HomeRedirect = () => {
  const { user, can } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role === "SUPER_ADMIN") return <Navigate to="/platform" replace />;
  if (can("dashboard:view")) return <Navigate to="/dashboard" replace />;
  if (can("order:create")) return <Navigate to="/take-order" replace />;
  return <Navigate to="/profile" replace />;
};

export default HomeRedirect;
