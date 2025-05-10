// src/pages/LoginPage/LoginPage.tsx
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
import { UserData, OperatorData, SnackbarSeverity } from "../../types";
import { useStyles } from "./LoginPageStyles";

interface LoginPageProps {
  onLoginSuccess: (
    credentials: { username: string; password_plaintext: string },
    entityDetails: UserData | OperatorData,
    role: "user" | "operator"
  ) => void;
  openSnackbar: (message: string, severity?: SnackbarSeverity) => void;
  apiLoginUser: (
    identifier: string,
    password_plaintext: string
  ) => Promise<{ message: string; user: UserData; role: "user" }>;
  apiLoginOperator: (
    username: string,
    password_plaintext: string
  ) => Promise<{ message: string; operator: OperatorData; role: "operator" }>;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  openSnackbar,
  apiLoginUser,
  apiLoginOperator,
}) => {
  const { classes } = useStyles();
  const [identifier, setIdentifier] = useState(""); // For username or email
  const [password, setPassword] = useState("");
  const [isOperatorLogin, setIsOperatorLogin] = useState(false); // Toggle between user/operator
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError("שם משתמש/ סיסמה לא יכולים להיות ריקים");
      openSnackbar("שם משתמש/סיסמה לא יכולים להיות ריקים", "warning");
      setLoading(false);
      return;
    }

    try {
      if (isOperatorLogin) {
        const response = await apiLoginOperator(identifier, password);
        onLoginSuccess(
          { username: identifier, password_plaintext: password },
          response.operator,
          "operator"
        );
      } else {
        const response = await apiLoginUser(identifier, password);
        onLoginSuccess(
          { username: response.user.username, password_plaintext: password }, // Use actual username from response for user
          response.user,
          "user"
        );
      }
    } catch (err) {
      const error = err as Error; // Cast to Error type
      const errorMessage =
        error.message || "התחברות נכשלה. שם משתמש או סיסמה שגויים.";
      setError(errorMessage);
      openSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.loginRoot}>
      <div className={classes.formContainer}>
        <Typography variant="h4" component="h1" className={classes.title}>
          {isOperatorLogin ? "התחברות מפעיל" : "התחברות משתמש"}
        </Typography>

        {error && (
          <MuiAlert severity="error" className={classes.alert}>
            {error}
          </MuiAlert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label={isOperatorLogin ? "שם משתמש מפעיל" : "שם משתמש/ אימייל"}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
            className={classes.submitButton}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading ? "מתחבר..." : "התחבר"}
          </Button>

          {!isOperatorLogin && ( // Show register link only for user login
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
