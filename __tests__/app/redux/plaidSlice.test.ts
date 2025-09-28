import plaidReducer, { setLinkToken, setLoading, setError, setBankLinked, setAccounts, resetPlaidState } from "@/redux/plaid";
import { PlaidState, PlaidAccount } from "@/redux/plaid";

describe("Plaid Slice", () => {
  const initialState: PlaidState = {
    linkToken: null,
    loading: false,
    error: null,
    bankLinked: false,
    accounts: [],
  };

  it("should handle initial state", () => {
    expect(plaidReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setLinkToken", () => {
    const testToken = "test-link-token";
    const actual = plaidReducer(initialState, setLinkToken(testToken));

    expect(actual.linkToken).toEqual(testToken);

    // Test setting to null
    const resetTokenState = plaidReducer(actual, setLinkToken(null));
    expect(resetTokenState.linkToken).toBeNull();
  });

  it("should handle setLoading", () => {
    // Set loading to true
    const loadingState = plaidReducer(initialState, setLoading(true));
    expect(loadingState.loading).toBe(true);

    // Set loading back to false
    const notLoadingState = plaidReducer(loadingState, setLoading(false));
    expect(notLoadingState.loading).toBe(false);
  });

  it("should handle setError", () => {
    // Set an error message
    const errorMessage = "Test error message";
    const errorState = plaidReducer(initialState, setError(errorMessage));
    expect(errorState.error).toBe(errorMessage);

    // Clear the error
    const clearedErrorState = plaidReducer(errorState, setError(null));
    expect(clearedErrorState.error).toBeNull();
  });

  it("should handle setBankLinked", () => {
    // Set bank as linked
    const linkedState = plaidReducer(initialState, setBankLinked(true));
    expect(linkedState.bankLinked).toBe(true);

    // Set bank as not linked
    const notLinkedState = plaidReducer(linkedState, setBankLinked(false));
    expect(notLinkedState.bankLinked).toBe(false);
  });

  it("should handle setAccounts", () => {
    const testAccounts: PlaidAccount[] = [
      {
        id: "test-id-1",
        mask: "0000",
        name: "Test Checking",
        subtype: "checking",
        type: "depository",
        verificationStatus: "",
      },
    ];
    const state = plaidReducer(initialState, setAccounts(testAccounts));
    expect(state.accounts).toEqual(testAccounts);
  });

  it("should handle resetPlaidState", () => {
    // First, set some values
    let state = initialState;
    state = plaidReducer(state, setLinkToken("test-token"));
    state = plaidReducer(state, setLoading(true));
    state = plaidReducer(state, setError("test-error"));
    state = plaidReducer(state, setBankLinked(true));
    state = plaidReducer(
      state,
      setAccounts([
        {
          id: "test-id",
          mask: "0000",
          name: "Test Account",
          subtype: "checking",
          type: "depository",
          verificationStatus: "",
        },
      ])
    );

    // Now reset
    const resetState = plaidReducer(state, resetPlaidState());

    // Check that appropriate values were reset
    expect(resetState.linkToken).toBeNull();
    expect(resetState.loading).toBe(false);
    expect(resetState.error).toBeNull();
    expect(resetState.accounts).toEqual([]);

    // Bank linked status should remain unchanged after reset
    expect(resetState.bankLinked).toBe(true);
  });

  it("should handle multiple actions in sequence", () => {
    // Start with initial state
    let state = initialState;

    // Set a link token
    state = plaidReducer(state, setLinkToken("test-token"));
    expect(state.linkToken).toBe("test-token");

    // Start loading
    state = plaidReducer(state, setLoading(true));
    expect(state.loading).toBe(true);

    // Set an error and stop loading
    state = plaidReducer(state, setError("Something went wrong"));
    state = plaidReducer(state, setLoading(false));
    expect(state.error).toBe("Something went wrong");
    expect(state.loading).toBe(false);

    // Clear the error and token
    state = plaidReducer(state, setError(null));
    state = plaidReducer(state, setLinkToken(null));
    expect(state.error).toBeNull();
    expect(state.linkToken).toBeNull();

    // Link a bank and reset state
    state = plaidReducer(state, setBankLinked(true));
    state = plaidReducer(state, resetPlaidState());
    expect(state.bankLinked).toBe(true);
    expect(state.linkToken).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});
