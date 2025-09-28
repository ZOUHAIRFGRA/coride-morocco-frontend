import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TabBar from "@/components/ui/TabBar";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: jest.fn(),
}));

// Mock the vector icons with simplified approach
jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: "Ionicons-Mock", // Just use a string identifier
  };
});

describe("TabBar Component", () => {
  const mockPush = jest.fn();
  const mockUsePathname = require("expo-router").usePathname;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    require("expo-router").useRouter = jest.fn(() => ({
      push: mockPush,
    }));
    mockUsePathname.mockReturnValue("/investment/(tabs)");
  });

  it("renders with all six tab items", () => {
    const { getAllByText } = render(<TabBar />);

    // Check if all 6 tabs are rendered by their text labels
    const tabNames = ["Home", "Crypto", "Portfolio", "Voice", "Stocks", "Budget"];
    tabNames.forEach((name) => {
      expect(getAllByText(name)).toHaveLength(1);
    });
  });

  it("marks the correct tab as active based on pathname", () => {
    mockUsePathname.mockReturnValue("/investment/(tabs)/crypto");

    const { getAllByText } = render(<TabBar />);

    // Find the Crypto tab text element
    const cryptoTab = getAllByText("Crypto")[0];

    // Check if the text color indicates it's active (using actual color from implementation)
    expect(cryptoTab.props.style[1].color).toBe("#006389");
  });

  it("navigates to the correct route when a tab is pressed", () => {
    const { getByText } = render(<TabBar />);

    // Press the Portfolio tab
    fireEvent.press(getByText("Portfolio"));

    // Check if router.push was called with the correct route
    expect(mockPush).toHaveBeenCalledWith("/investment/(tabs)/portfolio");
  });

  it("correctly sets active state based on the current route", () => {
    // Test with voice route active
    mockUsePathname.mockReturnValue("/investment/(tabs)/voice");

    const { getAllByText } = render(<TabBar />);

    // Voice tab should be active
    const voiceTab = getAllByText("Voice")[0];
    expect(voiceTab.props.style[1].color).toBe("#006389");

    // Budget tab should be inactive
    const budgetTab = getAllByText("Budget")[0];
    expect(budgetTab.props.style[1].color).toBe("#666");
  });

  it("marks Home tab as active when pathname is root", () => {
    mockUsePathname.mockReturnValue("/");

    const { getByText } = render(<TabBar />);

    // Find the Home tab text element
    const homeTab = getByText("Home");

    // Check if the text color indicates it's active (using actual color from implementation)
    expect(homeTab.props.style[1].color).toBe("#006389");
  });
});
