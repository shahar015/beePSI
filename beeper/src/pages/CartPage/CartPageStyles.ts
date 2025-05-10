// src/pages/CartPage/CartPageStyles.ts
import { makeStyles } from "tss-react/mui";
import { alpha } from "@mui/material/styles";

export const useStyles = makeStyles()((theme) => ({
  cartRoot: {
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
  emptyCartContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    gap: theme.spacing(2),
    color: theme.palette.text.secondary,
    padding: theme.spacing(4),
  },
  cartItemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
  itemImageContainer: {
    width: "80px",
    height: "80px",
    flexShrink: 0,
    backgroundColor: alpha(theme.palette.text.disabled, 0.1),
    borderRadius: theme.shape.borderRadius,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  itemDetails: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: theme.spacing(0.5),
  },
  itemName: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  itemPrice: {
    color: theme.palette.text.secondary,
  },
  itemQuantityContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  quantityField: {
    width: "60px", // Small width for quantity input
    "& .MuiInputBase-input": {
      textAlign: "center",
      padding: theme.spacing(1),
    },
  },
  removeItemButton: {
    // marginLeft: 'auto', // Pushes it to the end in LTR, might need adjustment for RTL
    // For RTL, flex parent should handle alignment or use marginStart
    color: theme.palette.error.light,
    "&:hover": {
      backgroundColor: alpha(theme.palette.error.main, 0.1),
    },
  },
  summaryContainer: {
    marginTop: "auto", // Pushes summary to the bottom if content is short
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalPrice: {
    fontWeight: 700,
    fontSize: "1.25rem",
    color: theme.palette.primary.light,
  },
  checkoutButton: {
    padding: theme.spacing(1.5, 0),
    fontSize: "1.1rem",
    fontWeight: 600,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
    flexGrow: 1,
  },
}));
