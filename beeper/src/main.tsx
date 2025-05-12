import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { TssCacheProvider } from "tss-react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import stylisRTLPlugin from "stylis-plugin-rtl";
import { BrowserRouter } from "react-router-dom";
import { Provider as JotaiProvider } from "jotai";
import { SnackbarProvider } from "./context/SnackbarContext";

const cacheRTL = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, stylisRTLPlugin],
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(
    "Fatal Error: Root element with id 'root' not found in index.html."
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <JotaiProvider>
      <TssCacheProvider value={cacheRTL}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <CssBaseline />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </TssCacheProvider>
    </JotaiProvider>
  </React.StrictMode>
);
