import { useAtom } from "jotai";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "../context/SnackbarContext";
import {
  loginOperator as apiLoginOperator,
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
} from "../services/api";
import { authStateAtom, cartItemsAtom, initialAuthState } from "../store/atoms"; // Added cartItemsAtom
import {
  AuthState,
  OperatorData,
  OperatorLoginApiResponse,
  UserData,
  UserLoginApiResponse,
  UserRegisterApiResponse,
} from "../types";

export const useAuth = () => {
  const [authState, setAuthState] = useAtom(authStateAtom);
  const [, setCartItems] = useAtom(cartItemsAtom); // To clear cart on logout/operator login
  const navigate = useNavigate();
  const location = useLocation();
  const { openSnackbar } = useSnackbar();

  const login = useCallback(
    async (
      identifier: string,
      password_plaintext: string,
      loginAs: "user" | "operator"
    ): Promise<boolean> => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        let response: UserLoginApiResponse | OperatorLoginApiResponse;
        let entityDetails: UserData | OperatorData;
        let role: "user" | "operator";
        let usernameForCreds: string = identifier;

        if (loginAs === "user") {
          response = await apiLoginUser(identifier, password_plaintext);
          entityDetails = (response as UserLoginApiResponse).user;
          role = "user";
          usernameForCreds = entityDetails.username;
        } else {
          response = await apiLoginOperator(identifier, password_plaintext);
          entityDetails = (response as OperatorLoginApiResponse).operator;
          role = "operator";
        }

        const newAuthState: AuthState = {
          isAuthenticated: true,
          isLoading: false,
          credentials: { username: usernameForCreds, password_plaintext },
          role: role,
          loggedInEntityDetails: entityDetails,
        };
        setAuthState(newAuthState);
        openSnackbar(response.message || "Login successful!", "success");

        if (role === "user") {
          const fromState = location.state as {
            from?: { pathname: string };
          } | null;
          const fromPath = fromState?.from?.pathname || "/";
          navigate(fromPath, { replace: true });
        } else {
          setCartItems([]); // Clear cart for operator
          navigate("/ops-center");
        }
        return true;
      } catch (err) {
        const error = err as Error;
        openSnackbar(
          error.message || "Login failed. Please check credentials.",
          "error"
        );
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          credentials: null,
          role: null,
          loggedInEntityDetails: null,
        }));
        return false;
      }
    },
    [setAuthState, setCartItems, navigate, openSnackbar, location.state]
  );

  const register = useCallback(
    async (
      username: string,
      email: string,
      password_plaintext: string
    ): Promise<boolean> => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response: UserRegisterApiResponse = await apiRegisterUser(
          username,
          email,
          password_plaintext
        );
        openSnackbar(
          response.message || "Registration successful! Please log in.",
          "success"
        );
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        navigate("/login");
        return true;
      } catch (err) {
        const error = err as Error;
        openSnackbar(
          error.message || "Registration failed. Please try again.",
          "error"
        );
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }
    },
    [setAuthState, navigate, openSnackbar]
  );

  const logout = useCallback(() => {
    setAuthState(initialAuthState);
    setCartItems([]); // Clear cart on logout
    openSnackbar("Logged out successfully.", "info");
    navigate("/login");
  }, [setAuthState, setCartItems, navigate, openSnackbar]);

  return {
    authState,
    login,
    register,
    logout,
  };
};
