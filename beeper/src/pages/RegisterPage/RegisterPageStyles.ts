// src/pages/RegisterPage/RegisterPageStyles.ts
import { makeStyles } from "tss-react/mui";
import { Theme } from "@mui/material/styles";

export const useStyles = makeStyles()((theme: Theme) => ({
  registerRoot: {
    display: "flex",
    flexDirection: "column",
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
    maxWidth: "450px", // Max width for the form
    boxSizing: "border-box",
  },
  title: {
    marginBottom: theme.spacing(3),
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
  alert: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  textField: {
    // Styles for TextField if needed, margin="normal" is used on the component
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
}));
