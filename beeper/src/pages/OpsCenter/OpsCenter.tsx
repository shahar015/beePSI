// src/pages/OpsCenter/OpsCenter.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
  Paper, // Using Paper as the TableContainer component
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SearchIcon from "@mui/icons-material/Search";
import { getSoldBeepers, activateBeepers } from "../../services/api";
import { SoldBeeper, AppAuthState, SnackbarSeverity } from "../../types";
import { useStyles } from "./OpsCenterStyles";

interface OpsCenterProps {
  operatorCredentials: AppAuthState["credentials"];
  openSnackbar: (message: string, severity?: SnackbarSeverity) => void;
}

export const OpsCenter: React.FC<OpsCenterProps> = ({
  operatorCredentials,
  openSnackbar,
}) => {
  const { classes } = useStyles();
  const [beepers, setBeepers] = useState<SoldBeeper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBeeperIds, setSelectedBeeperIds] = useState<string[]>([]); // Store IDs as strings
  const [activating, setActivating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchBeepers = useCallback(async () => {
    if (!operatorCredentials) {
      openSnackbar(
        "Operator credentials not available. Cannot fetch data.",
        "error"
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getSoldBeepers(operatorCredentials);
      setBeepers(data || []);
    } catch (err) {
      const error = err as Error;
      openSnackbar(error.message || "Failed to fetch sold beepers.", "error");
      setBeepers([]);
    } finally {
      setLoading(false);
    }
  }, [operatorCredentials, openSnackbar]);

  useEffect(() => {
    fetchBeepers();
  }, [fetchBeepers]);

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
      openSnackbar("Please select at least one beeper to activate.", "warning");
      return;
    }
    if (!operatorCredentials) {
      openSnackbar(
        "Authentication error: Operator credentials missing.",
        "error"
      );
      return;
    }
    setActivating(true);
    try {
      const response = await activateBeepers(
        selectedBeeperIds,
        operatorCredentials
      );
      const activatedCount = response.activated_ids?.length || 0;
      let message =
        response.message || `${activatedCount} beeper(s) processed.`;

      if (response.errors && response.errors.length > 0) {
        message += ` Issues: ${response.errors.join(", ")}`;
        openSnackbar(message, activatedCount > 0 ? "warning" : "error");
      } else if (activatedCount > 0) {
        openSnackbar(message, "success");
      } else {
        openSnackbar(message || "No beepers were activated.", "info");
      }

      fetchBeepers();
      setSelectedBeeperIds([]);
    } catch (err) {
      const error = err as Error;
      openSnackbar(error.message || "Failed to activate beepers.", "error");
    } finally {
      setActivating(false);
    }
  };

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

  if (loading && beepers.length === 0) {
    return (
      <div className={classes.loadingOrErrorContainer}>
        <CircularProgress size={50} />
        <Typography variant="h6">Loading Beeper Data...</Typography>
      </div>
    );
  }

  return (
    <div className={classes.opsCenterRoot}>
      <Typography variant="h4" component="h1" className={classes.title}>
        Ops Command & Control
      </Typography>

      <div className={classes.controlBar}>
        <TextField
          className={classes.searchFieldOps}
          variant="outlined"
          placeholder="Search by ID, Model, User ID, Status..."
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
          disabled={activating || selectedBeeperIds.length === 0}
          startIcon={
            activating ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PlayArrowIcon />
            )
          }
        >
          {activating
            ? "Activating..."
            : `Activate Selected (${selectedBeeperIds.length})`}
        </Button>
      </div>

      {!loading && filteredBeepers.length === 0 && (
        <div className={classes.loadingOrErrorContainer}>
          <Typography variant="h6" color="textSecondary">
            {searchTerm
              ? `No beepers found matching "${searchTerm}".`
              : "No beepers have been sold yet."}
          </Typography>
        </div>
      )}

      {filteredBeepers.length > 0 && (
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table
            stickyHeader
            className={classes.table}
            aria-label="sold beepers table"
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
                    inputProps={{ "aria-label": "select all beepers" }}
                  />
                </TableCell>
                <TableCell className={classes.tableCell}>
                  Beeper Unit ID
                </TableCell>
                <TableCell className={classes.tableCell}>Model</TableCell>
                <TableCell className={classes.tableCell}>
                  Purchase Time
                </TableCell>
                <TableCell className={classes.tableCell}>User ID</TableCell>
                <TableCell className={classes.tableCell}>Status</TableCell>
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
                        inputProps={{
                          "aria-labelledby": `checkbox-for-${beeper.id}`,
                        }}
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
                      {beeper.model_name || "N/A"}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {beeper.purchase_timestamp
                        ? new Date(beeper.purchase_timestamp).toLocaleString()
                        : "N/A"}
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
                          {beeper.status}
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
