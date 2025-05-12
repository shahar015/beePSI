import { makeStyles } from "tss-react/mui";
import { alpha } from "@mui/material/styles";

export const useStyles = makeStyles()((theme) => ({
  opsCenterRoot: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: theme.spacing(3),
    gap: theme.spacing(2.5),
    backgroundColor: theme.palette.background.default,
  },
  title: {
    textAlign: "center",
    color: theme.palette.primary.light,
    marginBottom: theme.spacing(1),
    fontWeight: 700,
  },
  controlBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.paper, 0.5),
    borderRadius: theme.shape.borderRadius,
    flexWrap: "wrap",
  },
  searchFieldOps: {
    flexGrow: 1,
    minWidth: "250px",
    maxWidth: "450px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "20px",
      backgroundColor: theme.palette.background.paper,
    },
  },
  activateButton: {
    backgroundColor: theme.palette.accentOps.main,
    color: theme.palette.accentOps.contrastText,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    "&:hover": {
      backgroundColor: alpha(theme.palette.accentOps.main, 0.8),
    },
    "&.Mui-disabled": {
      backgroundColor: alpha(theme.palette.accentOps.main, 0.3),
      color: alpha(theme.palette.accentOps.contrastText, 0.5),
    },
  },
  tableContainer: {
    flexGrow: 1,
    width: "100%",
    overflow: "auto",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
  table: {
    minWidth: 700,
  },
  tableHead: {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    "& .MuiTableCell-head": {
      fontWeight: "bold",
      color: theme.palette.text.primary,
    },
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: alpha(theme.palette.action.hover, 0.02),
    },
    "&:hover": {
      backgroundColor: alpha(theme.palette.action.hover, 0.06),
    },
  },
  tableCell: {
    padding: theme.spacing(1.5, 2),
    color: theme.palette.text.secondary,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  checkboxCell: {
    width: "60px",
    padding: theme.spacing(0, 1, 0, 2),
  },
  statusCell: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  statusActive: {
    color: theme.palette.success.light,
  },
  statusActivated: {
    color: theme.palette.error.light,
  },
  activatedRow: {
    backgroundColor: `${alpha(theme.palette.error.dark, 0.2)} !important`,
    fontStyle: "italic",
    "& .MuiTableCell-root": {
      color: `${alpha(theme.palette.text.primary, 0.7)} !important`,
    },
    "&:hover": {
      backgroundColor: `${alpha(theme.palette.error.dark, 0.3)} !important`,
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
  alertMessage: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  },
}));
