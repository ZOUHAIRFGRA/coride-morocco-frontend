import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SearchBar from "@/components/ui/SearchBar";

// Mock the redux store
jest.mock("@/redux/hooks", () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn((selector) => {
    // Mock state structure
    const state = {
      budgeting: { searchQuery: "budgeting query" },
      bookkeeping: { searchQuery: "bookkeeping query" },
      investment: { searchQuery: "investment query" },
    };
    return selector(state);
  }),
}));

// Mock the action creators
jest.mock("@/redux/budgeting/budgetingSlice", () => ({
  setBudgetingSearchQuery: jest.fn(),
}));

jest.mock("@/redux/bookkeeping/bookkeepingSlice", () => ({
  setBookkeepingSearchQuery: jest.fn(),
}));

jest.mock("@/redux/investment/investmentSlice", () => ({
  setInvestmentSearchQuery: jest.fn(),
}));

// Mock the sidebar component
jest.mock("@/components/ui/Sidebar", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ children }) => children || null),
  };
});

describe("SearchBar Component", () => {
  const mockOnChangeText = jest.fn();
  const mockOnProfilePress = jest.fn();

  const defaultProps = {
    placeholder: "Search",
    onChangeText: mockOnChangeText,
    showProfileIcon: true,
    onProfilePress: mockOnProfilePress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
    expect(getByPlaceholderText("Search")).toBeTruthy();
  });

  it("renders with custom placeholder text", () => {
    const { getByPlaceholderText } = render(<SearchBar {...defaultProps} placeholder="Custom search" />);
    expect(getByPlaceholderText("Custom search")).toBeTruthy();
  });

  it("calls onChangeText when input text changes", () => {
    const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);

    const input = getByPlaceholderText("Search");
    fireEvent.changeText(input, "test search");

    expect(mockOnChangeText).toHaveBeenCalledWith("test search");
  });

  it("displays the value passed as a prop", () => {
    const { getByDisplayValue } = render(<SearchBar {...defaultProps} value="test value" />);
    expect(getByDisplayValue("test value")).toBeTruthy();
  });

  it("shows profile icon when showProfileIcon is true", () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} showProfileIcon={true} />);
    expect(getByTestId("profile-button")).toBeTruthy();
  });

  it("hides profile icon when showProfileIcon is false", () => {
    const { queryByTestId } = render(<SearchBar {...defaultProps} showProfileIcon={false} />);
    expect(queryByTestId("profile-button")).toBeNull();
  });
});
