// src/components/BeeperCard/BeeperCardStyles.ts
import { makeStyles } from "tss-react/mui";
import { alpha } from "@mui/material/styles";

// No props needed for these styles, so the generic is empty.
export const useStyles = makeStyles()((theme) => ({
  cardRoot: {
    display: "flex",
    flexDirection: "column",
    width: "280px", // Fixed width for consistent sizing in horizontal scroll
    flexShrink: 0, // Prevent cards from shrinking in the flex container
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2], // Subtle shadow
    overflow: "hidden", // To ensure image corners are rounded if image is larger
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[6], // More pronounced shadow on hover
    },
    cursor: "default", // Default cursor, as actions are on buttons
  },
  imageContainer: {
    width: "100%",
    height: "180px", // Fixed height for the image container
    backgroundColor: alpha(theme.palette.text.disabled, 0.1), // Placeholder if image fails
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // Clip image if it's too large
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain", // 'cover' might crop too much, 'contain' ensures visibility
  },
  contentArea: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    flexGrow: 1, // Allows this area to take up remaining space
    gap: theme.spacing(1),
  },
  name: {
    fontWeight: 700, // Bolder name
    fontSize: "1.2rem",
    color: theme.palette.text.primary,
    lineHeight: 1.3,
    minHeight: "2.6em", // Ensure space for two lines of text to avoid layout shifts
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2, // Limit to 2 lines
    WebkitBoxOrient: "vertical",
  },
  description: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    flexGrow: 1, // Pushes price and button to the bottom
    minHeight: "3.9em", // Approx 3 lines of text
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3, // Limit to 3 lines
    WebkitBoxOrient: "vertical",
    marginBottom: theme.spacing(1),
  },
  priceAndActionContainer: {
    marginTop: "auto", // Pushes this to the bottom of contentArea
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(1), // Space between price and button
  },
  price: {
    fontWeight: "bold",
    color: theme.palette.primary.light,
    fontSize: "1.1rem",
  },
  addToCartButton: {
    // Specific styling for the button if MUI defaults are not enough
    // Example: make it slightly smaller for a card context
    // padding: theme.spacing(0.75, 1.5),
    // fontSize: '0.8rem',
  },
}));
