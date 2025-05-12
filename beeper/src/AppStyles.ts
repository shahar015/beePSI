import { makeStyles } from "tss-react/mui";
import { Theme } from "@mui/material/styles";

export const useStyles = makeStyles()((theme: Theme) => ({
  appRoot: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default,
  },
  mainContent: {
    flexGrow: 1,
    padding: 0,
    display: "flex",
    flexDirection: "column",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    gap: theme.spacing(2),
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.default,
  },
}));
