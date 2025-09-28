/**
 * Utility functions to handle floating-point precision issues in React Native
 * These functions help prevent runtime exceptions caused by imprecise calculations
 */

/**
 * Rounds a number to a specified number of decimal places with precision
 * @param num - The number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Precisely rounded number
 */
export function preciseRound(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Safely calculates responsive width based on screen width
 * @param screenWidth - The screen width
 * @param percentage - Percentage as decimal (e.g., 0.04 for 4%)
 * @param minValue - Minimum value to return (default: 1)
 * @returns Safe responsive width value
 */
export function responsiveWidth(screenWidth: number, percentage: number, minValue: number = 1): number {
  const calculated = screenWidth * percentage;
  return Math.max(minValue, preciseRound(calculated));
}

/**
 * Safely calculates responsive height based on screen height
 * @param screenHeight - The screen height
 * @param percentage - Percentage as decimal (e.g., 0.04 for 4%)
 * @param minValue - Minimum value to return (default: 1)
 * @returns Safe responsive height value
 */
export function responsiveHeight(screenHeight: number, percentage: number, minValue: number = 1): number {
  const calculated = screenHeight * percentage;
  return Math.max(minValue, preciseRound(calculated));
}

/**
 * Safe Math.max with precision rounding
 * @param values - Array of numbers or individual numbers
 * @returns Maximum value with precision rounding
 */
export function safeMax(...values: number[]): number {
  return preciseRound(Math.max(...values));
}

/**
 * Safe Math.min with precision rounding
 * @param values - Array of numbers or individual numbers
 * @returns Minimum value with precision rounding
 */
export function safeMin(...values: number[]): number {
  return preciseRound(Math.min(...values));
}

/**
 * Converts a number to a safe value for React Native bridge
 * Prevents precision errors that can cause runtime exceptions
 * @param value - The number to make safe
 * @returns Safe number for React Native
 */
export function safeNumber(value: number): number {
  if (!isFinite(value) || isNaN(value)) {
    return 0;
  }
  return preciseRound(value);
}

/**
 * Safe percentage calculation
 * @param value - The value
 * @param total - The total value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Safe percentage as decimal
 */
export function safePercentage(value: number, total: number, decimals: number = 4): number {
  if (total === 0 || !isFinite(total) || !isFinite(value)) {
    return 0;
  }
  return preciseRound(value / total, decimals);
}

/**
 * Safe arithmetic operations with precision handling
 */
export const safeMath = {
  add: (a: number, b: number): number => preciseRound(a + b),
  subtract: (a: number, b: number): number => preciseRound(a - b),
  multiply: (a: number, b: number): number => preciseRound(a * b),
  divide: (a: number, b: number): number => {
    if (b === 0) return 0;
    return preciseRound(a / b);
  },
};
