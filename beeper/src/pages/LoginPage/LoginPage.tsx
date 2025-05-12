import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Alert as MuiAlert,
  CircularProgress,
  Link,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useStyles } from "./LoginPageStyles";
import { useAuth } from "../../hooks/useAuth";
import { useSnackbar } from "../../context/SnackbarContext";

export const LoginPage: React.FC = () => {
  const { classes } = useStyles();
  const { login, authState } = useAuth();
  const { openSnackbar } = useSnackbar();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isOperatorLogin, setIsOperatorLogin] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPageError(null);
    if (!identifier.trim() || !password.trim()) {
      const errorMsg = "שם משתמש/אימייל וסיסמה הם שדות חובה.";
      setPageError(errorMsg);
      openSnackbar(errorMsg, "warning");
      return;
    }

    const success = await login(
      identifier,
      password,
      isOperatorLogin ? "operator" : "user"
    );

    if (!success && !authState.isLoading) {
      setPageError(
        authState.error || "ההתחברות נכשלה. אנא בדוק את הפרטים ונסה שוב."
      );
    }
  };

  return (
    <div className={classes.loginRoot}>
      <div className={classes.formContainer}>
        <Typography variant="h4" component="h1" className={classes.title}>
          {isOperatorLogin ? "התחברות מפעיל" : "התחברות משתמש"}
        </Typography>

        {pageError && (
          <MuiAlert
            severity="error"
            className={classes.alert}
            onClose={() => setPageError(null)}
          >
            {pageError}
          </MuiAlert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label={isOperatorLogin ? "שם משתמש מפעיל" : "שם משתמש או אימייל"}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="identifier"
            name="identifier"
            autoComplete={isOperatorLogin ? "username" : "email username"}
            autoFocus
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={authState.isLoading}
            className={classes.textField}
          />
          <TextField
            label="סיסמה"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={authState.isLoading}
            className={classes.textField}
          />

          <div className={classes.toggleRoleContainer}>
            <FormControlLabel
              control={
                <Switch
                  checked={isOperatorLogin}
                  onChange={(e) => setIsOperatorLogin(e.target.checked)}
                  name="operatorLoginToggle"
                  color="primary"
                  disabled={authState.isLoading}
                />
              }
              label="התחבר כמפעיל"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={authState.isLoading}
            className={classes.submitButton}
            startIcon={
              authState.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {authState.isLoading ? "מתחבר..." : "התחבר"}
          </Button>

          {!isOperatorLogin && (
            <div className={classes.linksContainer}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"אין לך משתמש? הירשם כאן"}
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
