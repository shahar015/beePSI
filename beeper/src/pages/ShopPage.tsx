import React, { useState, useEffect } from "react";
import {
  Grid,
  Container,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Box,
  IconButton,
  Button,
  Fab,
} from "@mui/material";
import { BeeperModel } from "../types";
import {
  getBeeperModels,
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../services/api"; // ודא שהנתיב נכון
import BeeperModelCard from "../components/BeeperModelCard"; // ודא שהנתיב נכון
import { Search } from "@mui/icons-material";

interface ShopPageProps {
  onAddToCart: (model: BeeperModel) => void;
  credentials: { user: string; pass: string } | null; // נדרש עבור מועדפים
}

const ShopPage: React.FC<ShopPageProps> = ({ onAddToCart, credentials }) => {
  const [models, setModels] = useState<BeeperModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<BeeperModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // טעינת דגמים ומועדפים
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const modelsData = await getBeeperModels();
        setModels(modelsData);
        setFilteredModels(modelsData); // הצג הכל בהתחלה

        // טען מועדפים רק אם המשתמש מחובר (לצורך העניין, נניח שמרכז הבקרה הוא המשתמש)
        if (credentials) {
          const favIds = await getFavorites(credentials);
          setFavoriteIds(new Set(favIds));
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [credentials]); // טען מחדש אם פרטי ההזדהות משתנים

  // סינון לפי חיפוש
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = models.filter(
      (model) =>
        model.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        model.description.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredModels(filtered);
  }, [searchTerm, models]);

  // טיפול במועדפים
  const handleToggleFavorite = async (modelId: number) => {
    if (!credentials) {
      setError("Please log in to manage favorites."); // או הפניה לכניסה
      return;
    }
    const isCurrentlyFavorite = favoriteIds.has(modelId);
    const optimisticNewSet = new Set(favoriteIds);
    if (isCurrentlyFavorite) {
      optimisticNewSet.delete(modelId);
    } else {
      optimisticNewSet.add(modelId);
    }
    setFavoriteIds(optimisticNewSet); // עדכון אופטימי

    try {
      if (isCurrentlyFavorite) {
        await removeFavorite(modelId, credentials);
      } else {
        await addFavorite(modelId, credentials);
      }
      // אין צורך לעדכן שוב, כבר עדכנו אופטימית
    } catch (err: any) {
      setError(`Failed to update favorites: ${err.message}`);
      // החזר למצב הקודם במקרה של שגיאה
      setFavoriteIds(favoriteIds);
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

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        margin: "0",
        padding: "0",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{
          mt: 2,
          mb: 4,
          fontWeight: "bold",
          maxHeight: "100%",
          minHeight: "0",
        }}
      >
        קטלוג הביפרים
      </Typography>
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems={"center"}
        gap={"20px"}
        width={"50%"}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          padding: "10px 20px",
          borderRadius: "60px",
        }}
      >
        <TextField
          placeholder="חיפוש דגם..."
          value={searchTerm}
          variant="standard"
          slotProps={{
            input: {
              disableUnderline: true,
              style: {
                fontSize: "16px",
              },
            },
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ borderWidth: 0, fontSize: "22px" }}
          fullWidth
        />
        <Fab color="primary" size="small" sx={{ padding: "0px 20px" }}>
          <Search />
        </Fab>
      </Box>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "20px",
          width: "120%",
          padding: "20px",
          flex: 1,
          alignItems: "center",
          borderRadius: "20px",
        }}
      >
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <BeeperModelCard
              model={model}
              isFavorite={favoriteIds.has(model.id)}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={onAddToCart}
            />
          ))
        ) : (
          <Typography sx={{ m: 5, width: "100%" }} align="center">
            לא נמצאו דגמים התואמים את החיפוש.
          </Typography>
        )}
      </div>
    </Container>
  );
};

export default ShopPage;
