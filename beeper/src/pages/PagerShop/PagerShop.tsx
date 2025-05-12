import React, { useState, useMemo } from "react";
import {
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { BeeperCard } from "../../components/BeeperCard/BeeperCard";
import { useStyles } from "./PagerShopStyles";
import { useBeeperShop } from "../../hooks/useBeeperShop";

export const PagerShop: React.FC = () => {
  const { classes } = useStyles();
  const {
    beeperModels,
    isLoading: isShopLoading,
    error: shopError,
  } = useBeeperShop();
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  let content;
  if (isShopLoading) {
    content = (
      <div className={classes.loadingOrErrorContainer}>
        <CircularProgress size={60} />
        <Typography variant="h6">טוען ביפרים...</Typography>
      </div>
    );
  } else if (shopError) {
    content = (
      <div className={classes.loadingOrErrorContainer}>
        <Typography variant="h6" color="error">
          שגיאה בטעינת המוצרים: {shopError}
        </Typography>
      </div>
    );
  } else if (beeperModels.length === 0) {
    content = (
      <div className={classes.loadingOrErrorContainer}>
        <Typography variant="h6" color="textSecondary">
          לא נמצאו דגמי ביפרים זמינים כרגע.
        </Typography>
      </div>
    );
  } else if (filteredBeepers.length === 0 && searchTerm) {
    content = (
      <div className={classes.loadingOrErrorContainer}>
        <Typography variant="h6" className={classes.noResultsText}>
          לא נמצאו ביפרים התואמים לחיפוש "{searchTerm}".
        </Typography>
      </div>
    );
  } else {
    content = (
      <div className={classes.cardListOuterContainer}>
        <div className={classes.cardListContainer}>
          {filteredBeepers.map((beeper) => (
            <BeeperCard key={beeper.id} beeper={beeper} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={classes.shopRoot}>
      <Typography variant="h3" component="h1" className={classes.pageTitle}>
        קטלוג הארסנל האסטרטגי
      </Typography>
      <div className={classes.searchAndFilterContainer}>
        <TextField
          className={classes.searchField}
          variant="outlined"
          placeholder="חפש לפי שם או תיאור..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </div>
      {content}
    </div>
  );
};
