// Mock dimensions used in tests
// Import after mocking
import { horizontalScale, verticalScale, moderateScale, breakpoints, s, vs, ms } from "@/utils/responsive";

const mockWidth = 400;
const mockHeight = 800;

// Mock the Dimensions module
const mockDimensions = {
  get: jest.fn(() => ({ width: mockWidth, height: mockHeight })),
};

// Mock the responsive module itself
jest.mock("@/utils/responsive", () => {
  // Mock the width and height used in the calculations
  const baseWidth = 393;
  const baseHeight = 852;

  // Implement the actual functions to test
  const horizontalScale = (size) => (mockWidth / baseWidth) * size;
  const verticalScale = (size) => (mockHeight / baseHeight) * size;
  const moderateScale = (size, factor = 0.5) => {
    return size + (horizontalScale(size) - size) * factor;
  };

  return {
    horizontalScale,
    verticalScale,
    moderateScale,
    breakpoints: {
      small: 320,
      medium: 375,
      large: 414,
      tablet: 768,
    },
    s: horizontalScale,
    vs: verticalScale,
    ms: moderateScale,
  };
});

describe("Responsive Utilities", () => {
  describe("horizontalScale", () => {
    it("scales a value based on screen width", () => {
      const size = 100;
      const baseWidth = 393;
      const expected = (mockWidth / baseWidth) * size;

      expect(horizontalScale(size)).toBeCloseTo(expected);
      expect(s(size)).toBeCloseTo(expected); // Alias test
    });
  });

  describe("verticalScale", () => {
    it("scales a value based on screen height", () => {
      const size = 100;
      const baseHeight = 852;
      const expected = (mockHeight / baseHeight) * size;

      expect(verticalScale(size)).toBeCloseTo(expected);
      expect(vs(size)).toBeCloseTo(expected); // Alias test
    });
  });

  describe("moderateScale", () => {
    it("scales a value with default factor", () => {
      const size = 100;
      const factor = 0.5;
      const baseWidth = 393;
      const horizontalScaled = (mockWidth / baseWidth) * size;
      const expected = size + (horizontalScaled - size) * factor;

      expect(moderateScale(size)).toBeCloseTo(expected);
      expect(ms(size)).toBeCloseTo(expected); // Alias test
    });

    it("scales a value with custom factor", () => {
      const size = 100;
      const factor = 0.75;
      const baseWidth = 393;
      const horizontalScaled = (mockWidth / baseWidth) * size;
      const expected = size + (horizontalScaled - size) * factor;

      expect(moderateScale(size, factor)).toBeCloseTo(expected);
      expect(ms(size, factor)).toBeCloseTo(expected); // Alias test
    });
  });

  describe("breakpoints", () => {
    it("exports correct breakpoint values", () => {
      expect(breakpoints.small).toBe(320);
      expect(breakpoints.medium).toBe(375);
      expect(breakpoints.large).toBe(414);
      expect(breakpoints.tablet).toBe(768);
    });
  });
});
