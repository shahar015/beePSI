import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
} from "@mui/material";
import { ShoppingCart, Favorite, VpnKey, Logout } from "@mui/icons-material";
import { tss } from "tss-react/mui"; // שימוש ב-tss-react

interface HeaderProps {
  isOpsCenter: boolean;
  cartItemCount: number;
  onNavigate: (page: string) => void;
  onLogout?: () => void; // רק עבור מרכז הבקרה
  isLoggedIn: boolean;
}

const useStyles = tss.create(({ theme }) => ({
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
  },
  logo: {
    cursor: "pointer",
    fontWeight: "bold",
    // ניתן להוסיף עוד עיצובים
  },
  navButtons: {
    "& > *": {
      marginLeft: theme.spacing(2),
    },
  },
}));

const Header: React.FC<HeaderProps> = ({
  isOpsCenter,
  cartItemCount,
  onNavigate,
  onLogout,
  isLoggedIn,
}) => {
  const { classes } = useStyles();

  return (
    <AppBar
      position="static"
      sx={{
        mb: 4,
        background:
          "linear-gradient(45deg, #212121 30%, #424242 90%)" /* עיצוב מודרני */,
      }}
    >
      <Toolbar className={classes.toolbar}>
        {/* <Typography
          variant="h6"
          component="div"
          className={classes.logo}
          onClick={() => onNavigate(isOpsCenter ? "/ops/dashboard" : "/shop")}
        >
          צפצוף אסטרטגי 🚀
        </Typography> */}
        <svg
          // width="250"
          height="60"
          viewBox="0 0 250 60"
          xmlns="http://www.w3.org/2000/svg"
          font-family="system-ui, sans-serif"
        >
          <defs>
            <linearGradient
              id="purpleGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "#8A2BE2", stopOpacity: 1 }}
              />{" "}
              <stop
                offset="100%"
                style={{ stopColor: "#6600CC", stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>

          <g transform="translate(30, 30)">
            <path
              d="M 0 -15 Q 25 -15, 25 0 Q 25 15, 0 15"
              stroke="url(#purpleGradient)"
              stroke-width="4"
              fill="none"
              stroke-linecap="round"
            />
            <circle cx="35" cy="0" r="6" fill="#ffab40" />
            <circle cx="35" cy="0" r="8" fill="#ffab40" fill-opacity="0.3">
              <animate
                attributeName="r"
                values="8;10;8"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                values="0.3;0.1;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          <text
            x="165"
            y="38"
            fill="#e0e0e0"
            font-size="22"
            font-weight="600"
            text-anchor="middle"
          >
            צפצוף אסטרטגי
          </text>
        </svg>

        <Box className={classes.navButtons}>
          {!isOpsCenter ? (
            <>
              <Button color="inherit" onClick={() => onNavigate("/shop")}>
                חנות
              </Button>
              <IconButton
                color="inherit"
                onClick={() => onNavigate("/favorites")}
              >
                <Favorite />
              </IconButton>
              <IconButton color="inherit" onClick={() => onNavigate("/cart")}>
                <Badge badgeContent={cartItemCount} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>
              <Button
                color="inherit"
                startIcon={<VpnKey />}
                onClick={() => onNavigate("/ops/login")}
              >
                כניסת מפעילים
              </Button>
            </>
          ) : (
            isLoggedIn &&
            onLogout && (
              <Button color="inherit" startIcon={<Logout />} onClick={onLogout}>
                יציאה
              </Button>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
