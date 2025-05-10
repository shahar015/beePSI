// src/pages/OpsCenter/OpsCenterStyles.ts
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
    backgroundColor: (theme.palette.accentOps as unknown as { main: string })
      .main,
    color: (theme.palette.accentOps as unknown as { contrastText: string })
      .contrastText,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    "&:hover": {
      backgroundColor: alpha(
        (theme.palette.accentOps as unknown as { main: string }).main,
        0.8
      ),
    },
    "&.Mui-disabled": {
      backgroundColor: alpha(
        (theme.palette.accentOps as unknown as { main: string }).main,
        0.3
      ),
      color: alpha(
        (theme.palette.accentOps as unknown as { contrastText: string })
          .contrastText,
        0.5
      ),
    },
  },
  tableContainer: {
    flexGrow: 1, // Table container takes remaining vertical space
    width: "100%",
    overflow: "auto", // Add scrollbars if content overflows
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
  table: {
    minWidth: 700, // Ensure table has a minimum width, helps with responsiveness
  },
  tableHead: {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    "& .MuiTableCell-head": {
      // Target header cells
      fontWeight: "bold",
      color: theme.palette.text.primary,
    },
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: alpha(theme.palette.action.hover, 0.02), // Subtle striping for odd rows
    },
    "&:hover": {
      backgroundColor: alpha(theme.palette.action.hover, 0.06),
    },
  },
  tableCell: {
    padding: theme.spacing(1.5, 2), // Adjust cell padding
    color: theme.palette.text.secondary,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  checkboxCell: {
    width: "60px", // Fixed width for checkbox column
    padding: theme.spacing(0, 1, 0, 2), // Adjust padding for checkbox
  },
  statusCell: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1), // Increased gap for better visual separation
  },
  statusActive: {
    color: theme.palette.success.light,
  },
  statusActivated: {
    color: theme.palette.error.light,
  },
  // Class for rows with status 'activated'
  activatedRow: {
    backgroundColor: `${alpha(theme.palette.error.dark, 0.2)} !important`, // Ensure override
    fontStyle: "italic",
    "& .MuiTableCell-root": {
      // Style cells within activated row
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
