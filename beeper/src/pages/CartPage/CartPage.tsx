// src/pages/CartPage/CartPage.tsx
import React, { useState, useEffect } from "react"; // Added useEffect for local quantity sync
import {
  Typography,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Divider,
  Paper,
  // Box, // Not strictly needed if TextField handles its own layout well
} from "@mui/material";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { CartItem } from "../../types";
import { useStyles } from "./CartPageStyles";
import { Link as RouterLink } from "react-router-dom";

interface CartPageProps {
  cartItems: CartItem[];
  cartLoading: boolean; // General loading for cart (e.g. purchase or any update)
  // itemUpdatingId prop removed
  onRemoveItem: (modelId: number) => void;
  onUpdateQuantity: (modelId: number, newQuantity: number) => void;
  onPurchase: () => void;
}

// Simplified Quantity Input - local state for typing, commit on blur/enter
interface QuantityInputProps {
  itemQuantity: number; // Current quantity from App's state
  modelId: number;
  onQuantityCommit: (modelId: number, newQuantity: number) => void;
  disabled?: boolean; // Disabled during general cart loading
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  itemQuantity,
  modelId,
  onQuantityCommit,
  disabled,
}) => {
  const [localQuantity, setLocalQuantity] = useState<string>(
    itemQuantity.toString()
  );
  const { classes } = useStyles(); // For quantityField style

  // Sync local state if the prop changes from App.tsx (e.g., after API update)
  useEffect(() => {
    setLocalQuantity(itemQuantity.toString());
  }, [itemQuantity]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuantity(event.target.value); // Allow user to type freely
  };

  const handleCommit = () => {
    const newQuantityNum = parseInt(localQuantity, 10);
    if (!isNaN(newQuantityNum) && newQuantityNum >= 0) {
      if (newQuantityNum !== itemQuantity) {
        // Only commit if value actually changed
        onQuantityCommit(modelId, newQuantityNum);
      } else {
        // If value is same as original but was typed differently (e.g. "01" vs "1"), reset display
        setLocalQuantity(itemQuantity.toString());
      }
    } else {
      // Revert to original quantity if input is invalid on blur
      setLocalQuantity(itemQuantity.toString());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleCommit();
      (event.target as HTMLInputElement).blur(); // Optional: blur input on enter
    }
  };

  return (
    <TextField
      type="number"
      value={localQuantity}
      onChange={handleChange}
      onBlur={handleCommit} // Commit changes when field loses focus
      onKeyDown={handleKeyDown} // Commit changes on Enter key
      InputProps={{ inputProps: { min: 0, style: { textAlign: "center" } } }}
      variant="outlined"
      size="small"
      className={classes.quantityField}
      disabled={disabled} // Disable if general cart operation is in progress
    />
  );
};

export const CartPage: React.FC<CartPageProps> = ({
  cartItems,
  cartLoading, // General loading state
  onRemoveItem,
  onUpdateQuantity,
  onPurchase,
}) => {
  const { classes } = useStyles();

  const calculateSubtotal = (): number => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const total = subtotal;

  if (cartLoading && cartItems.length === 0) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוענים את העגלה שלך...
        </Typography>
      </div>
    );
  }

  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className={classes.cartRoot}>
        <div className={classes.emptyCartContainer}>
          <RemoveShoppingCartIcon
            sx={{ fontSize: 80, color: "text.disabled" }}
          />
          <Typography variant="h5" component="h1" gutterBottom>
            העגלה שלך ריקה
          </Typography>
          <Typography color="textSecondary">
            זמן לבקר בחנות הביפרים שלנו!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
          >
            לחנות הביפרים
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.cartRoot}>
      <Typography variant="h3" component="h1" className={classes.pageTitle}>
        עגלת הקניות שלך
      </Typography>

      <div className={classes.cartItemsContainer}>
        {cartItems.map((item) => (
          <Paper
            key={item.id}
            className={classes.cartItem}
            elevation={2}
            sx={{ opacity: cartLoading ? 0.7 : 1 }}
          >
            <div className={classes.itemImageContainer}>
              <img
                src={
                  item.image_url ||
                  `https://placehold.co/80x80/333333/555555?text=No+Img`
                }
                alt={item.name}
                className={classes.itemImage}
                loading="lazy"
              />
            </div>
            <div className={classes.itemDetails}>
              <Typography variant="h6" className={classes.itemName}>
                {item.name}
              </Typography>
              <Typography variant="body2" className={classes.itemPrice}>
                מחיר לפריט: {item.price.toFixed(2)} ש"ח
              </Typography>
            </div>
            <div className={classes.itemQuantityContainer}>
              <QuantityInput
                itemQuantity={item.quantity} // Pass current quantity from App's state
                modelId={item.id}
                onQuantityCommit={onUpdateQuantity} // This calls App.tsx's handler
                disabled={cartLoading} // Disable input during any cart operation
              />
              <Typography
                sx={{
                  mx: 1,
                  color: "text.secondary",
                  minWidth: "80px",
                  textAlign: "right",
                }}
              >
                סה"כ: {(item.price * item.quantity).toFixed(2)} ש"ח
              </Typography>
            </div>
            <IconButton
              aria-label={`remove ${item.name} from cart`}
              onClick={() => onRemoveItem(item.id)}
              className={classes.removeItemButton}
              size="medium"
              disabled={cartLoading}
            >
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
      </div>

      <Paper className={classes.summaryContainer} elevation={4}>
        <Typography variant="h5" gutterBottom>
          סיכום הזמנה
        </Typography>
        <div className={classes.summaryRow}>
          <Typography variant="body1">כמות פריטים:</Typography>
          <Typography variant="body1">{totalItems}</Typography>
        </div>
        <div className={classes.summaryRow}>
          <Typography variant="body1">סיכום ביניים: </Typography>
          <Typography variant="body1">{subtotal.toFixed(2)} ש"ח</Typography>
        </div>
        <Divider sx={{ my: 1 }} />
        <div className={classes.summaryRow}>
          <Typography variant="h6" className={classes.totalPrice}>
            מחיר סופי:
          </Typography>
          <Typography variant="h6" className={classes.totalPrice}>
            {total.toFixed(2)} ש"ח
          </Typography>
        </div>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onPurchase}
          disabled={cartLoading || cartItems.length === 0}
          className={classes.checkoutButton}
          startIcon={
            cartLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <ShoppingBagIcon />
            )
          }
        >
          {cartLoading ? "רכישה מתבצעת..." : "ביצוע רכישה"}
        </Button>
      </Paper>
    </div>
  );
};
