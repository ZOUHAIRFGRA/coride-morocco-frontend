import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import essential slices for corriding app
import authReducer, { authApi } from "./auth";
import userReducer, { userApi } from "./user";

// Combine reducers - simplified for corriding app
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  authApi: authApi.reducer,
  userApi: userApi.reducer,
});

const appReducer = rootReducer;

const rootReducerWithReset = (state: ReturnType<typeof appReducer> | undefined, action: any) => {
  if (action.type === 'RESET_APP') {
    // This will reset all slices to their initial state
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

// Create store without persistence
const store = configureStore({
  reducer: rootReducerWithReset,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: __DEV__ ? { warnAfter: 32 } : false, // Only enable in development with throttling
      serializableCheck: __DEV__ ? { warnAfter: 32 } : false, // Only enable in development with throttling
    }).concat([
      authApi.middleware,
      userApi.middleware,
    ]),
  devTools: __DEV__, // Only enable Redux DevTools in development
});

setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
