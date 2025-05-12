import { useAtom } from "jotai";
import { useCallback, useEffect } from "react"; // Added useEffect
import {
  authStateAtom,
  cartItemsAtom,
  cartLoadingAtom,
  cartErrorAtom,
} from "../store/atoms";
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  purchaseBeepersFromCart as apiPurchaseBeepersFromCart,
} from "../services/api";
import {
  CartItem,
  BeeperModel,
  BackendCartItem,
  PurchaseApiResponse,
} from "../types";
import { useSnackbar } from "../context/SnackbarContext";

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

export const useCart = () => {
  const [authState] = useAtom(authStateAtom);
  const [cartItems, setCartItems] = useAtom(cartItemsAtom);
  const [isLoading, setIsLoading] = useAtom(cartLoadingAtom);
  const [error, setError] = useAtom(cartErrorAtom);
  const { openSnackbar } = useSnackbar();

  const fetchCart = useCallback(async () => {
    if (authState.role !== "user" || !authState.credentials) {
      setCartItems([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const backendCart = await apiGetCart(authState.credentials);
      setCartItems(transformBackendCartToFrontend(backendCart || []));
    } catch (err) {
      const apiError = err as Error;
      const errorMessage = apiError.message || "Failed to fetch cart.";
      setError(errorMessage);
      openSnackbar(errorMessage, "error");
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    authState.role,
    authState.credentials,
    setCartItems,
    setIsLoading,
    setError,
    openSnackbar,
  ]); // Corrected: setCartItems was in deps, should be openSnackbar

  useEffect(() => {
    if (
      authState.isAuthenticated &&
      authState.role === "user" &&
      authState.credentials
    ) {
      fetchCart();
    } else {
      setCartItems([]); // Clear cart if not authenticated user
    }
  }, [
    authState.isAuthenticated,
    authState.role,
    authState.credentials,
    fetchCart,
    setCartItems,
  ]);

  const addItemToCart = useCallback(
    async (model: BeeperModel, quantity: number): Promise<boolean> => {
      if (authState.role !== "user" || !authState.credentials) {
        openSnackbar("Please log in to add items to your cart.", "warning");
        return false;
      }
      setIsLoading(true);
      setError(null);
      try {
        await apiAddToCart(model.id, quantity, authState.credentials);
        await fetchCart();
        openSnackbar(`${model.name} added to cart!`, "success");
        return true;
      } catch (err) {
        const apiError = err as Error;
        const errorMessage = apiError.message || "Failed to add item to cart.";
        setError(errorMessage);
        openSnackbar(errorMessage, "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [
      authState.role,
      authState.credentials,
      fetchCart,
      setIsLoading,
      setError,
      openSnackbar,
    ]
  );

  const removeItemFromCart = useCallback(
    async (modelId: number): Promise<boolean> => {
      if (authState.role !== "user" || !authState.credentials) return false;
      setIsLoading(true);
      setError(null);
      try {
        await apiRemoveFromCart(modelId, authState.credentials);
        await fetchCart();
        openSnackbar("Item removed from cart.", "info");
        return true;
      } catch (err) {
        const apiError = err as Error;
        const errorMessage =
          apiError.message || "Failed to remove item from cart.";
        setError(errorMessage);
        openSnackbar(errorMessage, "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [
      authState.role,
      authState.credentials,
      fetchCart,
      setIsLoading,
      setError,
      openSnackbar,
    ]
  );

  const updateItemQuantity = useCallback(
    async (modelId: number, newQuantity: number): Promise<boolean> => {
      if (authState.role !== "user" || !authState.credentials) return false;
      if (newQuantity < 1) {
        return removeItemFromCart(modelId);
      }
      setIsLoading(true);
      setError(null);
      try {
        await apiUpdateCartItemQuantity(
          modelId,
          newQuantity,
          authState.credentials
        );
        await fetchCart();
        openSnackbar("Cart quantity updated.", "success");
        return true;
      } catch (err) {
        const apiError = err as Error;
        const errorMessage =
          apiError.message || "Failed to update cart quantity.";
        setError(errorMessage);
        openSnackbar(errorMessage, "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [
      authState.role,
      authState.credentials,
      fetchCart,
      removeItemFromCart,
      setIsLoading,
      setError,
      openSnackbar,
    ]
  );

  const purchaseCart = useCallback(async (): Promise<boolean> => {
    if (authState.role !== "user" || !authState.credentials) {
      openSnackbar("Please log in to complete your purchase.", "warning");
      return false;
    }
    if (cartItems.length === 0) {
      openSnackbar("Your cart is empty.", "info");
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response: PurchaseApiResponse = await apiPurchaseBeepersFromCart(
        authState.credentials
      );
      openSnackbar(response.message || "Purchase successful!", "success");
      await fetchCart();
      return true;
    } catch (err) {
      const apiError = err as Error;
      const errorMessage = apiError.message || "Purchase failed.";
      setError(errorMessage);
      openSnackbar(errorMessage, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    authState.role,
    authState.credentials,
    cartItems.length,
    fetchCart,
    setIsLoading,
    setError,
    openSnackbar,
  ]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    isLoading,
    error,
    fetchCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    purchaseCart,
    cartItemCount, // Expose cart item count
  };
};
