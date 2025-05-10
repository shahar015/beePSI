// src/pages/PagerShop/PagerShop.tsx
import React, { useState, useMemo } from "react";
import {
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { BeeperModel, SnackbarSeverity } from "../../types";
import { BeeperCard } from "../../components/BeeperCard/BeeperCard";
import { useStyles } from "./PagerShopStyles";

interface PagerShopProps {
  beeperModels: BeeperModel[];
  loading: boolean; // Loading state for fetching beeper models
  onAddToCart: (beeperModel: BeeperModel, quantity: number) => void;
  openSnackbar: (message: string, severity?: SnackbarSeverity) => void; // For potential errors specific to this page
}

export const PagerShop: React.FC<PagerShopProps> = ({
  beeperModels,
  loading,
  onAddToCart,
}) => {
  const { classes } = useStyles();
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Memoize filtered beepers to avoid re-calculating on every render
  // unless beeperModels or searchTerm changes.
  const filteredBeepers = useMemo(() => {
    if (!searchTerm.trim()) {
      return beeperModels;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return beeperModels.filter(
      (beeper) =>
        beeper.name.toLowerCase().includes(lowerSearchTerm) ||
        (beeper.description &&
          beeper.description.toLowerCase().includes(lowerSearchTerm))
    );
  }, [beeperModels, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Content to display based on loading state and filtered results
  let content;
  if (loading) {
    content = (
      <div className={classes.loadingOrErrorContainer}>
        <CircularProgress size={60} />
        <Typography variant="h6">טוען ביפרים...</Typography>
      </div>
    );
  } else if (beeperModels.length === 0 && !loading) {
    // Check beeperModels from props
    content = (
      <div className={classes.loadingOrErrorContainer}>
        <Typography variant="h6" color="textSecondary">
          אין ביפרים זמינים כרגע. אנא בדוק מאוחר יותר.
        </Typography>
      </div>
    );
  } else if (filteredBeepers.length === 0 && searchTerm) {
    content = (
      <div className={classes.loadingOrErrorContainer}>
        <Typography variant="h6" className={classes.noResultsText}>
          אין ביפרים התואמים לחיפוש "{searchTerm}". נסה חיפוש אחר.
        </Typography>
      </div>
    );
  } else {
    content = (
      <div className={classes.cardListOuterContainer}>
        <div className={classes.cardListContainer}>
          {filteredBeepers.map((beeper) => (
            <BeeperCard
              key={beeper.id}
              beeper={beeper}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={classes.shopRoot}>
      <Typography variant="h3" component="h1" className={classes.pageTitle}>
        קטלוג ביפרים למכירה
      </Typography>
      <div className={classes.searchAndFilterContainer}>
        <TextField
          className={classes.searchField}
          variant="outlined"
          placeholder="חפש לפי שם דגם או תיאור..."
          value={searchTerm}
          onChange={handleSearchChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>
      {content}
    </div>
  );
};
