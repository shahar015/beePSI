import React, { useState, useEffect } from "react";
import {
  Grid,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { BeeperModel } from "../types";
import { getBeeperModels, removeFavorite, getFavorites } from "../services/api";
import BeeperModelCard from "../components/BeeperModelCard";

interface FavoritesPageProps {
  onAddToCart: (model: BeeperModel) => void;
  credentials: { user: string; pass: string } | null;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({
  onAddToCart,
  credentials,
}) => {
  const [favoriteModels, setFavoriteModels] = useState<BeeperModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set()); // סט המזהים

  useEffect(() => {
    const loadFavorites = async () => {
      if (!credentials) {
        setError("Please log in to view favorites.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // 1. קבלת מזהי המועדפים
        const favIds = await getFavorites(credentials);
        const favIdSet = new Set(favIds);
        setFavoriteIds(favIdSet);

        // 2. קבלת כל הדגמים
        const allModels = await getBeeperModels();

        // 3. סינון הדגמים לפי המזהים המועדפים
        const favModels = allModels.filter((model) => favIdSet.has(model.id));
        setFavoriteModels(favModels);
      } catch (err: any) {
        setError(err.message || "Failed to load favorites.");
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [credentials]);

  const handleRemoveFavorite = async (modelId: number) => {
    if (!credentials) return;

    const originalFavIds = new Set(favoriteIds);
    const originalFavModels = [...favoriteModels];

    // עדכון אופטימי
    const newFavIdSet = new Set(favoriteIds);
    newFavIdSet.delete(modelId);
    setFavoriteIds(newFavIdSet);
    setFavoriteModels(favoriteModels.filter((model) => model.id !== modelId));

    try {
      await removeFavorite(modelId, credentials);
    } catch (err: any) {
      setError(`Failed to remove favorite: ${err.message}`);
      // החזר למצב הקודם
      setFavoriteIds(originalFavIds);
      setFavoriteModels(originalFavModels);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  if (!credentials)
    return (
      <Container>
        <Alert severity="warning">
          יש להתחבר למרכז הבקרה כדי לראות ולנהל מועדפים.
        </Alert>
      </Container>
    );

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ mt: 2, mb: 4, fontWeight: "bold" }}
      >
        המועדפים שלי
      </Typography>
      <Grid container spacing={4}>
        {favoriteModels.length > 0 ? (
          favoriteModels.map((model) => (
            <Grid item key={model.id} xs={12} sm={6} md={4} lg={3}>
              <BeeperModelCard
                model={model}
                isFavorite={true} // תמיד מועדף בדף זה
                onToggleFavorite={handleRemoveFavorite} // לחיצה כאן תסיר
                onAddToCart={onAddToCart}
              />
            </Grid>
          ))
        ) : (
          <Typography sx={{ m: 5, width: "100%" }} align="center">
            אין לך עדיין דגמים מועדפים.
          </Typography>
        )}
      </Grid>
    </Container>
  );
};

export default FavoritesPage;
