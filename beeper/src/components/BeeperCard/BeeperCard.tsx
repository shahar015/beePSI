import React from "react";
import { Typography, Button, CircularProgress } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { BeeperModel } from "../../types";
import { useStyles } from "./BeeperCardStyles";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface BeeperCardProps {
  beeper: BeeperModel;
}

export const BeeperCard: React.FC<BeeperCardProps> = ({ beeper }) => {
  const { classes } = useStyles();
  const { addItemToCart, isLoading: isCartUpdating } = useCart();
  const { authState } = useAuth();
  const navigate = useNavigate();

  const handleAddToCartClick = async () => {
    if (!authState.isAuthenticated || authState.role !== "user") {
      navigate("/login");
      return;
    }
    await addItemToCart(beeper, 1);
  };

  return (
    <div className={classes.cardRoot}>
      <div className={classes.imageContainer}>
        <img
          src={
            beeper.image_url ||
            "https://placehold.co/280x180/333333/555555?text=No+Image"
          }
          alt={beeper.name}
          className={classes.image}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src =
              "https://placehold.co/280x180/333333/555555?text=Image+Error";
          }}
        />
      </div>
      <div className={classes.contentArea}>
        <Typography
          variant="h6"
          component="h3"
          className={classes.name}
          title={beeper.name}
        >
          {beeper.name}
        </Typography>
        <Typography
          variant="body2"
          className={classes.description}
          title={beeper.description || ""}
        >
          {beeper.description || "אין תיאור זמין."}
        </Typography>
        <div className={classes.priceAndActionContainer}>
          <Typography variant="h6" className={classes.price}>
            ${beeper.price.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={
              isCartUpdating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AddShoppingCartIcon />
              )
            }
            onClick={handleAddToCartClick}
            className={classes.addToCartButton}
            disabled={isCartUpdating}
          >
            {isCartUpdating ? "מעדכן..." : "הוסף לעגלה"}
          </Button>
        </div>
      </div>
    </div>
  );
};
