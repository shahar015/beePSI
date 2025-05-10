// src/types.ts

export interface BeeperModel {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

export interface CartItem extends BeeperModel {
  quantity: number;
  // cart_item_id?: number; // If backend sends a specific ID for the cart entry itself
}

export interface SoldBeeper {
  id: string; // UUID from backend
  model_id: number;
  model_name: string;
  purchase_timestamp: string;
  status: "active" | "activated";
  user_id: number;
}

export interface UserData {
  // Data for a regular shop user
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

export interface OperatorData {
  // Data for an Ops Center operator
  id: number;
  username: string;
}

// Simplified Authentication State for App.tsx
export interface AppAuthState {
  isAuthenticated: boolean;
  isLoading: boolean; // For async operations like login/register
  // Store plaintext credentials for Basic Auth (ONLY FOR THIS SIMPLIFIED PROJECT)
  credentials: { username: string; password_plaintext: string } | null;
  role: "user" | "operator" | null;
  loggedInEntityDetails: UserData | OperatorData | null; // Details of the logged-in entity
}

export interface ApiResponseMessage {
  message: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

// Structure of a cart item as returned from backend API (includes nested model details)
export interface BackendCartItem {
  cart_item_id: number;
  user_id: number;
  model_id: number;
  quantity: number;
  added_at: string;
  model_details: BeeperModel;
}

export type SnackbarSeverity = "success" | "error" | "warning" | "info";

// Specific type for the response from user login API
export interface UserLoginApiResponse {
  message: string;
  user: UserData;
  role: "user"; // Backend confirms the role
}

// Specific type for the response from operator login API
export interface OperatorLoginApiResponse {
  message: string;
  operator: OperatorData;
  role: "operator"; // Backend confirms the role
}

// Specific type for user registration API response
export interface UserRegisterApiResponse {
  message: string;
  user: UserData;
}

// Specific type for activate beepers API response
export interface ActivateBeepersApiResponse {
  message: string;
  activated_ids: string[];
  errors: string[] | null;
}

// Specific type for purchase API response
export interface PurchaseApiResponse {
  message: string;
  items_purchased_count?: number; // Example, adjust to actual backend response
  purchased_beepers?: SoldBeeper[];
}
