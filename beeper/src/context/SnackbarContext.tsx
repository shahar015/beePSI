import React, { createContext, useContext } from "react";
import { useAtom } from "jotai";
import { snackbarStateAtom, initialSnackbarState } from "../store/atoms";
import { SnackbarSeverity } from "../types";

interface SnackbarContextType {
  openSnackbar: (message: string, severity?: SnackbarSeverity) => void;
  closeSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [, setSnackbarState] = useAtom(snackbarStateAtom);

  const openSnackbar = (
    message: string,
    severity: SnackbarSeverity = "info"
  ) => {
    setSnackbarState({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbarState(initialSnackbarState);
  };

  return (
    <SnackbarContext.Provider value={{ openSnackbar, closeSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
};
