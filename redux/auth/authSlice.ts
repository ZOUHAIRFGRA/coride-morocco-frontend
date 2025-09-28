import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "./authTypes";

const initialState: AuthState = {
  // Simplified auth state - minimal user info for authentication only
  user: {
    id: null,
    email: "",
  },
  token: {
    accessToken: "",
    refreshToken: "",
    expiresIn: 0,
  },
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setToken: (state, action: PayloadAction<AuthState["token"]>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.user = {
        id: null,
        email: "",
      };
      state.token = {
        accessToken: "",
        refreshToken: "",
        expiresIn: 0,
      };
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthenticated, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
