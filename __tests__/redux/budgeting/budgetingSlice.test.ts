import budgetingReducer, { updateBudgetingSettings, setBudgetingSearchQuery, resetBudgetingSettings } from "../../../redux/budgeting/budgetingSlice";
import { BudgetingState } from "../../../redux/budgeting/budgetingTypes";

describe("Budgeting Redux Slice - Critical Path", () => {
  // Initial state to use in tests
  const initialState: BudgetingState = {
    settings: {
      carryOver: false,
      predictiveMode: false,
      currency: "USD",
      startOfMonth: 1,
      notifications: true,
    },
    searchQuery: "",
  };

  it("should return the initial state", () => {
    // @ts-ignore - When undefined is passed it should return the initial state
    expect(budgetingReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it("should handle updating settings", () => {
    const updatedSettings = {
      carryOver: true,
      currency: "EUR",
    };

    const nextState = budgetingReducer(initialState, updateBudgetingSettings(updatedSettings));

    // Only the specified settings should be updated
    expect(nextState.settings.carryOver).toBe(true);
    expect(nextState.settings.currency).toBe("EUR");

    // Other settings should remain unchanged
    expect(nextState.settings.predictiveMode).toBe(false);
    expect(nextState.settings.startOfMonth).toBe(1);
    expect(nextState.settings.notifications).toBe(true);
  });

  it("should handle setting search query", () => {
    const searchQuery = "test query";

    const nextState = budgetingReducer(initialState, setBudgetingSearchQuery(searchQuery));

    expect(nextState.searchQuery).toBe(searchQuery);

    // Settings should remain unchanged
    expect(nextState.settings).toEqual(initialState.settings);
  });

  it("should handle resetting settings", () => {
    // Start with modified state
    const modifiedState: BudgetingState = {
      settings: {
        carryOver: true,
        predictiveMode: true,
        currency: "EUR",
        startOfMonth: 15,
        notifications: false,
      },
      searchQuery: "some search",
    };

    const nextState = budgetingReducer(modifiedState, resetBudgetingSettings());

    // Settings should be reset to initial values
    expect(nextState.settings).toEqual(initialState.settings);

    // Search query should remain unchanged
    expect(nextState.searchQuery).toBe(modifiedState.searchQuery);
  });

  it("should handle action sequences - critical path scenario", () => {
    // Start with the initial state
    let state = initialState;

    // 1. Update settings
    state = budgetingReducer(state, updateBudgetingSettings({ currency: "EUR", startOfMonth: 5 }));

    // 2. Set search query
    state = budgetingReducer(state, setBudgetingSearchQuery("budget search"));

    // 3. Update more settings
    state = budgetingReducer(state, updateBudgetingSettings({ predictiveMode: true }));

    // 4. Reset settings
    state = budgetingReducer(state, resetBudgetingSettings());

    // Verify final state
    expect(state).toEqual({
      settings: initialState.settings,
      searchQuery: "budget search", // This should remain unchanged after reset
    });
  });
});
