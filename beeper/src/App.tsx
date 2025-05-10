// src/App.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Snackbar,
  Alert as MuiAlert,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Header } from "./components/Header/Header";
import { PagerShop } from "./pages/PagerShop/PagerShop";
import { OpsCenter } from "./pages/OpsCenter/OpsCenter";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage";
import { CartPage } from "./pages/CartPage/CartPage";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import {
  AppAuthState,
  CartItem,
  UserData,
  OperatorData,
  BeeperModel,
  SnackbarSeverity,
  BackendCartItem,
} from "./types";
import {
  loginOperator as apiLoginOperator,
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  purchaseBeepersFromCart as apiPurchaseBeepersFromCart,
  getBeeperModels as apiGetBeeperModels,
} from "./services/api";
import { useStyles } from "./AppStyles";

const initialAuthState: AppAuthState = {
  isAuthenticated: false,
  isLoading: false,
  credentials: null,
  role: null,
  loggedInEntityDetails: null,
};

const transformBackendCartToFrontend = (
  backendCart: BackendCartItem[] | null
): CartItem[] => {
  if (!backendCart) return [];
  return backendCart.map((item) => ({
    id: item.model_details.id,
    name: item.model_details.name,
    description: item.model_details.description,
    price: item.model_details.price,
    image_url: item.model_details.image_url,
    quantity: item.quantity,
  }));
};

const App: React.FC = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const [authState, setAuthState] = useState<AppAuthState>(initialAuthState);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [beeperModels, setBeeperModels] = useState<BeeperModel[]>([]);
  const [shopLoading, setShopLoading] = useState<boolean>(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<SnackbarSeverity>("info");

  const openSnackbar = useCallback(
    (message: string, severity: SnackbarSeverity = "info") => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    },
    []
  );

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const fetchCartItems = useCallback(
    async (credentials: AppAuthState["credentials"]) => {
      if (authState.role === "user" && credentials) {
        setCartLoading(true);
        try {
          const backendCart = await apiGetCart(credentials);
          setCartItems(transformBackendCartToFrontend(backendCart || []));
        } catch (err) {
          const error = err as Error;
          openSnackbar(error.message || "טעינת עגלה נכשלה.", "error");
          setCartItems([]);
        } finally {
          setCartLoading(false);
        }
      } else {
        setCartItems([]);
      }
    },
    [authState.role, openSnackbar]
  );

  const handleLoginSuccess = useCallback(
    (
      creds: { username: string; password_plaintext: string },
      entityDetails: UserData | OperatorData,
      role: "user" | "operator"
    ) => {
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        credentials: creds,
        role: role,
        loggedInEntityDetails: entityDetails,
      });
      openSnackbar("התחברות בוצעה בהצלחה!", "success");
      if (role === "user") {
        fetchCartItems(creds);
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else if (role === "operator") {
        setCartItems([]);
        navigate("/ops-center");
      }
    },
    [navigate, openSnackbar, location.state, fetchCartItems]
  );

  const handleLogout = useCallback(() => {
    setAuthState(initialAuthState);
    setCartItems([]);
    openSnackbar("התנתקות בוצעה בהצלחה.", "info");
    navigate("/login");
  }, [navigate, openSnackbar]);

  useEffect(() => {
    if (authState.role === "user" && authState.credentials) {
      fetchCartItems(authState.credentials);
    } else if (!authState.isAuthenticated) {
      setCartItems([]);
    }
  }, [
    authState.credentials,
    authState.role,
    authState.isAuthenticated,
    fetchCartItems,
  ]);

  const handleAddToCart = async (model: BeeperModel, quantity: number) => {
    if (
      !authState.isAuthenticated ||
      authState.role !== "user" ||
      !authState.credentials
    ) {
      openSnackbar("אנא התחבר כדי לצפות בעגלה שלך.", "warning");
      navigate("/login");
      return;
    }
    setCartLoading(true); // Use general cart loading
    try {
      await apiAddToCart(model.id, quantity, authState.credentials);
      await fetchCartItems(authState.credentials); // Refetch entire cart
      openSnackbar(`${model.name} התווסף לעגלה!`, "success");
    } catch (err) {
      const error = err as Error;
      openSnackbar(error.message || "קרתה שגיאה בזמן הוספה לעגלה.", "error");
    } finally {
      setCartLoading(false);
    }
  };

  const handleRemoveFromCart = async (modelId: number) => {
    if (
      !authState.isAuthenticated ||
      authState.role !== "user" ||
      !authState.credentials
    )
      return;
    setCartLoading(true);
    try {
      await apiRemoveFromCart(modelId, authState.credentials);
      await fetchCartItems(authState.credentials); // Refetch entire cart
      openSnackbar("מוצר נמחק מעגלה.", "info");
    } catch (err) {
      const error = err as Error;
      openSnackbar(error.message || "כשל במחיקת מוצר מהעגלה.", "error");
    } finally {
      setCartLoading(false);
    }
  };

  const handleUpdateCartQuantity = async (
    modelId: number,
    newQuantity: number
  ) => {
    if (
      !authState.isAuthenticated ||
      authState.role !== "user" ||
      !authState.credentials
    )
      return;
    if (newQuantity < 1) {
      handleRemoveFromCart(modelId);
      return;
    }
    setCartLoading(true);
    try {
      await apiUpdateCartItemQuantity(
        modelId,
        newQuantity,
        authState.credentials
      );
      await fetchCartItems(authState.credentials); // Refetch entire cart
      openSnackbar("כמות מוצר עודכנה בהצלחה.", "success");
    } catch (err) {
      const error = err as Error;
      openSnackbar(error.message || "כשל בעדכון כמות מוצר.", "error");
    } finally {
      setCartLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (
      !authState.isAuthenticated ||
      authState.role !== "user" ||
      !authState.credentials
    ) {
      openSnackbar("אנא התחבר להשלמת הקנייה.", "warning");
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) {
      openSnackbar("העגלה שלך ריקה.", "info");
      return;
    }
    setCartLoading(true);
    try {
      const response = await apiPurchaseBeepersFromCart(authState.credentials);
      openSnackbar(response.message || "רכישה בוצעה בהצלחה!", "success");
      await fetchCartItems(authState.credentials);
    } catch (err) {
      const error = err as Error;
      openSnackbar(error.message || "רכישה נכשלה.", "error");
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    const fetchModels = async () => {
      setShopLoading(true);
      try {
        const models = await apiGetBeeperModels();
        setBeeperModels(models);
      } catch (err) {
        const error = err as Error;
        openSnackbar(error.message || "כשל בטעינת ביפרים.", "error");
      } finally {
        setShopLoading(false);
      }
    };
    fetchModels();
  }, [openSnackbar]);

  if (authState.isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
        <Typography>Authenticating...</Typography>
      </div>
    );
  }

  return (
    <div className={classes.appRoot}>
      <Header
        isAuthenticated={authState.isAuthenticated}
        username={authState.loggedInEntityDetails?.username || null}
        role={authState.role}
        onLogout={handleLogout}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      <main className={classes.mainContent}>
        <Routes>
          <Route
            path="/"
            element={
              <PagerShop
                beeperModels={beeperModels}
                loading={shopLoading}
                onAddToCart={handleAddToCart}
                openSnackbar={openSnackbar}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                openSnackbar={openSnackbar}
                apiLoginUser={apiLoginUser}
                apiLoginOperator={apiLoginOperator}
              />
            }
          />
          <Route
            path="/register"
            element={
              <RegisterPage
                openSnackbar={openSnackbar}
                apiRegisterUser={apiRegisterUser}
              />
            }
          />
          <Route
            path="/ops-center"
            element={
              <ProtectedRoute
                isAuthenticated={authState.isAuthenticated}
                userRole={authState.role}
                requiredRole="operator"
              >
                <OpsCenter
                  operatorCredentials={authState.credentials}
                  openSnackbar={openSnackbar}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute
                isAuthenticated={authState.isAuthenticated}
                userRole={authState.role}
                requiredRole="user"
              >
                <CartPage
                  cartItems={cartItems}
                  cartLoading={cartLoading} // General cart loading state
                  // itemUpdatingId prop removed
                  onRemoveItem={handleRemoveFromCart}
                  onUpdateQuantity={handleUpdateCartQuantity}
                  onPurchase={handlePurchase}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default App;
