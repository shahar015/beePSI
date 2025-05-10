// src/pages/RegisterPage/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Alert as MuiAlert,
  CircularProgress,
  Link,
} from "@mui/material";
import { UserData, SnackbarSeverity, ApiErrorResponse } from "../../types";
import { useStyles } from "./RegisterPageStyles";

interface RegisterPageProps {
  openSnackbar: (message: string, severity?: SnackbarSeverity) => void;
  // API function passed from App.tsx
  apiRegisterUser: (
    username: string,
    email: string,
    password_plaintext: string
  ) => Promise<{ message: string; user: UserData }>;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  openSnackbar,
  apiRegisterUser,
}) => {
  const { classes } = useStyles();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // For form-level validation errors

  const validateForm = (): boolean => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setFormError("כל השדות הם חובה.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("בבקשה הכנס אימייל תקין.");
      return false;
    }
    if (password.length < 6) {
      setFormError("סייסמה חייבת להכיל לפחות 6 תווים.");
      return false;
    }
    if (password !== confirmPassword) {
      setFormError("סיסמאות לא תואמות.");
      return false;
    }
    setFormError(null); // Clear previous validation errors
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      // Form error will be displayed by the Alert component
      if (formError) openSnackbar(formError, "warning"); // Also show in snackbar for consistency
      return;
    }

    setLoading(true);
    try {
      const response = await apiRegisterUser(username, email, password);
      openSnackbar(
        response.message || "הרשמה בוצעה בהצלחה. אנא התחבר.",
        "success"
      );
      navigate("/login"); // Redirect to login page after successful registration
    } catch (err) {
      const error = err as ApiErrorResponse | Error;
      const errorMessage =
        (error as ApiErrorResponse).error ||
        (error as Error).message ||
        "הרשמה נכשלה. אנא נסה שוב.";
      setFormError(errorMessage); // Display error in the form's alert
      openSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.registerRoot}>
      <div className={classes.formContainer}>
        <Typography variant="h4" component="h1" className={classes.title}>
          צור חשבון
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
            disabled={loading}
            className={classes.textField}
            error={
              !!(formError && formError.toLowerCase().includes("username"))
            } // Example specific field error highlight
          />
          <TextField
            label="אימייל"
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
            disabled={loading}
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
            disabled={loading}
            className={classes.textField}
            helperText="סיסמה חייבת להכיל לפחות 6 תווים."
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
            disabled={loading}
            className={classes.textField}
            error={!!(formError && formError.toLowerCase().includes("match"))}
          />
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
            {loading ? "הרשמה מתבצעת..." : "הירשם"}
          </Button>
          <div className={classes.linksContainer}>
            <Link component={RouterLink} to="/login" variant="body2">
              {"כבר יש לך חשבון? התחבר כאן"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
