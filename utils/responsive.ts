import { Dimensions, Platform, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base width and height that we're designing for
const baseWidth = 393;
const baseHeight = 852;

// Scale based on width
export const horizontalScale = (size: number) => (SCREEN_WIDTH / baseWidth) * size;

// Scale based on height
export const verticalScale = (size: number) => (SCREEN_HEIGHT / baseHeight) * size;

// Moderate scale for fonts and elements that shouldn't scale too dramatically
export const moderateScale = (size: number, factor = 0.5) => {
  return size + (horizontalScale(size) - size) * factor;
};

// Get responsive font size
export const responsiveFontSize = (size: number) => {
  const scale = Math.min(SCREEN_WIDTH / baseWidth, SCREEN_HEIGHT / baseHeight);
  const newSize = size * scale;

  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

// Breakpoints for different screen sizes
export const breakpoints = {
  small: 320,
  medium: 375,
  large: 414,
  tablet: 768,
};

// Hook to get current screen dimensions
export const useScreenDimensions = () => {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmallDevice: SCREEN_WIDTH < breakpoints.medium,
    isTablet: SCREEN_WIDTH >= breakpoints.tablet,
  };
};

// Aliases for backward compatibility
export const s = horizontalScale;
export const vs = verticalScale;
export const ms = moderateScale;
