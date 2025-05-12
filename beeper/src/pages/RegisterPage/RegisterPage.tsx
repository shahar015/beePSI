import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Alert as MuiAlert,
  CircularProgress,
  Link,
} from "@mui/material";
import { useStyles } from "./RegisterPageStyles";
import { useAuth } from "../../hooks/useAuth";
import { useSnackbar } from "../../context/SnackbarContext";

export const RegisterPage: React.FC = () => {
  const { classes } = useStyles();
  const { register, authState } = useAuth();
  const { openSnackbar } = useSnackbar();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setFormError("כל השדות הם שדות חובה.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("אנא הזן כתובת אימייל תקינה.");
      return false;
    }
    if (password.length < 6) {
      setFormError("הסיסמה חייבת להכיל לפחות 6 תווים.");
      return false;
    }
    if (password !== confirmPassword) {
      setFormError("הסיסמאות אינן תואמות.");
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!validateForm()) {
      if (formError) {
        openSnackbar(formError, "warning");
      }
      return;
    }

    const success = await register(username, email, password);
    if (!success && !authState.isLoading) {
      setFormError(authState.error || "ההרשמה נכשלה. אנא נסה שוב.");
    }
  };

  return (
    <div className={classes.registerRoot}>
      <div className={classes.formContainer}>
        <Typography variant="h4" component="h1" className={classes.title}>
          יצירת חשבון
        </Typography>

        {formError && (
          <MuiAlert
            severity="error"
            className={classes.alert}
            onClose={() => setFormError(null)}
          >
            {formError}
          </MuiAlert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="שם משתמש"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={authState.isLoading}
            className={classes.textField}
            error={
              !!(formError && formError.toLowerCase().includes("username"))
            }
          />
          <TextField
            label="כתובת אימייל"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={authState.isLoading}
            className={classes.textField}
            error={!!(formError && formError.toLowerCase().includes("email"))}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={authState.isLoading}
            className={classes.textField}
            helperText="הסיסמה חייבת להכיל לפחות 6 תווים."
            error={
              !!(
                formError &&
                (formError.toLowerCase().includes("password") ||
                  formError.toLowerCase().includes("match"))
              )
            }
          />
          <TextField
            label="אימות סיסמה"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={authState.isLoading}
            className={classes.textField}
            error={!!(formError && formError.toLowerCase().includes("match"))}
          />
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
            {authState.isLoading ? "יוצר חשבון..." : "הירשם"}
          </Button>
          <div className={classes.linksContainer}>
            <Link component={RouterLink} to="/login" variant="body2">
              {"כבר יש לך חשבון? התחבר"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
