import { s, vs, ms } from "@utils/responsive";

// Light theme colors
export const LIGHT_COLORS = {
  primary: {
    gradient: ["#33B7E9", "#006389"] as [string, string],
    gradientSoft: ["#99DBF4", "#33B7E9"] as [string, string],
    light: "#33B7E9",
    dark: "#006389",
    text: "#00A5E4",
    fadedBlue: "#006389",
    oceanBlue50: "#E6F6FC",
    oceanBlue100: "#CCEDFA",
    oceanBlue200: "#99DBF4",
    oceanBlue600: "#0088CC",
    oceanBlue700: "#006389",
    oceanBlue950: "#001117",
  },
  error: {
    gradient: ["#DC1C13", "#EA4C46"] as [string, string],
    light: "#f44335",
    dark: "#e61b10",
  },
  success: {
    gradient: ["#00C853", "#007E33"] as [string, string],
    light: "#00C853",
    dark: "#007E33",
    teal: "#008080",
  },
  warning: {
    gradient: ["#FF9800", "#F57C00"] as [string, string],
    light: "#FF9800",
    dark: "#F57C00",
  },
  text: {
    primary: "#1F2937",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
    gray: "#676767",
    white: "#FFFFFF",
    black: "#000000",
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F9FAFB",
    tertiary: "#F3F4F6",
    card: "#FFFFFF",
    modal: "#FFFFFF",
  },
  surface: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    elevated: "#FFFFFF",
  },
  button: {
    gradient: ["#33B7E9", "#006389"] as [string, string],
    outline: "#33B7E9",
    disabled: "#E5E7EB",
  },
  border: {
    primary: "#E5E7EB",
    secondary: "#D1D5DB",
    light: "#F3F4F6",
  },
  input: {
    background: "#FFFFFF",
    border: "#D1D5DB",
    placeholder: "#9CA3AF",
  },
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "#000000",
  role: {
    driver: { bg: "#10B98120", fg: "#10B981" },
    rider: { bg: "#3B82F620", fg: "#3B82F6" },
    admin: { bg: "#F59E0B20", fg: "#F59E0B" },
    moderator: { bg: "#8B5CF620", fg: "#8B5CF6" },
  },
};

// Dark theme colors
export const DARK_COLORS = {
  primary: {
    gradient: ["#60A5FA", "#3B82F6"] as [string, string],
    gradientSoft: ["#93C5FD", "#60A5FA"] as [string, string],
    light: "#60A5FA",
    dark: "#1D4ED8",
    text: "#60A5FA",
    fadedBlue: "#3B82F6",
    oceanBlue50: "#1E293B",
    oceanBlue100: "#334155",
    oceanBlue200: "#475569",
    oceanBlue600: "#60A5FA",
    oceanBlue700: "#3B82F6",
    oceanBlue950: "#0F172A",
  },
  error: {
    gradient: ["#F87171", "#EF4444"] as [string, string],
    light: "#F87171",
    dark: "#DC2626",
  },
  success: {
    gradient: ["#34D399", "#10B981"] as [string, string],
    light: "#34D399",
    dark: "#059669",
    teal: "#14B8A6",
  },
  warning: {
    gradient: ["#FBBF24", "#F59E0B"] as [string, string],
    light: "#FBBF24",
    dark: "#D97706",
  },
  text: {
    primary: "#F9FAFB",
    secondary: "#E5E7EB",
    tertiary: "#9CA3AF",
    gray: "#6B7280",
    white: "#FFFFFF",
    black: "#000000",
  },
  background: {
    primary: "#111827",
    secondary: "#1F2937",
    tertiary: "#374151",
    card: "#1F2937",
    modal: "#1F2937",
  },
  surface: {
    primary: "#1F2937",
    secondary: "#374151",
    elevated: "#374151",
  },
  button: {
    gradient: ["#60A5FA", "#3B82F6"] as [string, string],
    outline: "#60A5FA",
    disabled: "#374151",
  },
  border: {
    primary: "#374151",
    secondary: "#4B5563",
    light: "#6B7280",
  },
  input: {
    background: "#374151",
    border: "#4B5563",
    placeholder: "#9CA3AF",
  },
  overlay: "rgba(0, 0, 0, 0.8)",
  shadow: "#000000",
  role: {
    driver: { bg: "#34D39930", fg: "#34D399" },
    rider: { bg: "#60A5FA30", fg: "#60A5FA" },
    admin: { bg: "#FBBF2430", fg: "#FBBF24" },
    moderator: { bg: "#A78BFA30", fg: "#A78BFA" },
  },
};

// Backward compatibility - default to light theme
export const COLORS = LIGHT_COLORS;

// Theme-aware color function
export const getColors = (isDarkMode: boolean) => {
  return isDarkMode ? DARK_COLORS : LIGHT_COLORS;
};

export const FONTS = {
  regular: "Montserrat_400Regular",
  semiBold: "Montserrat_600SemiBold",
  bold: "Montserrat_700Bold",
};

export const SIZES = {
  // Global sizes
  base: s(8),
  padding: s(24),
  radius: {
    small: s(8),
    medium: s(16),
    large: s(24),
    xl: s(32),
  },
  // Font sizes
  font: {
    xs: ms(12),
    sm: ms(14),
    md: ms(16),
    lg: ms(20),
    xl: ms(24),
    xxl: ms(32),
    xxxl: ms(40),
  },
  // Spacing
  spacing: {
    xs: vs(8),
    sm: vs(16),
    md: vs(24),
    lg: vs(32),
    xl: vs(40),
    xxl: vs(48),
  },
};

export const GRADIENTS = {
  horizontal: {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  vertical: {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  diagonal: {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  diagonalReverse: {
    start: { x: 1, y: 0 },
    end: { x: 0, y: 1 },
  },
  radial: {
    start: { x: 0.5, y: 0.5 },
    end: { x: 1, y: 1 },
  },
  angle45: {
    start: { x: 0, y: 0 },
    end: { x: 0.5, y: 0.5 },
  },
  angle135: {
    start: { x: 1, y: 0 },
    end: { x: 0.5, y: 0.5 },
  },
  angle225: {
    start: { x: 1, y: 1 },
    end: { x: 0.5, y: 0.5 },
  },
  angle315: {
    start: { x: 0, y: 1 },
    end: { x: 0.5, y: 0.5 },
  },
};
