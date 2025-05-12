import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  Snackbar,
  Alert as MuiAlert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { useAtom } from "jotai";
import { Header } from "./components/Header/Header";
import { PagerShop } from "./pages/PagerShop/PagerShop";
import { OpsCenter } from "./pages/OpsCenter/OpsCenter";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage";
import { CartPage } from "./pages/CartPage/CartPage";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { authStateAtom, snackbarStateAtom } from "./store/atoms";
import { useAuth } from "./hooks/useAuth";
import { useBeeperShop } from "./hooks/useBeeperShop";
import { useCart } from "./hooks/useCart";
import { useSnackbar } from "./context/SnackbarContext";
import { useStyles } from "./AppStyles";

const App: React.FC = () => {
  const { classes } = useStyles();
  const [authState] = useAtom(authStateAtom);
  const [snackbarState] = useAtom(snackbarStateAtom);

  const { logout } = useAuth();
  const {
    beeperModels,
    isLoading: isShopLoading,
    refreshBeeperModels,
  } = useBeeperShop();
  const {
    cartItems,
    isLoading: isCartLoading,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    purchaseCart,
    cartItemCount,
    fetchCart,
  } = useCart();
  const { closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (
      authState.isAuthenticated &&
      authState.role === "user" &&
      authState.credentials
    ) {
      fetchCart();
    }
  }, [
    authState.isAuthenticated,
    authState.role,
    authState.credentials,
    fetchCart,
  ]);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      // Optionally clear beeper models or other shop-specific state on logout
      // For now, shop models persist unless explicitly refreshed.
    }
  }, [authState.isAuthenticated, refreshBeeperModels]);

  if (authState.isLoading && !authState.isAuthenticated) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
        <Typography>טוען אפליקציה...</Typography>
      </Box>
    );
  }

  return (
    <div className={classes.appRoot}>
      <Header
        isAuthenticated={authState.isAuthenticated}
        username={authState.loggedInEntityDetails?.username || null}
        role={authState.role}
        onLogout={logout}
        cartItemCount={cartItemCount}
      />
      <main className={classes.mainContent}>
        <Routes>
          <Route
            path="/"
            element={
              <PagerShop
                beeperModels={beeperModels}
                loading={isShopLoading}
                onAddToCart={addItemToCart}
              />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/ops-center"
            element={
              <ProtectedRoute
                isAuthenticated={authState.isAuthenticated}
                isLoadingAuth={authState.isLoading}
                userRole={authState.role}
                requiredRole="operator"
              >
                <OpsCenter operatorCredentials={authState.credentials} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute
                isAuthenticated={authState.isAuthenticated}
                isLoadingAuth={authState.isLoading}
                userRole={authState.role}
                requiredRole="user"
              >
                <CartPage
                  cartItems={cartItems}
                  cartLoading={isCartLoading}
                  onRemoveItem={removeItemFromCart}
                  onUpdateQuantity={updateItemQuantity}
                  onPurchase={purchaseCart}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={closeSnackbar}
          severity={snackbarState.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarState.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default App;
