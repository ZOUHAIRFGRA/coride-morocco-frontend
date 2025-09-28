import { s, vs, ms } from "@utils/responsive";

export const COLORS = {
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
  text: {
    primary: "#414141",
    secondary: "#757575",
    tertiary: "#7D7B7B",
    gray: "#676767",
    white: "#FFFFFF",
  },
  background: {
    white: "#FFFFFF",
    lightGray: "#E0E0E0",
  },
  button: {
    gradient: ["#33B7E9", "#006389"] as [string, string],
    outline: "#33B7E9",
  },
  border: {
    primary: "#D9D9D9",
    secondary: "#B3B3B3",
    gray: "#676767",
  },
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
