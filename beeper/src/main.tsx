// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { TssCacheProvider } from "tss-react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { BrowserRouter } from "react-router-dom";

const cacheRTL = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(
    "Fatal Error: Root element with id 'root' not found in index.html."
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <TssCacheProvider value={cacheRTL}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </TssCacheProvider>
  </React.StrictMode>
);
