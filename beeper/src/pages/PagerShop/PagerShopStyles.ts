import { alpha } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((theme) => ({
  shopRoot: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: theme.spacing(3),
    gap: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
  },
  pageTitle: {
    textAlign: "center",
    color: theme.palette.primary.light,
    marginBottom: theme.spacing(1),
  },
  searchAndFilterContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(1, 0),
    gap: theme.spacing(2),
  },
  searchField: {
    width: "100%",
    maxWidth: "600px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "25px",
      backgroundColor: alpha(theme.palette.background.paper, 0.7),
      "& fieldset": {
        borderColor: theme.palette.divider,
      },
      "&:hover fieldset": {
        borderColor: theme.palette.primary.light,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
    "& .MuiInputBase-input": {
      padding: theme.spacing(1.5, 2),
    },
  },
  cardListOuterContainer: {
    width: "100%",
    overflow: "hidden",
  },
  cardListContainer: {
    display: "flex",
    overflowX: "auto",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(3),
    gap: theme.spacing(2.5),
    justifyContent: "flex-start",
    "&::-webkit-scrollbar": {
      height: "8px",
    },
  },
  loadingOrErrorContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    minHeight: "300px",
    color: theme.palette.text.secondary,
    gap: theme.spacing(2),
  },
  noResultsText: {
    padding: theme.spacing(5, 0),
    textAlign: "center",
  },
}));
