import React from "react";
import { Box, Typography, Container } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto", // דוחף לתחתית העמוד
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {"© "}
          {new Date().getFullYear()}
          {' צפצוף אסטרטגי בע"מ. כל הזכויות שמורות (בכאילו).'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
