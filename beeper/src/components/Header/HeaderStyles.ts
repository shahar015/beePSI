// src/components/Header/HeaderStyles.ts
import { makeStyles } from "tss-react/mui"; // Import TssTheme for explicit theme typing
import { alpha } from "@mui/material/styles"; // For color manipulation

// Define interface for props if styles depend on them (not needed for this Header)
// interface HeaderStylesProps {}

export const useStyles = makeStyles()(
  // No props generic needed here
  (theme) => ({
    // Explicitly type theme with TssTheme or your custom Theme
    headerRoot: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing(1.5, 3), // Adjusted padding
      backgroundColor: theme.palette.background.paper,
      borderBottom: `1px solid ${theme.palette.divider}`,
      position: "sticky", // Make header sticky
      top: 0,
      left: 0, // Ensure it spans full width when sticky
      right: 0, // Ensure it spans full width when sticky
      zIndex: theme.zIndex.appBar, // Ensure it's above other content
      width: "100%",
      boxSizing: "border-box",
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      textDecoration: "none", // Remove underline from link-like behavior
      cursor: "pointer",
      gap: theme.spacing(1), // Space between icon and text if you add an icon
    },
    logoText: {
      fontWeight: 700, // Bolder
      fontSize: "1.75rem", // Slightly larger
      color: theme.palette.primary.main,
      "&:hover": {
        color: theme.palette.primary.light,
      },
    },
    logoIcon: {
      color: theme.palette.primary.main,
      height: 30,
    },
    navContainer: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1.5), // Spacing between nav items
    },
    navButton: {
      // Common style for nav buttons
      padding: 0,
      // padding: theme.spacing(0.75, 0.5),
      color: theme.palette.text.secondary, // Default color for links
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08), // Subtle hover
        color: theme.palette.primary.light,
      },
      "&.active": {
        // For active route, if using NavLink
        color: theme.palette.primary.main,
        fontWeight: 700,
      },
    },
    authActionsContainer: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
    },
    userInfo: {
      color: theme.palette.text.secondary,
      marginRight: theme.spacing(1.5), // Space before logout button
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(0.5),
    },
    userRoleText: {
      fontSize: "0.8rem",
      color: theme.palette.text.disabled,
      fontStyle: "italic",
    },
    cartButton: {
      // Specific styling for cart IconButton if needed
      color: theme.palette.text.secondary,
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        color: theme.palette.primary.light,
      },
    },
    logoutButton: {
      // Inherits navButton styles if className is combined, or define specific
      color: theme.palette.secondary.light, // Make logout slightly different
      "&:hover": {
        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
        color: theme.palette.secondary.main,
      },
    },
  })
);
