import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AppStateContext";
import { useUserProfile } from "@/hooks/useUserProfile";

const FIRST_TIME_LOGIN_KEY = "@first_time_login_shown";

/**
 * Hook to manage first-time login modal display
 * Shows the trading profile modal once when user logs in for the first time
 */
export function useFirstTimeLogin() {
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get authentication state and user profile
  const { isAuthenticated, user } = useAuth();
  const { profile } = useUserProfile();

  useEffect(() => {
    checkFirstTimeLogin();
  }, [isAuthenticated, user, profile]);

  const checkFirstTimeLogin = async () => {
    try {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      // Create a unique key for this user using profile data or auth user data
      const userId = profile?.id || user?.id || user?.email || "default";
      const userKey = `${FIRST_TIME_LOGIN_KEY}_${userId}`;

      // Check if we've shown the modal to this user before
      const hasShownModal = await AsyncStorage.getItem(userKey);

      if (!hasShownModal) {
        // First time for this user, show the modal
        setShowFirstTimeModal(true);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error checking first time login:", error);
      setIsLoading(false);
    }
  };

  const markFirstTimeLoginShown = async () => {
    try {
      const userId = profile?.id || user?.id || user?.email || "default";
      if (!userId) return;

      const userKey = `${FIRST_TIME_LOGIN_KEY}_${userId}`;
      await AsyncStorage.setItem(userKey, "true");
      setShowFirstTimeModal(false);
    } catch (error) {
      console.error("Error marking first time login as shown:", error);
      setShowFirstTimeModal(false);
    }
  };

  const closeFirstTimeModal = () => {
    markFirstTimeLoginShown();
  };

  const skipFirstTimeModal = () => {
    markFirstTimeLoginShown();
  };

  return {
    showFirstTimeModal,
    isLoading,
    closeFirstTimeModal,
    skipFirstTimeModal,
  };
}
