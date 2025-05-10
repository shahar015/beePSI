// src/pages/PagerShop/PagerShopStyles.ts
import { makeStyles } from "tss-react/mui";
import { alpha } from "@mui/material/styles";

export const useStyles = makeStyles()((theme) => ({
  shopRoot: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1, // Allow this page to take available vertical space
    padding: theme.spacing(3),
    gap: theme.spacing(3),
    backgroundColor: theme.palette.background.default, // Ensure page bg matches theme
  },
  pageTitle: {
    textAlign: "center",
    color: theme.palette.primary.light,
    marginBottom: theme.spacing(1),
  },
  searchAndFilterContainer: {
    // Container for search and any future filters
    display: "flex",
    justifyContent: "center", // Center search bar if it's the only item
    alignItems: "center",
    padding: theme.spacing(1, 0), // Padding top/bottom
    gap: theme.spacing(2),
    // marginBottom: theme.spacing(2), // Space below search/filter area
  },
  searchField: {
    width: "100%",
    maxWidth: "600px", // Max width for the search bar
    "& .MuiOutlinedInput-root": {
      borderRadius: "25px", // More rounded search bar
      backgroundColor: alpha(theme.palette.background.paper, 0.7), // Slightly transparent paper bg
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
      padding: theme.spacing(1.5, 2), // Adjust input padding
    },
  },
  cardListOuterContainer: {
    // This container is to manage the horizontal scroll bar appearance if needed
    // and to provide padding around the scrolling area.
    width: "100%",
    overflow: "hidden", // Hides the main scrollbar if cardListContainer handles its own
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
    flexGrow: 1, // Take remaining space if no cards
    minHeight: "300px", // Ensure it's visible
    color: theme.palette.text.secondary,
    gap: theme.spacing(2),
  },
  noResultsText: {
    padding: theme.spacing(5, 0), // Give some space if no results
    textAlign: "center",
  },
}));
