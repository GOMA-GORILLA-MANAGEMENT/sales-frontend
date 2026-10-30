import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Spinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF6F00]"></div>
  </div>
);

/**
 * Signed-in people only. Pass `permission` to also require a permission, or `platform` for the
 * super admin console. Anyone else is sent to the page that suits their role.
 */
const ProtectedRoute = ({ children, permission, platform, any }) => {
  const { isAuthenticated, loading, user, can } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!isAuthenticated()) return <Navigate to="/auth/login" state={{ from: location }} replace />;

  const isPlatform = user.role === "SUPER_ADMIN";
  if (platform && !isPlatform) return <Navigate to="/app" replace />;
  if (!platform && isPlatform) return <Navigate to="/platform" replace />;
  if (permission && !can(permission)) return <Navigate to="/app" replace />;
  if (any && !any.some(can)) return <Navigate to="/app" replace />;
  return children;
};

export default ProtectedRoute;
