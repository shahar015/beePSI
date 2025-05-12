import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth hook

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "operator";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { authState } = useAuth(); // Get authState from the hook
  const location = useLocation();

  if (authState.isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>מאמת גישה...</Typography>
      </Box>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && authState.role !== requiredRole) {
    console.warn(
      `Access Denied: User role '${authState.role}' does not match required role '${requiredRole}' for path '${location.pathname}'. Redirecting to home.`
    );
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
