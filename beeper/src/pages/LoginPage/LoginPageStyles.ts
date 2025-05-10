// src/pages/LoginPage/LoginPageStyles.ts
import { makeStyles } from "tss-react/mui";
import { Theme } from "@mui/material/styles";

export const useStyles = makeStyles()((theme: Theme) => ({
  loginRoot: {
    display: "flex",
    flexDirection: "column", // Ensure content inside is stacked
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 64px - 32px)", // Full height minus header and some padding
    padding: theme.spacing(4), // Add some padding around the form container
    backgroundColor: theme.palette.background.default,
    boxSizing: "border-box",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(3, 4), // Vertical, Horizontal padding
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5], // Add some depth
    width: "100%",
    maxWidth: "420px", // Max width for the form
    boxSizing: "border-box",
  },
  title: {
    marginBottom: theme.spacing(3), // More space below title
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
  alert: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  textField: {
    // Common styling for text fields if needed, though MUI defaults are good
    // marginBottom: theme.spacing(2), // Handled by margin="normal" on TextField
  },
  submitButton: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.25, 0), // Slightly taller button
    fontSize: "1rem",
    fontWeight: 600,
  },
  linksContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center", // Center the link
    marginTop: theme.spacing(2),
  },
  toggleRoleContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(1),
  },
}));
