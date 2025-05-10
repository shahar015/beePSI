// src/AppStyles.ts
import { makeStyles } from "tss-react/mui";
import { Theme } from "@mui/material/styles";

export const useStyles = makeStyles()((theme: Theme) => ({
  appRoot: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh", // Ensure app takes full viewport height
    backgroundColor: theme.palette.background.default,
  },
  mainContent: {
    flexGrow: 1, // Allow main content to take available space below the header
    padding: 0, // Pages will handle their own padding
    // Example: If you want a consistent padding around page content (excluding header)
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: "100%",
    boxSizing: "border-box",
    display: "flex", // To allow content within to also grow if needed
    flexDirection: "column", // Stack content vertically
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Full viewport height for initial loading
    gap: theme.spacing(2),
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.default,
  },
}));
