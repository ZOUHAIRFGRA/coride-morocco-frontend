import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUserProfile,
  selectUserLoading,
  selectUserError,
  selectUserPreferences,
  setUserProfile,
  setUserLoading,
  setUserError,
  updateUserPreferences,
  updateUserProfileField,
  useGetUserProfileQuery,
} from "@/redux/user";
import { UserProfile } from "@/redux/user/userTypes";
import { useAppSelector } from "@/redux/hooks";

/**
 * Custom hook for working with user profile data
 */
export function useUser() {
  const dispatch = useDispatch();
  const [isQueryStarted, setIsQueryStarted] = useState(false);
  const [hasProfileFetchFailed, setHasProfileFetchFailed] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Get user data from Redux store
  const user = useSelector(selectUserProfile);
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const preferences = useSelector(selectUserPreferences);

  // Fetch user data from API with skip option to delay initial fetch
  const {
    data: userProfileData,
    isLoading: isApiLoading,
    isError: isApiError,
    error: apiError,
    refetch: originalRefetch,
    status: queryStatus,
  } = useGetUserProfileQuery(undefined, {
    // Skip query if not authenticated - prevents unnecessary API calls
    skip: !isAuthenticated,
    // Add error handling
    refetchOnMountOrArgChange: true,
  });

  // Track when the query has been started
  useEffect(() => {
    // If the query is loading or has data, it has started
    if (!isQueryStarted && (isApiLoading || userProfileData || queryStatus !== "uninitialized")) {
      setIsQueryStarted(true);
    }
  }, [isApiLoading, userProfileData, isQueryStarted, queryStatus]);

  // Update the Redux store when API data changes
  useEffect(() => {
    if (userProfileData?.user) {
      dispatch(setUserProfile(userProfileData.user));
      // Reset failure flag if we successfully got data
      setHasProfileFetchFailed(false);
    }
  }, [userProfileData, dispatch]);

  // Update loading state
  useEffect(() => {
    dispatch(setUserLoading(isApiLoading));
  }, [isApiLoading, dispatch]);

  // Update error state
  useEffect(() => {
    if (isApiError && apiError) {
      const errorMessage = "message" in apiError ? String(apiError.message) : "Failed to load user profile";
      console.error("User profile API error:", errorMessage);
      dispatch(setUserError(errorMessage));
      setHasProfileFetchFailed(true);
    } else if (!isApiError) {
      dispatch(setUserError(null));
    }
  }, [isApiError, apiError, dispatch]);

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(
    (newPreferences: { theme?: "light" | "dark" | "system"; notifications?: boolean; language?: string }) => {
      dispatch(updateUserPreferences(newPreferences));
    },
    [dispatch]
  );

  /**
   * Update specific fields in user profile
   */
  const updateProfileField = useCallback(
    (fields: Partial<UserProfile>) => {
      dispatch(updateUserProfileField(fields));
    },
    [dispatch]
  );

  /**
   * Safely refetch the user profile data
   * Handles the case where the query hasn't been started yet
   */
  const refetchProfile = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        return null;
      }

      if (isApiLoading) {
        return null;
      }

      if (!isQueryStarted) {
        setIsQueryStarted(true);
        return await originalRefetch();
      } else {
        return await originalRefetch();
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setHasProfileFetchFailed(true);
      throw err;
    }
  }, [isQueryStarted, originalRefetch, isAuthenticated, isApiLoading]);

  return {
    // User data
    profile: user,
    preferences,

    // Status
    isLoading: isLoading || isApiLoading,
    error,
    hasProfileFetchFailed,
    isQueryStarted,

    // Actions
    refetchProfile,
    updatePreferences,
    updateProfileField,
  };
}