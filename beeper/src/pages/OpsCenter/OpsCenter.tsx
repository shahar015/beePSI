import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  Checkbox,
  CircularProgress,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import { useAuth } from "../../hooks/useAuth";
import { activateBeepers, getSoldBeepers } from "../../services/api";
import { SoldBeeper } from "../../types";
import { useStyles } from "./OpsCenterStyles";

export const OpsCenter: React.FC = () => {
  const { classes } = useStyles();
  const { authState } = useAuth();
  const { openSnackbar } = useSnackbar();

  const [beepers, setBeepers] = useState<SoldBeeper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBeeperIds, setSelectedBeeperIds] = useState<string[]>([]);
  const [activating, setActivating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchBeepers = useCallback(async () => {
    if (!authState.credentials) {
      openSnackbar(
        "Operator credentials not available. Cannot fetch data.",
        "error"
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getSoldBeepers(authState.credentials);
      setBeepers(data || []);
    } catch (err) {
      const error = err as Error;
      openSnackbar(error.message || "Failed to fetch sold beepers.", "error");
      setBeepers([]);
    } finally {
      setLoading(false);
    }
  }, [authState.credentials, openSnackbar]);

  useEffect(() => {
    if (authState.isAuthenticated && authState.role === "operator") {
      fetchBeepers();
    }
  }, [authState.isAuthenticated, authState.role, fetchBeepers]);

  const filteredBeepers = useMemo(() => {
    if (!searchTerm.trim()) {
      return beepers;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return beepers.filter(
      (beeper) =>
        beeper.id.toLowerCase().includes(lowerSearchTerm) ||
        beeper.model_name.toLowerCase().includes(lowerSearchTerm) ||
        String(beeper.user_id).toLowerCase().includes(lowerSearchTerm) ||
        beeper.status.toLowerCase().includes(lowerSearchTerm)
    );
  }, [beepers, searchTerm]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelectedIds = filteredBeepers.map((n) => n.id);
      setSelectedBeeperIds(newSelectedIds);
      return;
    }
    setSelectedBeeperIds([]);
  };

  const handleRowCheckboxClick = (id: string) => {
    const selectedIndex = selectedBeeperIds.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedBeeperIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedBeeperIds.slice(1));
    } else if (selectedIndex === selectedBeeperIds.length - 1) {
      newSelected = newSelected.concat(selectedBeeperIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedBeeperIds.slice(0, selectedIndex),
        selectedBeeperIds.slice(selectedIndex + 1)
      );
    }
    setSelectedBeeperIds(newSelected);
  };

  const isSelected = (id: string) => selectedBeeperIds.indexOf(id) !== -1;

  const handleActivateSelected = async () => {
    if (selectedBeeperIds.length === 0) {
      openSnackbar("אנא בחר לפחות ביפר אחד להפעלה.", "warning");
      return;
    }
    if (!authState.credentials) {
      openSnackbar("שגיאת אימות: פרטי מפעיל חסרים.", "error");
      return;
    }
    setActivating(true);
    try {
      const response = await activateBeepers(
        selectedBeeperIds,
        authState.credentials
      );
      const activatedCount = response.activated_ids?.length || 0;
      let message = response.message || `${activatedCount} ביפר(ים) עובדו.`;

      if (response.errors && response.errors.length > 0) {
        message += ` בעיות: ${response.errors.join(", ")}`;
        openSnackbar(message, activatedCount > 0 ? "warning" : "error");
      } else if (activatedCount > 0) {
        openSnackbar(message, "success");
      } else {
        openSnackbar(message || "לא הופעלו ביפרים.", "info");
      }

      fetchBeepers();
      setSelectedBeeperIds([]);
    } catch (err) {
      const error = err as Error;
      openSnackbar(error.message || "הפעלת הביפרים נכשלה.", "error");
    } finally {
      setActivating(false);
    }
  };

  if (loading && beepers.length === 0) {
    return (
      <div className={classes.loadingOrErrorContainer}>
        <CircularProgress size={50} />
        <Typography variant="h6">טוען נתוני ביפרים...</Typography>
      </div>
    );
  }

  return (
    <div className={classes.opsCenterRoot}>
      <Typography variant="h4" component="h1" className={classes.title}>
        מרכז שליטה ובקרה מבצעי
      </Typography>

      <div className={classes.controlBar}>
        <TextField
          className={classes.searchFieldOps}
          variant="outlined"
          placeholder="חפש לפי מזהה, דגם, משתמש, סטטוס..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          className={classes.activateButton}
          onClick={handleActivateSelected}
          disabled={activating || selectedBeeperIds.length === 0 || loading}
          startIcon={
            activating ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PlayArrowIcon />
            )
          }
        >
          {activating
            ? "מפעיל..."
            : `הפעל נבחרים (${selectedBeeperIds.length})`}
        </Button>
      </div>

      {!loading && filteredBeepers.length === 0 && (
        <div className={classes.loadingOrErrorContainer}>
          <Typography variant="h6" color="textSecondary">
            {searchTerm
              ? `לא נמצאו ביפרים התואמים לחיפוש "${searchTerm}".`
              : "לא נמכרו ביפרים עדיין."}
          </Typography>
        </div>
      )}

      {filteredBeepers.length > 0 && (
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table
            stickyHeader
            className={classes.table}
            aria-label="טבלת ביפרים שנמכרו"
          >
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell padding="checkbox" className={classes.checkboxCell}>
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selectedBeeperIds.length > 0 &&
                      selectedBeeperIds.length < filteredBeepers.length
                    }
                    checked={
                      filteredBeepers.length > 0 &&
                      selectedBeeperIds.length === filteredBeepers.length
                    }
                    onChange={handleSelectAllClick}
                    inputProps={{ "aria-label": "בחר את כל הביפרים" }}
                    disabled={loading || activating}
                  />
                </TableCell>
                <TableCell className={classes.tableCell}>
                  מזהה יחידת ביפר
                </TableCell>
                <TableCell className={classes.tableCell}>דגם</TableCell>
                <TableCell className={classes.tableCell}>זמן רכישה</TableCell>
                <TableCell className={classes.tableCell}>מזהה משתמש</TableCell>
                <TableCell className={classes.tableCell}>סטטוס</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBeepers.map((beeper) => {
                const isItemSelected = isSelected(beeper.id);
                return (
                  <TableRow
                    hover
                    onClick={() => handleRowCheckboxClick(beeper.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={beeper.id}
                    selected={isItemSelected}
                    className={`${classes.tableRow} ${
                      beeper.status === "activated" ? classes.activatedRow : ""
                    }`}
                  >
                    <TableCell
                      padding="checkbox"
                      className={classes.checkboxCell}
                    >
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        slotProps={{
                          input: {
                            "aria-labelledby": `checkbox-for-${beeper.id}`,
                          },
                        }}
                        disabled={loading || activating}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={`checkbox-for-${beeper.id}`}
                      scope="row"
                      className={classes.tableCell}
                    >
                      {beeper.id}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {beeper.model_name || "לא ידוע"}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {beeper.purchase_timestamp
                        ? new Date(beeper.purchase_timestamp).toLocaleString(
                            "he-IL"
                          )
                        : "לא זמין"}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {beeper.user_id}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <div className={classes.statusCell}>
                        {beeper.status === "active" ? (
                          <CheckCircleOutlineIcon
                            fontSize="small"
                            className={classes.statusActive}
                          />
                        ) : (
                          <HighlightOffIcon
                            fontSize="small"
                            className={classes.statusActivated}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {beeper.status === "active" ? "פעיל" : "הופעל"}
                        </Typography>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
