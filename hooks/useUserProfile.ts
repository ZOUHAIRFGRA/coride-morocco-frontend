// Enhanced User Profile hooks with all API endpoints
// Provides complete user profile management for CoRide Morocco

import { useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { userApiService } from '../services/userApi';
import type { 
  UserProfile,
  UpdateProfileRequest,
  UserPreferences,
  UpdatePreferencesRequest,
  UserLocation,
  CreateLocationRequest,
  UserSearchParams,
  UserSearchResult,
  PublicUserProfile,
  UserStats,
  ProfilePhotoUploadResponse,
  UserDocuments,
  DocumentStatusResponse,
  UploadIdentityDocumentResponse,
  UploadDriverLicenseResponse,
  DocumentType
} from '../types/user';

export const useUser = () => {
  const { state, dispatch } = useAppState();

  // Profile Management
  const getProfile = useCallback(async (forceRefresh = false) => {
    // Check if we already have user data from auth context
    const authUser = state.auth.user;
    if (!forceRefresh && authUser) {
      // Use auth user data as profile base, adding missing properties for compatibility
      const profile: UserProfile = {
        ...authUser,
        bio: '',
        profile_photo_url: undefined,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        music_preference: 'any',
        conversation_preference: 'friendly',
        smoking_allowed: false,
        pets_allowed: false,
        air_conditioning: true,
        max_detour_minutes: 15,
        verification_status: {
          identity_verified: authUser.is_verified,
          phone_verified: authUser.phone_verified,
          driver_license_verified: false,
        },
        ratings: {
          as_driver: authUser.rating_average || 0,
          as_passenger: authUser.rating_average || 0,
          total_ratings: authUser.rating_count || 0,
        },
      };
      dispatch({ type: 'PROFILE_SUCCESS', payload: profile });
      return { success: true, data: profile };
    }

    // Return cached data if available and not forcing refresh
    if (!forceRefresh && state.userProfile.profile && !state.userProfile.isLoading) {
      return { success: true, data: state.userProfile.profile };
    }

    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userApiService.getProfile();
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
  }, [dispatch, state.userProfile.profile, state.userProfile.isLoading, state.auth.user]);

  const updateProfile = useCallback(async (profileData: UpdateProfileRequest) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userApiService.updateProfile(profileData);
      if (response.success && response.data) {
        dispatch({ type: 'PROFILE_SUCCESS', payload: response.data });
        
        // Also update auth user data if available
        if (state.auth.user) {
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { 
              user: { ...state.auth.user, ...profileData },
              tokens: state.auth.tokens 
            } 
          });
        }
        
        return { success: true, data: response.data };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to update profile' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, state.auth.user, state.auth.tokens]);

  const uploadProfilePhoto = useCallback(async (photoFile: File | Blob) => {
    dispatch({ type: 'PROFILE_LOADING', payload: true });
    try {
      const response = await userApiService.uploadProfilePhoto(photoFile);
      if (response.success && response.data) {
        // Refresh profile to get updated photo URL
        const profileResponse = await userApiService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch({ type: 'PROFILE_SUCCESS', payload: profileResponse.data });
        }
        return { success: true, data: response.data };
      }
      dispatch({ type: 'PROFILE_ERROR', payload: response.error?.message || 'Failed to upload photo' });
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
      dispatch({ type: 'PROFILE_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  // Preferences Management
  const getPreferences = useCallback(async () => {
    try {
      const response = await userApiService.getPreferences();
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch preferences';
      return { success: false, error: errorMessage };
    }
  }, []);

  const updatePreferences = useCallback(async (preferences: UpdatePreferencesRequest) => {
    try {
      const response = await userApiService.updatePreferences(preferences);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Location Management
  const getLocations = useCallback(async () => {
    try {
      const response = await userApiService.getLocations();
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch locations';
      return { success: false, error: errorMessage };
    }
  }, []);

  const createLocation = useCallback(async (locationData: CreateLocationRequest) => {
    try {
      const response = await userApiService.createLocation(locationData);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create location';
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteLocation = useCallback(async (locationId: number) => {
    try {
      const response = await userApiService.deleteLocation(locationId);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete location';
      return { success: false, error: errorMessage };
    }
  }, []);

  // User Discovery
  const searchUsers = useCallback(async (params: UserSearchParams = {}) => {
    try {
      const response = await userApiService.searchUsers(params);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search users';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getPublicProfile = useCallback(async (userId: number) => {
    try {
      const response = await userApiService.getPublicProfile(userId);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch public profile';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Statistics
  const getStats = useCallback(async () => {
    try {
      const response = await userApiService.getStats();
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Document Verification
  const uploadIdentityDocument = useCallback(async (
    frontImage: File | Blob,
    documentType: DocumentType,
    backImage?: File | Blob
  ) => {
    try {
      const response = await userApiService.uploadIdentityDocument(frontImage, documentType, backImage);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload identity document';
      return { success: false, error: errorMessage };
    }
  }, []);

  const uploadDriverLicense = useCallback(async (
    frontImage: File | Blob,
    backImage: File | Blob,
    licenseNumber: string,
    expiryDate: string
  ) => {
    try {
      const response = await userApiService.uploadDriverLicense(frontImage, backImage, licenseNumber, expiryDate);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload driver license';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getDocuments = useCallback(async () => {
    try {
      const response = await userApiService.getDocuments();
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch documents';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getDocumentStatus = useCallback(async (documentId: number) => {
    try {
      const response = await userApiService.getDocumentStatus(documentId);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch document status';
      return { success: false, error: errorMessage };
    }
  }, []);

  // New verification status checking
  const getVerificationStatus = useCallback(async (taskId: string) => {
    try {
      const response = await userApiService.getVerificationStatus(taskId);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch verification status';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getDocumentExtractions = useCallback(async () => {
    try {
      const response = await userApiService.getDocumentExtractions();
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch document extractions';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getDocumentExtraction = useCallback(async (extractionId: number) => {
    try {
      const response = await userApiService.getDocumentExtraction(extractionId);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch document extraction';
      return { success: false, error: errorMessage };
    }
  }, []);

  const testVerification = useCallback(async () => {
    try {
      const response = await userApiService.testVerification();
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error?.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to test verification';
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'PROFILE_CLEAR_ERROR' });
  }, [dispatch]);

  return {
    // State
    ...state.userProfile,
    // Profile Actions
    getProfile,
    updateProfile,
    uploadProfilePhoto,
    // Preferences Actions
    getPreferences,
    updatePreferences,
    // Location Actions
    getLocations,
    createLocation,
    deleteLocation,
    // User Discovery Actions
    searchUsers,
    getPublicProfile,
    // Statistics Actions
    getStats,
    // Document Verification Actions
    uploadIdentityDocument,
    uploadDriverLicense,
    getDocuments,
    getDocumentStatus,
    getVerificationStatus,
    getDocumentExtractions,
    getDocumentExtraction,
    testVerification,
    // Utility Actions
    clearError,
  };
};

// Alias for backward compatibility
export const useUserProfile = useUser;