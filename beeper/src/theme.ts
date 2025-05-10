// src/theme.ts
import { createTheme, alpha, PaletteMode } from "@mui/material/styles";

// --- New Course Color Palette ---
const PRIMARY_COLOR_MAIN = "#8E44AD"; // New Purple (Studio)
const PRIMARY_COLOR_LIGHT = "#A569BD"; // Lighter variant for hovers/accents
const PRIMARY_COLOR_DARK = "#7D3C98"; // Darker variant

const SECONDARY_COLOR = "#424242"; // Dark Gray for secondary elements (closer to black)
const ACCENT_COLOR_OPS = "#FF9800"; // Softer Orange for Ops actions
const ERROR_COLOR = "#F44336"; // Standard Red
const SUCCESS_COLOR = "#4CAF50"; // Standard Green
const WARNING_COLOR = "#FFC107"; // Amber for warnings
const INFO_COLOR = "#2196F3"; // Standard Info Blue

const darkPalette = {
  mode: "dark" as PaletteMode,
  primary: {
    main: PRIMARY_COLOR_MAIN,
    light: PRIMARY_COLOR_LIGHT,
    dark: PRIMARY_COLOR_DARK,
    contrastText: "#FFFFFF", // White text on this purple should be fine
  },
  secondary: {
    // Kept from your blue theme, adjusted to be darker
    main: SECONDARY_COLOR,
    light: alpha(SECONDARY_COLOR, 0.7),
    dark: alpha(SECONDARY_COLOR, 0.9),
    contrastText: "#FFFFFF",
  },
  error: {
    main: ERROR_COLOR,
    contrastText: "#FFFFFF",
  },
  success: {
    main: SUCCESS_COLOR,
    contrastText: "#FFFFFF", // Changed to white for better contrast on this green
  },
  warning: {
    main: WARNING_COLOR,
    contrastText: "#000000",
  },
  info: {
    main: INFO_COLOR,
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#000000", // True Black background for "purple and black"
    paper: "#1A1A1A", // Very dark gray for surfaces (cards, tables)
  },
  text: {
    primary: "#EAEAEA", // Slightly off-white for readability on black
    secondary: "#BDBDBD", // Lighter gray for secondary text
    disabled: alpha("#FFFFFF", 0.45),
  },
  divider: alpha("#FFFFFF", 0.15), // Slightly more visible divider
  accentOps: {
    main: ACCENT_COLOR_OPS,
    contrastText: "#000000",
  },
};

export const theme = createTheme({
  direction: "rtl",
  palette: darkPalette, // mode: 'dark' is already in darkPalette
  typography: {
    fontFamily:
      'Assistant, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: darkPalette.primary.light,
    }, // Use lighter purple for major headings
    h2: {
      fontSize: "2.1rem",
      fontWeight: 700,
      color: darkPalette.text.primary,
    },
    h3: {
      fontSize: "1.8rem",
      fontWeight: 600,
      color: darkPalette.text.primary,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: darkPalette.text.primary,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: darkPalette.text.primary,
    },
    h6: {
      fontSize: "1.1rem",
      fontWeight: 600,
      color: darkPalette.text.primary,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.5px",
    },
    body1: {
      fontSize: "1rem",
      color: darkPalette.text.primary,
    },
    body2: {
      fontSize: "0.875rem",
      color: darkPalette.text.secondary,
    },
    caption: {
      fontSize: "0.75rem",
      color: darkPalette.text.disabled,
    },
  },
  shape: {
    borderRadius: 10, // Consistent with your previous purple theme attempt
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 24px", // From your purple theme attempt
          boxShadow: "none",
          "&:hover": {
            boxShadow: `0 2px 8px ${alpha(darkPalette.primary.main, 0.3)}`,
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: darkPalette.primary.light, // Hover with lighter purple
          },
        },
        outlinedPrimary: {
          borderColor: alpha(darkPalette.primary.main, 0.7), // Border with main purple
          "&:hover": {
            borderColor: darkPalette.primary.light,
            backgroundColor: alpha(darkPalette.primary.light, 0.08), // Subtle purple background on hover
          },
        },
        startIcon: {
          // In RTL, startIcon is on the right. We want space to its left (before the text).
          marginLeft: "8px", // Add 8px space to the left of the startIcon
          marginRight: "-4px", // MUI default is -4px (sizeMedium), adjust if needed
        },
        endIcon: {
          // In RTL, endIcon is on the left. We want space to its right (before the text).
          marginRight: "8px", // Add 8px space to the right of the endIcon
          marginLeft: "-4px", // MUI default is -4px (sizeMedium), adjust if needed
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: darkPalette.secondary.main, // Dark gray border
            },
            "&:hover fieldset": {
              borderColor: darkPalette.primary.light, // Lighter purple border on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: darkPalette.primary.main, // Main purple border on focus
              boxShadow: `0 0 0 2px ${alpha(darkPalette.primary.main, 0.25)}`,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: darkPalette.background.paper,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: darkPalette.background.paper,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: "bold",
          color: darkPalette.text.primary,
          // Using a darker, less saturated tint of the primary for table headers
          backgroundColor: alpha(darkPalette.primary.dark, 0.35),
          borderBottom: `2px solid ${darkPalette.primary.dark}`,
        },
        body: {
          color: darkPalette.text.secondary,
          borderBottom: `1px solid ${darkPalette.divider}`,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: darkPalette.text.secondary,
          "&.Mui-checked": {
            color: darkPalette.primary.main,
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-color: ${
            darkPalette.background.default
          }; /* True black body */
          color: ${darkPalette.text.primary};
          scrollbar-width: thin;
          scrollbar-color: ${darkPalette.secondary.main} ${alpha(
        darkPalette.background.paper,
        0.5
      )};
        }
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: ${alpha(darkPalette.background.paper, 0.3)};
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: ${darkPalette.secondary.main};
          border-radius: 10px;
          border: 2px solid ${alpha(darkPalette.background.paper, 0.3)};
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: ${alpha(darkPalette.secondary.light, 0.8)};
        }
      `,
    },
  },
});

// Augment the Theme interface to include your custom accent color
declare module "@mui/material/styles" {
  interface Palette {
    accentOps: Palette["primary"];
  }
  interface PaletteOptions {
    accentOps?: PaletteOptions["primary"];
  }
}
// Augment the Button component to accept the custom color
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    accentOps: true;
  }
}
