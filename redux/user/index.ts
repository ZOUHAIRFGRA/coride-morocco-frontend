import { userApi, useGetUserProfileQuery } from "./userEndpoints";
import userSliceReducer, {
  setUserProfile,
  setUserLoading,
  setUserError,
  clearUserProfile,
  updateUserPreferences,
  updateUserProfileField,
  selectUserProfile,
  selectUserLoading,
  selectUserError,
  selectUserPreferences,
} from "./userSlice";

export {
  // API exports
  userApi,
  useGetUserProfileQuery,

  // Action exports
  setUserProfile,
  setUserLoading,
  setUserError,
  clearUserProfile,
  updateUserPreferences,
  updateUserProfileField,

  // Selector exports
  selectUserProfile,
  selectUserLoading,
  selectUserError,
  selectUserPreferences,
};

// Default export for the reducer
export default userSliceReducer;
