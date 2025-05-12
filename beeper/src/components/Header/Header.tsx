// src/components/Header/Header.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Typography, Button, IconButton, Badge } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useStyles } from "./HeaderStyles";
import { theme } from "../../theme";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

const StrategicBeeperLogo: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill={theme.palette.primary.main}
    />
    <path
      d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
      fill={theme.palette.primary.light}
    />
    <circle cx="12" cy="12" r="2" fill={theme.palette.background.paper} />
  </svg>
);

export const Header: React.FC = () => {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const { cartItemCount } = useCart();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className={classes.headerRoot}>
      <div
        className={classes.logoContainer}
        onClick={handleLogoClick}
        role="button"
        tabIndex={0}
        aria-label="Go to homepage"
      >
        <StrategicBeeperLogo className={classes.logoIcon} />
        <Typography variant="h5" className={classes.logoText}>
          StrategicBeeper
        </Typography>
      </div>

      <nav className={classes.navContainer}>
        {/* For NavLink to work correctly with MUI Button, NavLink becomes the component */}
        {/* The 'active' class will be applied by NavLink to the underlying <a> tag */}
        <Button
          component={NavLink}
          to="/"
          className={classes.navButton} // Apply base style, .active will be added by NavLink
          end // For exact match on root path
        >
          חנות
        </Button>

        {authState.isAuthenticated && authState.role === "operator" && (
          <Button
            component={NavLink}
            to="/ops-center"
            className={classes.navButton}
          >
            מרכז בקרה
          </Button>
        )}

        {(authState.role === "user" || !authState.isAuthenticated) && (
          <IconButton
            className={classes.cartButton}
            aria-label="עגלת קניות"
            onClick={() =>
              navigate(
                authState.isAuthenticated && authState.role === "user"
                  ? "/cart"
                  : "/login"
              )
            }
          >
            <Badge
              badgeContent={
                authState.isAuthenticated && authState.role === "user"
                  ? cartItemCount
                  : 0
              }
              color="error"
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        )}

        <div className={classes.authActionsContainer}>
          {!authState.isAuthenticated ? (
            <>
              <Button
                component={NavLink}
                to="/login"
                className={classes.navButton}
              >
                התחברות
              </Button>
              <Button
                variant="outlined"
                color="primary"
                component={NavLink}
                to="/register"
                // Combine base navButton style with specific outlined style
                // The .active class from NavLink will still apply color/fontWeight from navButton's .active
                className={cx(classes.navButton, classes.navButtonOutlined)}
              >
                הרשמה
              </Button>
            </>
          ) : (
            <>
              <div className={classes.userInfo}>
                <AccountCircleIcon
                  fontSize="small"
                  sx={{ color: theme.palette.text.secondary }}
                />
                <Typography variant="body2">
                  {authState.loggedInEntityDetails?.username || "משתמש"}
                </Typography>
                {authState.role && (
                  <Typography className={classes.userRoleText}>
                    ({authState.role === "user" ? "לקוח" : "מפעיל"})
                  </Typography>
                )}
              </div>
              <Button
                className={cx(classes.navButton, classes.logoutButton)}
                onClick={logout}
                startIcon={<ExitToAppIcon />}
              >
                התנתקות
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};
