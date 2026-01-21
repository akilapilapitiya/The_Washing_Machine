/**
 * Centralized Color Theme
 * Brand colors: White, Black, and Hot Red
 *
 * Usage: Import these constants instead of using hardcoded Tailwind classes
 * Example: import { COLORS } from '@/lib/colors';
 *          className={COLORS.text.primary}
 */

export const COLORS = {
  // Brand Colors
  brand: {
    red: {
      DEFAULT: "#DC2626", // Hot red - primary brand color
      light: "#EF4444", // Lighter red for hover states
      dark: "#B91C1C", // Darker red for active states
      50: "#FEF2F2", // Very light red background
      100: "#FEE2E2", // Light red background
      500: "#DC2626", // Main red
      600: "#B91C1C", // Dark red
      700: "#991B1B", // Darker red
    },
    black: {
      DEFAULT: "#0F172A", // Rich black
      light: "#1E293B", // Lighter black/dark gray
      dark: "#020617", // Pure black
    },
    white: {
      DEFAULT: "#FFFFFF", // Pure white
      off: "#F8FAFC", // Off-white/very light gray
    },
  },

  // Text Colors
  text: {
    primary: "text-gray-900", // Main text (black)
    secondary: "text-gray-600", // Secondary text
    muted: "text-gray-500", // Muted text
    inverse: "text-white", // White text
    brand: "text-red-600", // Brand red text
    brandLight: "text-red-500", // Light red text
  },

  // Background Colors
  bg: {
    primary: "bg-white", // Main background
    secondary: "bg-gray-50", // Secondary background
    dark: "bg-gray-900", // Dark background
    brand: "bg-red-600", // Brand red background
    brandLight: "bg-red-50", // Light red background
    brandHover: "hover:bg-red-700", // Red hover state
  },

  // Border Colors
  border: {
    default: "border-gray-200", // Default border
    light: "border-gray-100", // Light border
    brand: "border-red-600", // Brand red border
    brandLight: "border-red-200", // Light red border
    brandHover: "hover:border-red-400", // Red hover border
  },

  // Button Variants
  button: {
    primary: {
      bg: "bg-red-600",
      hover: "hover:bg-red-700",
      text: "text-white",
      border: "border-red-600",
    },
    secondary: {
      bg: "bg-white",
      hover: "hover:bg-gray-50",
      text: "text-gray-900",
      border: "border-gray-300",
    },
    ghost: {
      bg: "bg-transparent",
      hover: "hover:bg-gray-100",
      text: "text-gray-700",
      border: "border-transparent",
    },
  },

  // Icon Colors
  icon: {
    brand: "text-red-600", // Brand red icon
    muted: "text-gray-400", // Muted icon
    inverse: "text-white", // White icon
  },

  // Ring/Focus Colors
  ring: {
    brand: "ring-red-500", // Red focus ring
    offset: "ring-offset-2", // Ring offset
  },

  // Shadow Colors
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    brand: "shadow-red-500/20", // Red shadow
  },
};

// Helper function to combine color classes
export const combineColors = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export default COLORS;
