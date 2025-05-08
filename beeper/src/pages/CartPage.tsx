import React from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Delete, Add, Remove } from "@mui/icons-material";
import { CartItem } from "../types";

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (modelId: number, quantity: number) => void;
  onRemoveItem: (modelId: number) => void;
  onCheckout: () => Promise<void>; // הפך לאסינכרוני
  checkoutLoading: boolean;
  checkoutError: string | null;
  checkoutSuccess: boolean;
}

const CartPage: React.FC<CartPageProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  checkoutLoading,
  checkoutError,
  checkoutSuccess,
}) => {
  const calculateTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleQuantityChange = (modelId: number, change: number) => {
    const item = cartItems.find((i) => i.id === modelId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity >= 1) {
        onUpdateQuantity(modelId, newQuantity);
      } else if (newQuantity === 0) {
        onRemoveItem(modelId); // הסר אם הכמות היא 0
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ mt: 2, mb: 4, fontWeight: "bold" }}
      >
        עגלת הקניות
      </Typography>

      {checkoutSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          הרכישה בוצעה בהצלחה!
        </Alert>
      )}
      {checkoutError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          שגיאה בביצוע הרכישה: {checkoutError}
        </Alert>
      )}

      {cartItems.length === 0 && !checkoutSuccess ? (
        <Typography align="center">עגלת הקניות שלך ריקה.</Typography>
      ) : (
        <List>
          {cartItems.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={
                      item.image_url || "https://placehold.co/60x60?text=Beeper"
                    }
                    alt={item.name}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={item.name}
                  secondary={`מחיר: ₪${item.price.toFixed(2)}`}
                />
                <Box display="flex" alignItems="center" mx={2}>
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item.id, -1)}
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography
                    sx={{ mx: 1, minWidth: "20px", textAlign: "center" }}
                  >
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item.id, 1)}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ minWidth: "80px", textAlign: "right" }}
                >
                  סה"כ: ₪{(item.price * item.quantity).toFixed(2)}
                </Typography>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      {cartItems.length > 0 && (
        <Box mt={4} display="flex" flexDirection="column" alignItems="flex-end">
          <Typography variant="h6">סה"כ לתשלום: ₪{calculateTotal()}</Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={onCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? <CircularProgress size={24} /> : "בצע רכישה"}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CartPage;
