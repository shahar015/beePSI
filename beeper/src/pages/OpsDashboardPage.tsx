import React, { useState, useEffect, useCallback } from "react";
// --- ייבוא רכיבי טבלה רגילים של MUI ---
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Paper,
  TableSortLabel,
  TablePagination,
} from "@mui/material";
// ---------------------------------------
import { SoldBeeper } from "../types";
import { getSoldBeepers, activateBeepers } from "../services/api";
import { tss } from "tss-react/mui";

interface OpsDashboardPageProps {
  credentials: { user: string; pass: string };
}

// עיצוב מותאם אישית לשורות בטבלה
const useStyles = tss.create(({ theme }) => ({
  tableContainer: {
    maxHeight: 650, // הגבלת גובה וגלילה
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  tableHeadCell: {
    fontWeight: "bold",
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[700]
        : theme.palette.grey[300],
  },
  activeRow: {
    // עיצוב לשורה פעילה (אופציונלי)
  },
  activatedRow: {
    backgroundColor: theme.palette.action.disabledBackground + " !important",
    color: theme.palette.text.disabled + " !important",
    "& .MuiTableCell-root": {
      // שינוי צבע הטקסט בתאים
      color: theme.palette.text.disabled + " !important",
    },
  },
  stickyHeader: {
    // להדבקת הכותרת בעת גלילה
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
}));

// פונקציות עזר למיון (דוגמה פשוטה)
type Order = "asc" | "desc";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string | Date | null },
  b: { [key in Key]: number | string | Date | null }
) => number {
  // Handle Date comparison separately if needed
  if (orderBy === "purchase_timestamp") {
    return order === "desc"
      ? (a, b) =>
          descendingComparator(
            new Date(a[orderBy]!),
            new Date(b[orderBy]!),
            orderBy
          )
      : (a, b) =>
          -descendingComparator(
            new Date(a[orderBy]!),
            new Date(b[orderBy]!),
            orderBy
          );
  }
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// יציב מיון
function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const OpsDashboardPage: React.FC<OpsDashboardPageProps> = ({ credentials }) => {
  const { classes, cx } = useStyles();
  const [soldBeepers, setSoldBeepers] = useState<SoldBeeper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // --- שינוי: ניהול בחירה כ-Set של ID-ים ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // ----------------------------------------
  const [activating, setActivating] = useState<boolean>(false);
  const [activationResult, setActivationResult] = useState<{
    message: string;
    errors: string[] | null;
  } | null>(null);

  // --- מיון ---
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] =
    useState<keyof SoldBeeper>("purchase_timestamp");
  // --- עימוד ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchBeepers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActivationResult(null);
    try {
      const data = await getSoldBeepers(credentials);
      setSoldBeepers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load sold beepers.");
      setSoldBeepers([]);
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  useEffect(() => {
    fetchBeepers();
  }, [fetchBeepers]);

  // --- טיפול בבחירה ---
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = new Set(soldBeepers.map((n) => n.id));
      setSelectedIds(newSelecteds);
      return;
    }
    setSelectedIds(new Set());
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const isSelected = (id: string) => selectedIds.has(id);
  // ----------------------

  const handleActivate = async () => {
    if (selectedIds.size === 0) return;

    setActivating(true);
    setActivationResult(null);
    setError(null);

    // סנן רק ID-ים של ביפרים שהם 'active' מתוך הנבחרים
    const idsToActivate = Array.from(selectedIds)
      .map((id) => soldBeepers.find((b) => b.id === id))
      .filter((beeper) => beeper?.status === "active")
      .map((beeper) => beeper!.id);

    if (idsToActivate.length === 0) {
      setActivationResult({
        message: "לא נבחרו ביפרים פעילים להפעלה.",
        errors: null,
      });
      setActivating(false);
      return;
    }

    try {
      const result = await activateBeepers(
        idsToActivate as string[],
        credentials
      );
      setActivationResult(result);
      await fetchBeepers(); // רענן לאחר הפעלה
      setSelectedIds(new Set()); // נקה בחירה
    } catch (err: any) {
      setError(err.message || "Failed to activate beepers.");
    } finally {
      setActivating(false);
    }
  };

  // --- טיפול במיון ---
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof SoldBeeper
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  // --- טיפול בעימוד ---
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // חישוב שורות להצגה בעמוד הנוכחי + מיון
  const visibleRows = React.useMemo(
    () =>
      stableSort(soldBeepers, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [soldBeepers, order, orderBy, page, rowsPerPage]
  );

  // --------------------

  const isActivateButtonDisabled =
    activating ||
    selectedIds.size === 0 ||
    // בדוק אם לפחות אחד מהנבחרים הוא 'active'
    !Array.from(selectedIds).some(
      (id) => soldBeepers.find((b) => b.id === id)?.status === "active"
    );

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );

  const numSelected = selectedIds.size;
  const rowCount = soldBeepers.length;

  return (
    <Container maxWidth="xl">
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ mt: 2, mb: 4, fontWeight: "bold", color: "primary.main" }}
      >
        מרכז הבקרה - ניהול ביפרים
      </Typography>

      {activationResult && (
        <Alert
          severity={activationResult.errors ? "warning" : "success"}
          sx={{ mb: 2 }}
          onClose={() => setActivationResult(null)}
        >
          {activationResult.message}
          {activationResult.errors && (
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
              {activationResult.errors.map((err, index) => (
                <li key={index}>
                  <Typography variant="body2">{err}</Typography>
                </li>
              ))}
            </Box>
          )}
        </Alert>
      )}

      <Paper sx={{ width: "100%", mb: 2, overflow: "hidden" }}>
        {" "}
        {/* Paper לעטיפת הטבלה */}
        <TableContainer className={classes.tableContainer}>
          <Table stickyHeader aria-label="sold beepers table">
            <TableHead>
              <TableRow>
                <TableCell
                  padding="checkbox"
                  className={cx(classes.tableHeadCell, classes.stickyHeader)}
                >
                  <Checkbox
                    color="primary"
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAllClick}
                    inputProps={{ "aria-label": "select all beepers" }}
                  />
                </TableCell>
                {/* יצירת כותרות עמודה עם אפשרות מיון */}
                {(
                  [
                    "id",
                    "model_name",
                    "purchase_timestamp",
                    "status",
                    "owner_identifier",
                  ] as const
                ).map((headCellId) => (
                  <TableCell
                    key={headCellId}
                    align="left"
                    padding="normal"
                    sortDirection={orderBy === headCellId ? order : false}
                    className={cx(classes.tableHeadCell, classes.stickyHeader)}
                  >
                    <TableSortLabel
                      active={orderBy === headCellId}
                      direction={orderBy === headCellId ? order : "asc"}
                      onClick={(event) => handleRequestSort(event, headCellId)}
                    >
                      {/* תרגום שמות העמודות */}
                      {headCellId === "id"
                        ? "מזהה ביפר"
                        : headCellId === "model_name"
                        ? "דגם"
                        : headCellId === "purchase_timestamp"
                        ? "זמן רכישה"
                        : headCellId === "status"
                        ? "סטטוס"
                        : headCellId === "owner_identifier"
                        ? "מזהה רוכש"
                        : headCellId}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${row.id}`;
                const rowClass =
                  row.status === "activated"
                    ? classes.activatedRow
                    : classes.activeRow;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    className={rowClass} // הוספת הקלאס המתאים
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.id}
                    </TableCell>
                    <TableCell align="left">{row.model_name}</TableCell>
                    <TableCell align="left">
                      {new Date(row.purchase_timestamp).toLocaleString("he-IL")}
                    </TableCell>
                    <TableCell align="left">
                      <Typography
                        sx={{ fontWeight: "medium" }}
                        color={
                          row.status === "active"
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {row.status === "active" ? "פעיל" : "הופעל"}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      {row.owner_identifier ?? "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* שורה ריקה אם אין נתונים בעמוד הנוכחי (לשמירה על גובה) */}
              {visibleRows.length === 0 && !loading && (
                <TableRow style={{ height: 53 * rowsPerPage }}>
                  <TableCell colSpan={6} align="center">
                    {soldBeepers.length === 0
                      ? "לא נמצאו ביפרים שנמכרו."
                      : "אין נתונים להצגה בעמוד זה."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* רכיב עימוד */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={soldBeepers.length} // סה"כ שורות
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="שורות בעמוד:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} מתוך ${count !== -1 ? count : `יותר מ-${to}`}`
          }
        />
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="contained"
          color="error"
          onClick={handleActivate}
          disabled={isActivateButtonDisabled}
          startIcon={
            activating ? (
              <CircularProgress size={20} color="inherit" />
            ) : undefined
          }
          sx={{ px: 3, py: 1 }}
        >
          הפעל נבחרים ({selectedIds.size}) {/* שינוי ל-selectedIds.size */}
        </Button>
        <Button variant="outlined" onClick={fetchBeepers} disabled={loading}>
          רענן נתונים
        </Button>
      </Box>
    </Container>
  );
};

export default OpsDashboardPage;
