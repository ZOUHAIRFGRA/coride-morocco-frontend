import { renderHook, act } from "@testing-library/react-native";
import { useTradingProfileVerification } from "@/hooks/useTradingProfileVerification";
import { useGetAlpacaAccountQuery } from "@/redux/investment/investmentEndpoints";

// Mock the Redux query hook
jest.mock("@/redux/investment/investmentEndpoints", () => ({
  useGetAlpacaAccountQuery: jest.fn(),
}));

// Mock the trading profile utils
jest.mock("@/utils/tradingProfileUtils", () => ({
  checkTradingProfileCompleteness: jest.fn(),
}));

const mockUseGetAlpacaAccountQuery = useGetAlpacaAccountQuery as jest.MockedFunction<typeof useGetAlpacaAccountQuery>;
const mockCheckTradingProfileCompleteness = require("@/utils/tradingProfileUtils").checkTradingProfileCompleteness;

describe("useTradingProfileVerification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return correct modal state initially", () => {
    mockUseGetAlpacaAccountQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as any);

    mockCheckTradingProfileCompleteness.mockReturnValue({
      isComplete: false,
      missingFields: ["Trading Profile"],
      hasApprovedAccount: false,
    });

    const { result } = renderHook(() => useTradingProfileVerification());

    expect(result.current.promptModalVisible).toBe(false);
    expect(result.current.currentAction).toBe("BUY");
    expect(result.current.missingFields).toEqual([]);
  });

  it("should show modal when trading profile is incomplete", () => {
    mockUseGetAlpacaAccountQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as any);

    mockCheckTradingProfileCompleteness.mockReturnValue({
      isComplete: false,
      missingFields: ["Trading Profile"],
      hasApprovedAccount: false,
    });

    const { result } = renderHook(() => useTradingProfileVerification());

    const mockCallback = jest.fn();

    act(() => {
      const canProceed = result.current.verifyTradingProfile("BUY", mockCallback);
      expect(canProceed).toBe(false);
    });

    expect(result.current.promptModalVisible).toBe(true);
    expect(result.current.currentAction).toBe("BUY");
    expect(result.current.missingFields).toEqual(["Trading Profile"]);
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should proceed immediately when trading profile is complete", () => {
    const completeAlpacaData = {
      id: "test-account",
      status: "APPROVED",
      identity: {
        given_name: "John",
        family_name: "Doe",
        date_of_birth: "1990-01-01",
        tax_id: "123456789",
        funding_source: ["employment_income"],
      },
      contact: {
        email_address: "john@example.com",
        phone_number: "+1234567890",
        street_address: "123 Main St",
        city: "New York",
        state: "NY",
        postal_code: "10001",
      },
    };

    // Double stringify as expected by the hook
    const doubleStringifiedData = JSON.stringify(JSON.stringify(completeAlpacaData));

    mockUseGetAlpacaAccountQuery.mockReturnValue({
      data: doubleStringifiedData,
      isLoading: false,
      isError: false,
    } as any);

    // Mock the utility to return complete profile
    mockCheckTradingProfileCompleteness.mockReturnValue({
      isComplete: true,
      missingFields: [],
      hasApprovedAccount: true,
    });

    const { result } = renderHook(() => useTradingProfileVerification());

    const mockCallback = jest.fn();

    act(() => {
      const canProceed = result.current.verifyTradingProfile("SELL", mockCallback);
      expect(canProceed).toBe(true);
    });

    expect(result.current.promptModalVisible).toBe(false);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should close modal and reset state when closePromptModal is called", () => {
    mockUseGetAlpacaAccountQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as any);

    mockCheckTradingProfileCompleteness.mockReturnValue({
      isComplete: false,
      missingFields: ["Trading Profile"],
      hasApprovedAccount: false,
    });

    const { result } = renderHook(() => useTradingProfileVerification());

    // First show the modal
    act(() => {
      result.current.verifyTradingProfile("BUY");
    });

    expect(result.current.promptModalVisible).toBe(true);

    // Then close it
    act(() => {
      result.current.closePromptModal();
    });

    expect(result.current.promptModalVisible).toBe(false);
    expect(result.current.missingFields).toEqual([]);
  });

  it("should execute callback when handleSkip is called", () => {
    mockUseGetAlpacaAccountQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as any);

    mockCheckTradingProfileCompleteness.mockReturnValue({
      isComplete: false,
      missingFields: ["Trading Profile"],
      hasApprovedAccount: false,
    });

    const { result } = renderHook(() => useTradingProfileVerification());

    const mockCallback = jest.fn();

    // Show modal with callback
    act(() => {
      result.current.verifyTradingProfile("SELL", mockCallback);
    });

    expect(result.current.promptModalVisible).toBe(true);

    // Skip verification
    act(() => {
      result.current.handleSkip();
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(result.current.promptModalVisible).toBe(false);
  });
});
