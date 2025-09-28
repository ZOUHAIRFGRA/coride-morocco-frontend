import { useState, useEffect, useCallback } from "react";
import { getSecureToken, getRefreshToken, setSecureTokens, removeSecureToken } from "@utils/secureStorage";
import { useRefreshTokenMutation } from "@/redux/auth";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setAuthenticated } from "@/redux/auth";

// Define RootState type for TypeScript
interface RootState {
  auth: {
    isAuthenticated: boolean;
    user: {
      id: string | null;
      email: string;
    };
    token: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingNavigation, setPendingNavigation] = useState(false);
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const dispatch = useAppDispatch();

  // Get authentication state from Redux store with proper typing
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await getSecureToken();
      if (token) {
        // Update Redux state
        dispatch(setAuthenticated(true));

        // Schedule a token refresh
        const refreshTokenValue = await getRefreshToken();
        if (refreshTokenValue) {
          scheduleTokenRefresh(refreshTokenValue);
        }
      } else {
        dispatch(setAuthenticated(false));
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      dispatch(setAuthenticated(false));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const scheduleTokenRefresh = async (refreshTokenValue: string) => {
    try {
      // Check if the user is still authenticated according to our Redux state
      // This uses the closure over isAuthenticated to get the current value
      if (!isAuthenticated) {
        // console.log("Token refresh skipped: User is not authenticated");
        return;
      }

      // Make sure to have error handling as the backend might reject expired tokens
      const result = await refreshTokenMutation({ refreshToken: refreshTokenValue }).unwrap();
      if (result?.token && result?.token.refreshToken) {
        await setSecureTokens(result.token.accessToken, result.token.refreshToken);
        dispatch(setAuthenticated(true));

        // Set up automatic refresh based on token expiry
        // Refresh 5 minutes before token expires or 1 hour, whichever is shorter
        const refreshTime = Math.min(result.token.expiresIn - 300, 3600) * 1000;
        setTimeout(() => {
          // When the timeout fires, check if the user is still authenticated
          if (isAuthenticated) {
            scheduleTokenRefresh(result.token.refreshToken);
          } else {
            console.log("Scheduled token refresh cancelled: User is no longer authenticated");
          }
        }, refreshTime);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      // If refresh fails, user needs to login again
      await removeSecureToken();
      dispatch(setAuthenticated(false));
    }
  };

  const signIn = async (accessToken: string, refreshTokenValue: string, email: string, clientMutationId: string) => {
    try {
      setPendingNavigation(true);
      await setSecureTokens(accessToken, refreshTokenValue);
      dispatch(setAuthenticated(true));

      // We no longer set user data in Redux since we've removed the setUser action
      // User data comes from the userProfile state instead

      // Set up token refresh
      scheduleTokenRefresh(refreshTokenValue);
      setTimeout(() => setPendingNavigation(false), 2000);
    } catch (error) {
      console.error("Error signing in:", error);
      setPendingNavigation(false);
    }
  };

  const signOut = async () => {
    try {
      await removeSecureToken();
      dispatch(setAuthenticated(false));
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    refreshTokens: scheduleTokenRefresh,
    pendingNavigation,
  };
}
