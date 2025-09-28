import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "./userTypes";
import { RootState } from "../store";

// Define the initial state for user slice
interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
    language: string;
  };
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  preferences: {
    theme: "system",
    notifications: true,
    language: "en",
  },
};

// Create the user slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set the user profile data
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // Set loading state
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear user profile (for logout)
    clearUserProfile: (state) => {
      state.user = null;
    },

    // Update user preferences
    updateUserPreferences: (state, action: PayloadAction<Partial<UserState["preferences"]>>) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },

    // Update specific fields in user profile
    updateUserProfileField: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
});

// Export actions
export const { setUserProfile, setUserLoading, setUserError, clearUserProfile, updateUserPreferences, updateUserProfileField } = userSlice.actions;

// Export selectors
export const selectUserProfile = (state: RootState) => state.user.user;
export const selectUserLoading = (state: RootState) => state.user.isLoading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectUserPreferences = (state: RootState) => state.user.preferences;

// Export reducer
export default userSlice.reducer;
