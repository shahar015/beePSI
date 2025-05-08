import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

interface LoginPageProps {
  onLoginSuccess: (credentials: { user: string; pass: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>("admin"); // ברירת מחדל לנוחות
  const [password, setPassword] = useState<string>("password"); // ברירת מחדל לנוחות
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // כאן נשתמש ב-API שהגדרנו, אבל לצורך הדוגמה נשתמש בערכים הקבועים
      // במקרה של API אמיתי:
      // await loginOperator(username, password);
      // נדמה הצלחה אם השם משתמש והסיסמה תואמים לברירת המחדל
      if (username === "admin" && password === "password") {
        onLoginSuccess({ user: username, pass: password });
      } else {
        throw new Error("שם משתמש או סיסמה שגויים");
      }
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          כניסת מפעילים - מרכז הבקרה
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="שם משתמש"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="סיסמה"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ width: "100%", mt: 1 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "כניסה"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
