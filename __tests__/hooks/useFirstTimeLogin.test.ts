import { renderHook, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFirstTimeLogin } from "@/hooks/useFirstTimeLogin";
import { useAppSelector } from "@/redux/hooks";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage");
jest.mock("@/redux/hooks");

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockUseAppSelector = useAppSelector as jest.MockedFunction<typeof useAppSelector>;

describe("useFirstTimeLogin", () => {
  const mockUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseAppSelector.mockImplementation((selector: any) => {
      const mockState = {
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
      };
      return selector(mockState);
    });
  });

  it("should show modal for first-time user", async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useFirstTimeLogin());

    // Wait for async operations
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.showFirstTimeModal).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("@first_time_login_shown_user123");
  });

  it("should not show modal for returning user", async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce("true");

    const { result } = renderHook(() => useFirstTimeLogin());

    // Wait for async operations
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.showFirstTimeModal).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should not show modal when user is not authenticated", async () => {
    mockUseAppSelector.mockImplementation((selector: any) => {
      const mockState = {
        auth: {
          isAuthenticated: false,
          user: null,
        },
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => useFirstTimeLogin());

    // Wait for async operations
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.showFirstTimeModal).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(mockAsyncStorage.getItem).not.toHaveBeenCalled();
  });

  it("should close modal and mark as shown when closeFirstTimeModal is called", async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    mockAsyncStorage.setItem.mockResolvedValueOnce(void 0);

    const { result } = renderHook(() => useFirstTimeLogin());

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.showFirstTimeModal).toBe(true);

    // Close modal
    await act(async () => {
      result.current.closeFirstTimeModal();
    });

    expect(result.current.showFirstTimeModal).toBe(false);
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith("@first_time_login_shown_user123", "true");
  });

  it("should handle skip action correctly", async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    mockAsyncStorage.setItem.mockResolvedValueOnce(void 0);

    const { result } = renderHook(() => useFirstTimeLogin());

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.showFirstTimeModal).toBe(true);

    // Skip modal
    await act(async () => {
      result.current.skipFirstTimeModal();
    });

    expect(result.current.showFirstTimeModal).toBe(false);
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith("@first_time_login_shown_user123", "true");
  });

  it("should handle AsyncStorage errors gracefully", async () => {
    mockAsyncStorage.getItem.mockRejectedValueOnce(new Error("Storage error"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useFirstTimeLogin());

    // Wait for async operations
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.showFirstTimeModal).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error checking first time login:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it("should use email as fallback key when user has no id", async () => {
    const userWithoutId = {
      email: "test@example.com",
      name: "Test User",
    };

    mockUseAppSelector.mockImplementation((selector: any) => {
      const mockState = {
        auth: {
          isAuthenticated: true,
          user: userWithoutId,
        },
      };
      return selector(mockState);
    });

    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useFirstTimeLogin());

    // Wait for async operations
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("@first_time_login_shown_test@example.com");
  });

  it("should use default key when user has no id or email", async () => {
    const userWithoutIdOrEmail = {
      name: "Test User",
    };

    mockUseAppSelector.mockImplementation((selector: any) => {
      const mockState = {
        auth: {
          isAuthenticated: true,
          user: userWithoutIdOrEmail,
        },
      };
      return selector(mockState);
    });

    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useFirstTimeLogin());

    // Wait for async operations
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("@first_time_login_shown_default");
  });
});
