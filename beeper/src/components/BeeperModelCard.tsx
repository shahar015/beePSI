import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  useTheme,
  Fab,
} from "@mui/material";
import { Favorite, FavoriteBorder, AddShoppingCart } from "@mui/icons-material";
import { BeeperModel } from "../types"; // ודא שהנתיב נכון

interface BeeperModelCardProps {
  model: BeeperModel;
  isFavorite: boolean;
  onToggleFavorite: (modelId: number) => void;
  onAddToCart: (model: BeeperModel) => void;
}

const BeeperModelCard: React.FC<BeeperModelCardProps> = ({
  model,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}) => {
  const theme = useTheme();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: "20px",
        padding: "10px",
        backgroundColor: theme.palette.background.paper,
        gap: "20px",
        height: 220,
      }}
    >
      <img
        src={model.image_url || "https://placehold.co/300x140?text=Beeper"} // תמונה חלופית
        alt={model.name}
        style={{ height: "75%", borderRadius: "20px" }} // התאמת תמונה
        loading="lazy"
      />
      <div
        style={{
          width: "100px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Typography gutterBottom variant="h6" component="div">
          {model.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {model.description}
        </Typography>
        <Typography variant="h6" color="secondary" sx={{ mt: 1 }}>
          ₪{model.price.toFixed(2)}
        </Typography>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: "100%",
        }}
      >
        <IconButton
          aria-label="add to favorites"
          onClick={() => onToggleFavorite(model.id)}
        >
          {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
        <Fab size="small" color="primary" onClick={() => onAddToCart(model)}>
          <AddShoppingCart />
        </Fab>
      </div>
    </div>
  );
};

export default BeeperModelCard;
