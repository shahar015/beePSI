import { makeStyles } from "tss-react/mui";
import { Theme } from "@mui/material/styles";

export const useStyles = makeStyles()((theme: Theme) => ({
  loginRoot: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 64px - 32px)",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
    boxSizing: "border-box",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(3, 4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    width: "100%",
    maxWidth: "420px",
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
  textField: {},
  submitButton: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.25, 0),
    fontSize: "1rem",
    fontWeight: 600,
  },
  linksContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
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
