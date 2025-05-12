// src/components/Header/HeaderStyles.ts
import { makeStyles } from "tss-react/mui";
import { alpha } from "@mui/material/styles";

export const useStyles = makeStyles()((theme) => ({
  headerRoot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1.5, 3),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.appBar,
    width: "100%",
    boxSizing: "border-box",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    cursor: "pointer",
    gap: theme.spacing(1.5),
  },
  logoIcon: {
    width: "30px",
    height: "30px",
  },
  logoText: {
    fontWeight: 700,
    fontSize: "1.6rem",
    color: theme.palette.primary.main,
    "&:hover": {
      color: theme.palette.primary.light,
    },
  },
  navContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  navButton: {
    padding: theme.spacing(0.75, 1.5),
    minWidth: "auto",
    color: theme.palette.text.secondary,
    textDecoration: "none",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.light,
    },
    "&.active": {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
  },
  navButtonOutlined: {
    "&.active": {
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  authActionsContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  userInfo: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1.5),
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
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.light,
    },
  },
  logoutButton: {
    color: theme.palette.secondary.light,
    "&:hover": {
      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
      color: theme.palette.secondary.main,
    },
  },
}));
