// useBehaviorTracking Hook
// Automatically track user interactions for AI recommendations

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { recommendationsApiService } from '@/services/recommendationsApi';
import type { InteractionType } from '@/types/recommendation';

// Generate a unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Session management
let currentSessionId = generateSessionId();

export const useBehaviorTracking = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Monitor app state changes to generate new sessions
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground - generate new session
        currentSessionId = generateSessionId();
        console.log('📊 New tracking session:', currentSessionId);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Track a screen view
   */
  const trackScreenView = async (screenName: string, metadata?: Record<string, any>) => {
    try {
      await recommendationsApiService.trackInteraction({
        interaction_type: 'view_profile',
        target_type: 'screen',
        metadata: {
          screen: screenName,
          timestamp: new Date().toISOString(),
          ...metadata,
        },
        session_id: currentSessionId,
      });
    } catch (error) {
      console.error('Failed to track screen view:', error);
    }
  };

  /**
   * Track ride view
   */
  const trackRideView = async (rideId: number, source?: string) => {
    try {
      await recommendationsApiService.trackRideView(rideId, {
        source: source || 'unknown',
        session_id: currentSessionId,
      });
    } catch (error) {
      console.error('Failed to track ride view:', error);
    }
  };

  /**
   * Track ride search
   */
  const trackRideSearch = async (
    startLocation: { latitude: number; longitude: number },
    endLocation: { latitude: number; longitude: number },
    filters?: Record<string, any>
  ) => {
    try {
      await recommendationsApiService.trackRideSearch(
        {
          start_location: startLocation,
          end_location: endLocation,
          ...filters,
        },
        startLocation
      );
    } catch (error) {
      console.error('Failed to track ride search:', error);
    }
  };

  /**
   * Track ride join
   */
  const trackRideJoin = async (rideId: number) => {
    try {
      await recommendationsApiService.trackRideJoin(rideId);
    } catch (error) {
      console.error('Failed to track ride join:', error);
    }
  };

  /**
   * Track ride completion
   */
  const trackRideComplete = async (rideId: number, metadata?: Record<string, any>) => {
    try {
      await recommendationsApiService.trackRideComplete(rideId);
      
      // If rating provided, track it
      if (metadata?.rating) {
        await recommendationsApiService.trackInteraction({
          interaction_type: 'rate_user',
          target_type: 'ride',
          target_id: rideId,
          metadata,
          session_id: currentSessionId,
        });
      }
    } catch (error) {
      console.error('Failed to track ride complete:', error);
    }
  };

  /**
   * Track ride cancellation
   */
  const trackRideCancel = async (rideId: number, reason?: string) => {
    try {
      await recommendationsApiService.trackRideCancel(rideId, reason);
    } catch (error) {
      console.error('Failed to track ride cancel:', error);
    }
  };

  /**
   * Track profile view
   */
  const trackProfileView = async (userId: number) => {
    try {
      await recommendationsApiService.trackProfileView(userId);
    } catch (error) {
      console.error('Failed to track profile view:', error);
    }
  };

  /**
   * Track location search
   */
  const trackLocationSearch = async (
    location: { latitude: number; longitude: number },
    address?: string
  ) => {
    try {
      await recommendationsApiService.trackLocationSearch(location, address);
    } catch (error) {
      console.error('Failed to track location search:', error);
    }
  };

  /**
   * Track location save
   */
  const trackLocationSave = async (
    location: { latitude: number; longitude: number },
    address: string
  ) => {
    try {
      await recommendationsApiService.trackLocationSave(location, address);
    } catch (error) {
      console.error('Failed to track location save:', error);
    }
  };

  /**
   * Track tribe join
   */
  const trackTribeJoin = async (tribeId: number) => {
    try {
      await recommendationsApiService.trackTribeJoin(tribeId);
    } catch (error) {
      console.error('Failed to track tribe join:', error);
    }
  };

  /**
   * Track message send
   */
  const trackMessageSend = async (targetType: 'tribe' | 'user', targetId: number) => {
    try {
      await recommendationsApiService.trackMessageSend(targetType, targetId);
    } catch (error) {
      console.error('Failed to track message send:', error);
    }
  };

  /**
   * Track user rating
   */
  const trackUserRating = async (userId: number, rating: number) => {
    try {
      await recommendationsApiService.trackUserRating(userId, rating);
    } catch (error) {
      console.error('Failed to track user rating:', error);
    }
  };

  /**
   * Generic interaction tracking
   */
  const trackInteraction = async (
    interactionType: InteractionType,
    targetType?: string,
    targetId?: number,
    metadata?: Record<string, any>
  ) => {
    try {
      await recommendationsApiService.trackInteraction({
        interaction_type: interactionType,
        target_type: targetType,
        target_id: targetId,
        metadata,
        session_id: currentSessionId,
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  };

  return {
    trackScreenView,
    trackRideView,
    trackRideSearch,
    trackRideJoin,
    trackRideComplete,
    trackRideCancel,
    trackProfileView,
    trackLocationSearch,
    trackLocationSave,
    trackTribeJoin,
    trackMessageSend,
    trackUserRating,
    trackInteraction,
    sessionId: currentSessionId,
  };
};

/**
 * Hook to automatically track screen view on mount
 */
export const useScreenTracking = (screenName: string, metadata?: Record<string, any>) => {
  const { trackScreenView } = useBehaviorTracking();

  useEffect(() => {
    trackScreenView(screenName, metadata);
  }, [screenName]);
};
