import { atom } from "jotai";
import {
  AuthState,
  BeeperModel,
  CartItem,
  SnackbarState,
  SnackbarSeverity,
} from "../types";

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  credentials: null,
  role: null,
  loggedInEntityDetails: null,
};

export const authStateAtom = atom<AuthState>(initialAuthState);

export const beeperModelsAtom = atom<BeeperModel[]>([]);
export const shopLoadingAtom = atom<boolean>(true);
export const shopErrorAtom = atom<string | null>(null);

export const cartItemsAtom = atom<CartItem[]>([]);
export const cartLoadingAtom = atom<boolean>(false);
export const cartErrorAtom = atom<string | null>(null);

export const initialSnackbarState: SnackbarState = {
  open: false,
  message: "",
  severity: "info" as SnackbarSeverity,
};

export const snackbarStateAtom = atom<SnackbarState>(initialSnackbarState);
