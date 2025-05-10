// src/components/Header/Header.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Use NavLink for active styling
import { Typography, Button, IconButton, Badge } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // For logout
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // For user/op icon
import { useStyles } from "./HeaderStyles";
import { AppAuthState } from "../../types"; // For role type
import BeeperLogo from "../../assets/beeper";

interface HeaderProps {
  isAuthenticated: boolean;
  username: string | null;
  role: AppAuthState["role"]; // 'user' | 'operator' | null
  onLogout: () => void;
  cartItemCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  username,
  role,
  onLogout,
  cartItemCount,
}) => {
  const { classes, cx } = useStyles(); // cx for combining class names
  const navigate = useNavigate();

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
      >
        <BeeperLogo className={classes.logoIcon} />
        <Typography variant="h5" className={classes.logoText}>
          StrategicBeeper
        </Typography>
      </div>

      {/* Navigation and Actions Section */}
      <nav className={classes.navContainer}>
        <Button
          className={cx(classes.navButton)} // NavLink will add 'active' class
          component={NavLink}
          to="/"
        >
          חנות
        </Button>

        {isAuthenticated && role === "operator" && (
          <Button
            className={cx(classes.navButton)}
            component={NavLink}
            to="/ops-center"
          >
            מרכז בקרה
          </Button>
        )}

        {/* Cart Icon - Show for users or if not authenticated (to lead to login) */}
        {(role === "user" || !isAuthenticated) && (
          <IconButton
            className={classes.cartButton}
            aria-label="shopping cart"
            onClick={() =>
              navigate(isAuthenticated && role === "user" ? "/cart" : "/login")
            } // Go to cart or login
          >
            <Badge
              badgeContent={
                isAuthenticated && role === "user" ? cartItemCount : 0
              }
              color="error"
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        )}

        {/* Authentication Actions */}
        <div className={classes.authActionsContainer}>
          {!isAuthenticated ? (
            <>
              <Button
                className={classes.navButton}
                component={NavLink}
                to="/login"
              >
                התחברות
              </Button>
              <Button
                variant="outlined" // Make register stand out a bit
                color="primary"
                className={classes.navButton} // Can reuse or make specific
                component={NavLink}
                to="/register"
              >
                הרשמה
              </Button>
            </>
          ) : (
            <>
              <div className={classes.userInfo}>
                <AccountCircleIcon fontSize="small" />
                <Typography variant="body2">{username || "User"}</Typography>
              </div>
              <Button
                className={classes.navButton}
                onClick={onLogout}
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
