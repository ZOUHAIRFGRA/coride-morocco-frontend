import investmentReducer, {
  updateInvestmentSettings,
  setInvestmentSearchQuery,
  setRiskTolerance,
  resetInvestmentSettings,
} from "../../../redux/investment/investmentSlice";
import { InvestmentState } from "../../../redux/investment/investmentTypes";

describe("Investment Redux Slice - Critical Path", () => {
  // Initial state to use in tests
  const initialState: InvestmentState = {
    settings: {
      defaultCurrency: "USD",
      riskTolerance: "medium",
      enableAlerts: true,
      portfolioRefreshRate: "hourly",
      showPerformanceMetrics: true,
    },
    searchQuery: "",
  };

  it("should return the initial state", () => {
    // @ts-ignore - When undefined is passed it should return the initial state
    expect(investmentReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it("should handle updating settings", () => {
    const updatedSettings = {
      defaultCurrency: "EUR",
      enableAlerts: false,
    };

    const nextState = investmentReducer(initialState, updateInvestmentSettings(updatedSettings));

    // Only the specified settings should be updated
    expect(nextState.settings.defaultCurrency).toBe("EUR");
    expect(nextState.settings.enableAlerts).toBe(false);

    // Other settings should remain unchanged
    expect(nextState.settings.riskTolerance).toBe("medium");
    expect(nextState.settings.portfolioRefreshRate).toBe("hourly");
    expect(nextState.settings.showPerformanceMetrics).toBe(true);
  });

  it("should handle setting search query", () => {
    const searchQuery = "crypto";

    const nextState = investmentReducer(initialState, setInvestmentSearchQuery(searchQuery));

    expect(nextState.searchQuery).toBe(searchQuery);

    // Settings should remain unchanged
    expect(nextState.settings).toEqual(initialState.settings);
  });

  it("should handle setting risk tolerance", () => {
    // Test for each possible risk level
    const riskLevels: ("low" | "medium" | "high")[] = ["low", "medium", "high"];

    riskLevels.forEach((riskLevel) => {
      const nextState = investmentReducer(initialState, setRiskTolerance(riskLevel));

      expect(nextState.settings.riskTolerance).toBe(riskLevel);

      // Other settings should remain unchanged
      expect(nextState.settings.defaultCurrency).toBe("USD");
      expect(nextState.settings.enableAlerts).toBe(true);
      expect(nextState.settings.portfolioRefreshRate).toBe("hourly");
      expect(nextState.settings.showPerformanceMetrics).toBe(true);
    });
  });

  it("should handle resetting settings", () => {
    // Start with modified state
    const modifiedState: InvestmentState = {
      settings: {
        defaultCurrency: "EUR",
        riskTolerance: "high",
        enableAlerts: false,
        portfolioRefreshRate: "realtime",
        showPerformanceMetrics: false,
      },
      searchQuery: "bitcoin",
    };

    const nextState = investmentReducer(modifiedState, resetInvestmentSettings());

    // Settings should be reset to initial values
    expect(nextState.settings).toEqual(initialState.settings);

    // Search query should remain unchanged
    expect(nextState.searchQuery).toBe(modifiedState.searchQuery);
  });

  it("should handle critical path scenario - changing risk profile and search", () => {
    // This test simulates a user adjusting investment settings for a more aggressive strategy
    // while searching for crypto investments

    // Start with the initial state
    let state = initialState;

    // 1. User searches for crypto investments
    state = investmentReducer(state, setInvestmentSearchQuery("crypto"));

    expect(state.searchQuery).toBe("crypto");

    // 2. User increases risk tolerance
    state = investmentReducer(state, setRiskTolerance("high"));

    expect(state.settings.riskTolerance).toBe("high");

    // 3. User changes to real-time portfolio updates
    state = investmentReducer(state, updateInvestmentSettings({ portfolioRefreshRate: "realtime" }));

    expect(state.settings.portfolioRefreshRate).toBe("realtime");
    expect(state.searchQuery).toBe("crypto"); // Should still maintain the search

    // 4. Final check of the state after all actions
    expect(state).toEqual({
      settings: {
        ...initialState.settings,
        riskTolerance: "high",
        portfolioRefreshRate: "realtime",
      },
      searchQuery: "crypto",
    });
  });
});
