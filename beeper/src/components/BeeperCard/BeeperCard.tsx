// src/components/BeeperCard/BeeperCard.tsx
import React from "react";
import { Typography, Button } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { BeeperModel } from "../../types"; // Assuming BeeperModel is defined in types.ts
import { useStyles } from "./BeeperCardStyles";

interface BeeperCardProps {
  beeper: BeeperModel;
  onAddToCart: (beeperModel: BeeperModel, quantity: number) => void; // Pass the whole model for context
}

export const BeeperCard: React.FC<BeeperCardProps> = ({
  beeper,
  onAddToCart,
}) => {
  const { classes } = useStyles();

  const handleAddToCartClick = () => {
    onAddToCart(beeper, 1); // Add one unit of this beeper
  };

  return (
    <div className={classes.cardRoot}>
      <div className={classes.imageContainer}>
        <img
          src={
            beeper.image_url ||
            "https://placehold.co/280x180/333333/555555?text=No+Image"
          } // Fallback image
          alt={beeper.name}
          className={classes.image}
          loading="lazy" // Lazy load images
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop if fallback also fails
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
          {beeper.description || "No description available."}
        </Typography>
        <div className={classes.priceAndActionContainer}>
          <Typography variant="h6" className={classes.price}>
            ${beeper.price.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small" // Keep button relatively small within the card
            startIcon={<AddShoppingCartIcon />}
            onClick={handleAddToCartClick}
            className={classes.addToCartButton}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};
