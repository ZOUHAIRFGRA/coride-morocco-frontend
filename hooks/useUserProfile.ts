// User Profile management hooks using the services
// Provides caching and state management similar to RTK Query

import { useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { userProfileApiService } from '../services/userProfileApi';
import type { 
  UserProfile, 
  UpdateProfileRequest, 
  UpdateVehicleRequest, 
  UpdatePreferencesRequest, 
  RatingRequest 
} from '../services/userProfileApi';

export const useUserProfile = () => {
  const { state, dispatch } = useAppState();

  const getProfile = useCallback(async (forceRefresh = false) => {
    // Return cached data if available and not forcing refresh
    if (!forceRefresh && state.userProfile.profile && !state.userProfile.isLoading) {
      return { success: true, data: state.userProfile.profile };
    }

    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userProfileApiService.getProfile();
      if (response.success && response.data) {
        dispatch({ type: 'PROFILE_SUCCESS', payload: response.data });
        return { success: true, data: response.data };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to fetch profile' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, state.userProfile.profile, state.userProfile.isLoading]);

  const getPublicProfile = useCallback(async (userId: number) => {
    try {
      const response = await userProfileApiService.getPublicProfile(userId);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch public profile';
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateProfile = useCallback(async (profileData: UpdateProfileRequest) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userProfileApiService.updateProfile(profileData);
      if (response.success && response.data) {
        dispatch({ type: 'PROFILE_SUCCESS', payload: response.data });
        return { success: true, data: response.data };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to update profile' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const uploadProfilePicture = useCallback(async (imageFile: File | Blob) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userProfileApiService.uploadProfilePicture(imageFile);
      if (response.success && response.data) {
        // Refresh profile to get updated picture URL
        const profileResponse = await userProfileApiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({ type: 'PROFILE_SUCCESS', payload: profileResponse.data });
        }
        return { success: true, data: response.data };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to upload picture' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload picture';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const deleteProfilePicture = useCallback(async () => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userProfileApiService.deleteProfilePicture();
      if (response.success) {
        // Refresh profile to remove picture URL
        const profileResponse = await userProfileApiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({ type: 'PROFILE_SUCCESS', payload: profileResponse.data });
        }
        return { success: true };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to delete picture' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete picture';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const updateVehicle = useCallback(async (vehicleData: UpdateVehicleRequest) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userProfileApiService.updateVehicle(vehicleData);
      if (response.success && response.data) {
        // Refresh profile to get updated vehicle info
        const profileResponse = await userProfileApiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({ type: 'PROFILE_SUCCESS', payload: profileResponse.data });
        }
        return { success: true, data: response.data };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to update vehicle' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update vehicle';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const deleteVehicle = useCallback(async () => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userProfileApiService.deleteVehicle();
      if (response.success) {
        // Refresh profile to remove vehicle info
        const profileResponse = await userProfileApiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({ type: 'PROFILE_SUCCESS', payload: profileResponse.data });
        }
        return { success: true };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to delete vehicle' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete vehicle';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const updatePreferences = useCallback(async (preferences: UpdatePreferencesRequest) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userProfileApiService.updatePreferences(preferences);
      if (response.success && response.data) {
        // Refresh profile to get updated preferences
        const profileResponse = await userProfileApiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({ type: 'PROFILE_SUCCESS', payload: profileResponse.data });
        }
        return { success: true, data: response.data };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to update preferences' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const rateUser = useCallback(async (ratingData: RatingRequest) => {
    try {
      const response = await userProfileApiService.rateUser(ratingData);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rate user';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getUserRatings = useCallback(async (userId?: number) => {
    try {
      const response = await userProfileApiService.getUserRatings(userId);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ratings';
      return { success: false, error: errorMessage };
    }
  }, []);

  const requestIdentityVerification = useCallback(async (documentFile: File | Blob) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userProfileApiService.requestIdentityVerification(documentFile);
      if (response.success) {
        // Refresh profile to get updated verification status
        const profileResponse = await userProfileApiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({ type: 'PROFILE_SUCCESS', payload: profileResponse.data });
        }
        return { success: true, data: response.data };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to submit verification' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit verification';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const requestLicenseVerification = useCallback(async (licenseFile: File | Blob) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userProfileApiService.requestLicenseVerification(licenseFile);
      if (response.success) {
        // Refresh profile to get updated verification status
        const profileResponse = await userProfileApiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({ type: 'PROFILE_SUCCESS', payload: profileResponse.data });
        }
        return { success: true, data: response.data };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to submit verification' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit verification';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const getVerificationStatus = useCallback(async () => {
    try {
      const response = await userProfileApiService.getVerificationStatus();
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch verification status';
      return { success: false, error: errorMessage };
    }
  }, []);

  const deactivateAccount = useCallback(async (reason?: string) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userProfileApiService.deactivateAccount(reason);
      if (response.success) {
        dispatch({ type: 'PROFILE_LOADING', payload: false });
        return { success: true, data: response.data };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to deactivate account' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate account';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'PROFILE_CLEAR_ERROR' });
  }, [dispatch]);

  return {
    // State
    ...state.userProfile,
    // Actions
    getProfile,
    getPublicProfile,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    updateVehicle,
    deleteVehicle,
    updatePreferences,
    rateUser,
    getUserRatings,
    requestIdentityVerification,
    requestLicenseVerification,
    getVerificationStatus,
    deactivateAccount,
    clearError,
  };
};