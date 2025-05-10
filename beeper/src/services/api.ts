// src/services/api.ts
import {
  ActivateBeepersApiResponse,
  ApiErrorResponse, // Type for what backend cart routes return
  ApiResponseMessage,
  AppAuthState, // For Operator login response
  BackendCartItem,
  BeeperModel,
  OperatorLoginApiResponse,
  PurchaseApiResponse,
  SoldBeeper, // For credentials type
  UserLoginApiResponse,
  UserRegisterApiResponse,
} from "../types";

const API_BASE_URL = "http://localhost:5001/api"; // Ensure this matches your backend port

const createBasicAuthHeader = (
  credentials: AppAuthState["credentials"]
): HeadersInit => {
  if (
    !credentials ||
    !credentials.username ||
    !credentials.password_plaintext
  ) {
    console.warn(
      "Attempted to create auth header with incomplete credentials."
    );
    return {}; // Return empty, backend should reject with 401
  }
  return {
    Authorization:
      "Basic " +
      btoa(`${credentials.username}:${credentials.password_plaintext}`),
  };
};

const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {},
  authCredentials?: AppAuthState["credentials"] // Optional credentials for Basic Auth
): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json", // Default, can be overridden
    ...options.headers,
  };

  if (authCredentials) {
    Object.assign(headers, createBasicAuthHeader(authCredentials));
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorPayload: ApiErrorResponse = {
        error: `HTTP error! Status: ${response.status} - ${response.statusText}`,
      };
      try {
        const backendError = await response.json();
        if (backendError && typeof backendError.error === "string") {
          errorPayload = backendError as ApiErrorResponse;
        }
      } catch (e) {
        console.warn("Could not parse JSON error response from backend:", e);
      }
      console.error(
        "API Error Response:",
        errorPayload,
        "on endpoint:",
        endpoint,
        "with status:",
        response.status
      );
      const errorToThrow = new Error(errorPayload.error);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      errorToThrow.details = errorPayload.details;
      throw errorToThrow;
    }

    if (response.status === 204) {
      return null as T; // Or an appropriate empty value for type T
    }
    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    // Handle non-JSON responses if necessary, or assume JSON for this app
    return (await response.text()) as unknown as T; // Fallback for non-JSON if needed, adjust T
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Fetch API Exception for ${endpoint}: ${error.message}`,
        error
      );
    } else {
      console.error(
        `Fetch API Exception for ${endpoint} (Unknown Error Type):`,
        error
      );
    }
    throw error;
  }
};

// --- Public Shop API Calls ---
export const getBeeperModels = (): Promise<BeeperModel[]> =>
  fetchApi<BeeperModel[]>("/shop/models");

// --- User Authentication API Calls ---
export const loginUser = (
  identifier: string,
  password_plaintext: string
): Promise<UserLoginApiResponse> =>
  fetchApi<UserLoginApiResponse>("/auth/login/user", {
    method: "POST",
    body: JSON.stringify({ identifier, password: password_plaintext }),
  });

export const registerUser = (
  username: string,
  email: string,
  password_plaintext: string
): Promise<UserRegisterApiResponse> =>
  fetchApi<UserRegisterApiResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password: password_plaintext }),
  });

// --- User Cart API Calls (Requires User Basic Auth) ---
export const getCart = (
  credentials: AppAuthState["credentials"]
): Promise<BackendCartItem[]> =>
  fetchApi<BackendCartItem[]>("/shop/cart", { method: "GET" }, credentials);

export const addToCart = (
  modelId: number,
  quantity: number,
  credentials: AppAuthState["credentials"]
): Promise<BackendCartItem> =>
  fetchApi<BackendCartItem>(
    "/shop/cart/add",
    {
      method: "POST",
      body: JSON.stringify({ model_id: modelId, quantity }),
    },
    credentials
  );

export const updateCartItemQuantity = (
  modelId: number,
  newQuantity: number,
  credentials: AppAuthState["credentials"]
): Promise<BackendCartItem | ApiResponseMessage> =>
  fetchApi<BackendCartItem | ApiResponseMessage>(
    `/shop/cart/item/${modelId}`,
    {
      method: "PUT",
      body: JSON.stringify({ quantity: newQuantity }),
    },
    credentials
  );

export const removeFromCart = (
  modelId: number,
  credentials: AppAuthState["credentials"]
): Promise<ApiResponseMessage> =>
  fetchApi<ApiResponseMessage>(
    `/shop/cart/item/${modelId}`,
    { method: "DELETE" },
    credentials
  );

export const purchaseBeepersFromCart = (
  credentials: AppAuthState["credentials"]
): Promise<PurchaseApiResponse> =>
  fetchApi<PurchaseApiResponse>(
    "/shop/purchase",
    {
      method: "POST", // Backend expects POST, no body needed as it uses user's cart
    },
    credentials
  );

// --- Operator Authentication API Call ---
export const loginOperator = (
  username: string,
  password_plaintext: string
): Promise<OperatorLoginApiResponse> =>
  fetchApi<OperatorLoginApiResponse>("/auth/login/operator", {
    method: "POST",
    body: JSON.stringify({ username, password: password_plaintext }),
  });

// --- Operator Protected API Calls (Requires Operator Basic Auth) ---
export const getSoldBeepers = (
  credentials: AppAuthState["credentials"]
): Promise<SoldBeeper[]> =>
  fetchApi<SoldBeeper[]>("/ops/beepers", { method: "GET" }, credentials);

export const activateBeepers = (
  beeperIds: string[],
  credentials: AppAuthState["credentials"]
): Promise<ActivateBeepersApiResponse> =>
  fetchApi<ActivateBeepersApiResponse>(
    "/ops/beepers/activate",
    {
      method: "POST",
      body: JSON.stringify({ beeper_ids: beeperIds }),
    },
    credentials
  );

export const getOperatorFavorites = (
  credentials: AppAuthState["credentials"]
): Promise<number[]> =>
  fetchApi<number[]>("/ops/favorites", { method: "GET" }, credentials);

export const addOperatorFavorite = (
  modelId: number,
  credentials: AppAuthState["credentials"]
): Promise<ApiResponseMessage> =>
  fetchApi<ApiResponseMessage>(
    `/ops/favorites/${modelId}`,
    { method: "POST" },
    credentials
  );

export const removeOperatorFavorite = (
  modelId: number,
  credentials: AppAuthState["credentials"]
): Promise<ApiResponseMessage> =>
  fetchApi<ApiResponseMessage>(
    `/ops/favorites/${modelId}`,
    { method: "DELETE" },
    credentials
  );
