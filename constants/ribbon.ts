import { Dimensions } from "react-native";

export const ITEM_WIDTH = 320; // Actual width used in feedRibbonItem.tsx
export const ITEM_HEIGHT = 48;
export const EXPANDED_HEIGHT_MULTIPLIER = 2.5;
export const SCROLL_TICK_PIXELS = 1; // Slower, smoother scroll
export const SCROLL_INTERVAL_MS = 16; // ~60 FPS
export const SCREEN_WIDTH = Dimensions.get("window").width;