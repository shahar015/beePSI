// src/components/ProtectedRoute/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppAuthState } from "../../types"; // Import the AppAuthState type

interface ProtectedRouteProps {
  children: React.ReactNode; // The component to render if authorized
  isAuthenticated: boolean;
  userRole: AppAuthState["role"]; // 'user' | 'operator' | null
  requiredRole?: "user" | "operator"; // Optional: specify which role is needed
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated,
  userRole,
  requiredRole,
}) => {
  const location = useLocation(); // To redirect back after login

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    // Pass the current location to redirect the user back after successful login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // If authenticated but the role does not match the required role,
    // redirect to a general page (e.g., home page or an "unauthorized" page).
    // For simplicity, redirecting to home.
    console.warn(
      `Access Denied: User role '${userRole}' does not match required role '${requiredRole}' for path '${location.pathname}'. Redirecting to home.`
    );
    return <Navigate to="/" replace />;
  }

  // If authenticated and (no specific role is required OR the role matches), render the children
  return <>{children}</>;
};
