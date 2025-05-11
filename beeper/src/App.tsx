import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { useState } from "react";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import Footer from "./components/Footer";
import Header from "./components/Header"; // ודא נתיבים
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/LoginPage";
import OpsDashboardPage from "./pages/OpsDashboardPage";
import ShopPage from "./pages/ShopPage";
import { purchaseBeepers } from "./services/api";
import { BeeperModel, CartItem } from "./types";

// Create rtl cache
const rtlCache = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

// הגדרת ערכת נושא בסיסית (ניתן להרחיב ולהתאים אישית)
const theme = createTheme({
  direction: "rtl",
  palette: {
    mode: "dark", // ערכת נושא כהה למראה מודרני/צבאי
    primary: {
      main: "#6600CC", // צבע הדגשה (טורקיז/ציאן)
    },
    secondary: {
      main: "#ffab40", // צבע משני (כתום)
    },
    background: {
      default: "#121212", // רקע כהה
      paper: "#1e1e1e", // רקע לקומפוננטות כמו קארדים
    },
  },
  typography: {
    fontFamily: "system-ui, sans-serif", // פונט מודרני
  },
});

function App() {
  // ניהול מצב ראשי
  const [currentPage, setCurrentPage] = useState<string>("/shop"); // ניהול ניווט
  const [cart, setCart] = useState<CartItem[]>([]);
  const [credentials, setCredentials] = useState<{
    user: string;
    pass: string;
  } | null>(null); // null = not logged in
  const [checkoutState, setCheckoutState] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({
    loading: false,
    error: null,
    success: false,
  });

  // פונקציות לניהול עגלה
  const addToCart = (modelToAdd: BeeperModel) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === modelToAdd.id);
      if (existingItem) {
        // הגדל כמות
        return prevCart.map((item) =>
          item.id === modelToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // הוסף פריט חדש
        return [...prevCart, { ...modelToAdd, quantity: 1 }];
      }
<<<<<<< Updated upstream
    });
    setCheckoutState({ loading: false, error: null, success: false }); // אפס סטטוס רכישה
=======
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
      openSnackbar("אנא התחבר כמשתמש כדי לצפות בעגלה שלך.", "warning");
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
>>>>>>> Stashed changes
  };

  const updateCartQuantity = (modelId: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === modelId ? { ...item, quantity: quantity } : item
      )
    );
  };

  const removeFromCart = (modelId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== modelId));
  };

  // פונקציית רכישה
  const handleCheckout = async () => {
    setCheckoutState({ loading: true, error: null, success: false });
    try {
      const itemsToPurchase = cart.map((item) => ({
        model_id: item.id,
        quantity: item.quantity,
      }));
      await purchaseBeepers(itemsToPurchase);
      setCart([]); // רוקן עגלה
      setCheckoutState({ loading: false, error: null, success: true });
    } catch (err: any) {
      setCheckoutState({
        loading: false,
        error: err.message || "Purchase failed",
        success: false,
      });
    }
  };

  // פונקציות ניהול הזדהות
  const handleLoginSuccess = (creds: { user: string; pass: string }) => {
    setCredentials(creds);
    setCurrentPage("/ops/dashboard"); // נווט ללוח הבקרה
  };

  const handleLogout = () => {
    setCredentials(null);
    setCurrentPage("/shop"); // חזור לחנות
  };

  // ניווט
  const navigate = (page: string) => {
    // אם מנסים לגשת לדף מוגן ולא מחוברים, הפנה לכניסה
    if (page.startsWith("/ops/") && page !== "/ops/login" && !credentials) {
      setCurrentPage("/ops/login");
    } else {
      setCurrentPage(page);
      // אפס סטטוס רכישה במעבר עמוד
      if (page !== "/cart") {
        setCheckoutState({ loading: false, error: null, success: false });
      }
    }
  };

  // קביעת איזה עמוד להציג
  const renderPage = () => {
    switch (currentPage) {
      case "/shop":
        return <ShopPage onAddToCart={addToCart} credentials={credentials} />;
      case "/favorites":
        return (
          <FavoritesPage onAddToCart={addToCart} credentials={credentials} />
        );
      case "/cart":
        return (
          <CartPage
            cartItems={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckout}
            checkoutLoading={checkoutState.loading}
            checkoutError={checkoutState.error}
            checkoutSuccess={checkoutState.success}
          />
        );
      case "/ops/login":
        // אם כבר מחובר, הפנה לדשבורד
        if (credentials) {
          navigate("/ops/dashboard");
          return null; // או הצג את הדשבורד ישירות
        }
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case "/ops/dashboard":
        if (!credentials) {
          navigate("/ops/login"); // אם לא מחובר, הפנה לכניסה
          return null;
        }
        return <OpsDashboardPage credentials={credentials} />;
      default:
        return <ShopPage onAddToCart={addToCart} credentials={credentials} />; // דף ברירת מחדל
    }
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* איפוס עיצובי דפדפן בסיסיים */}
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <Header
            isOpsCenter={currentPage.startsWith("/ops/")}
            cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            onNavigate={navigate}
            onLogout={handleLogout}
            isLoggedIn={!!credentials}
          />
          <Container component="main" sx={{ flexGrow: 1 }}>
            {renderPage()}
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
