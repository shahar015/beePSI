import DeleteIcon from "@mui/icons-material/Delete";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useStyles } from "./CartPageStyles";

interface QuantityInputProps {
  itemQuantity: number;
  modelId: number;
  onQuantityCommit: (modelId: number, newQuantity: number) => void;
  disabled?: boolean;
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
  const { classes } = useStyles();

  useEffect(() => {
    setLocalQuantity(itemQuantity.toString());
  }, [itemQuantity]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuantity(event.target.value);
  };

  const handleCommit = () => {
    const newQuantityNum = parseInt(localQuantity, 10);
    if (!isNaN(newQuantityNum) && newQuantityNum >= 0) {
      if (newQuantityNum !== itemQuantity) {
        onQuantityCommit(modelId, newQuantityNum);
      } else {
        setLocalQuantity(itemQuantity.toString());
      }
    } else {
      setLocalQuantity(itemQuantity.toString());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleCommit();
      (event.target as HTMLInputElement).blur();
    }
  };

  return (
    <TextField
      type="number"
      value={localQuantity}
      onChange={handleChange}
      onBlur={handleCommit}
      onKeyDown={handleKeyDown}
      InputProps={{ inputProps: { min: 0, style: { textAlign: "center" } } }}
      variant="outlined"
      size="small"
      className={classes.quantityField}
      disabled={disabled}
    />
  );
};

export const CartPage: React.FC = () => {
  const { classes } = useStyles();
  const {
    cartItems,
    isLoading: isCartLoading,
    removeItemFromCart,
    updateItemQuantity,
    purchaseCart,
    fetchCart,
  } = useCart();
  const { authState } = useAuth();

  useEffect(() => {
    if (authState.isAuthenticated && authState.role === "user") {
      fetchCart();
    }
  }, [authState.isAuthenticated, authState.role, fetchCart]);

  const calculateSubtotal = (): number => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const total = subtotal;

  if (isCartLoading && cartItems.length === 0) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען את העגלה שלך...
        </Typography>
      </div>
    );
  }

  if (!isCartLoading && cartItems.length === 0) {
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
            נראה שעדיין לא הוספת ביפרים אסטרטגיים לעגלה.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
            sx={{ mt: 3, px: 4, py: 1.5 }}
          >
            חזרה לחנות
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.cartRoot}>
      <Typography variant="h3" component="h1" className={classes.pageTitle}>
        הארסנל האסטרטגי שלך
      </Typography>

      <div className={classes.cartItemsContainer}>
        {cartItems.map((item) => (
          <Paper
            key={item.id}
            className={classes.cartItem}
            elevation={2}
            sx={{ opacity: isCartLoading ? 0.7 : 1 }}
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
                ${item.price.toFixed(2)} ליחידה
              </Typography>
            </div>
            <div className={classes.itemQuantityContainer}>
              <QuantityInput
                itemQuantity={item.quantity}
                modelId={item.id}
                onQuantityCommit={updateItemQuantity}
                disabled={isCartLoading}
              />
              <Typography className={classes.itemSubtotal}>
                סה"כ: ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </div>
            <IconButton
              aria-label={`הסר ${item.name} מהעגלה`}
              onClick={() => removeItemFromCart(item.id)}
              className={classes.removeItemButton}
              size="medium"
              disabled={isCartLoading}
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
          <Typography variant="body1">סה"כ פריטים:</Typography>
          <Typography variant="body1">{totalItems}</Typography>
        </div>
        <div className={classes.summaryRow}>
          <Typography variant="body1">סכום ביניים:</Typography>
          <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
        </div>
        <Divider sx={{ my: 1 }} />
        <div className={classes.summaryRow}>
          <Typography variant="h6" className={classes.totalPrice}>
            סה"כ לתשלום:
          </Typography>
          <Typography variant="h6" className={classes.totalPrice}>
            ${total.toFixed(2)}
          </Typography>
        </div>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={purchaseCart}
          disabled={isCartLoading || cartItems.length === 0}
          className={classes.checkoutButton}
          startIcon={
            isCartLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <ShoppingBagIcon />
            )
          }
        >
          {isCartLoading ? "מעבד רכישה..." : "לתשלום מאובטח"}
        </Button>
      </Paper>
    </div>
  );
};
