// User Profile API Service for CoRide Morocco
// Demonstrates BaseApiService usage for user profile management

import { UserResponse } from '../types/auth';
import { ApiResponse, BaseApiService, defaultApiConfig } from './BaseApiService';

// Extended user profile types
export interface UserProfile extends UserResponse {
  bio?: string;
  profile_picture?: string;
  vehicle_info?: VehicleInfo;
  preferences?: UserPreferences;
  verification_status: VerificationStatus;
  ratings: UserRatings;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  seats: number;
}

export interface UserPreferences {
  music: boolean;
  smoking: boolean;
  pets: boolean;
  air_conditioning: boolean;
  conversation_level: 'silent' | 'low' | 'normal' | 'chatty';
}

export interface VerificationStatus {
  identity_verified: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  license_verified: boolean;
}

export interface UserRatings {
  average_rating: number;
  total_ratings: number;
  as_driver: {
    average: number;
    count: number;
  };
  as_passenger: {
    average: number;
    count: number;
  };
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  bio?: string;
  preferred_language?: 'fr' | 'ar';
}

export interface UpdateVehicleRequest {
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  seats: number;
}

export interface UpdatePreferencesRequest {
  music?: boolean;
  smoking?: boolean;
  pets?: boolean;
  air_conditioning?: boolean;
  conversation_level?: 'silent' | 'low' | 'normal' | 'chatty';
}

export interface RatingRequest {
  rated_user_id: number;
  ride_id: number;
  rating: number; // 1-5
  comment?: string;
  category: 'driver' | 'passenger';
}

class UserProfileApiService extends BaseApiService {
  constructor() {
    super(defaultApiConfig);
  }

  /**
   * Get current user's full profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.get<UserProfile>('/profile');
  }

  /**
   * Get public profile of another user
   */
  async getPublicProfile(userId: number): Promise<ApiResponse<Partial<UserProfile>>> {
    return this.get<Partial<UserProfile>>(`/profile/${userId}/public`);
  }

  /**
   * Update basic profile information
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    return this.put<UserProfile>('/profile', profileData);
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(imageFile: File | Blob): Promise<ApiResponse<{ profile_picture_url: string }>> {
    const formData = new FormData();
    formData.append('profile_picture', imageFile);

    return this.request<{ profile_picture_url: string }>(
      '/profile/picture',
      {
        method: 'POST',
        body: formData,
        // Don't set Content-Type, let browser set it with boundary for FormData
        headers: {}, 
      },
      true
    );
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(): Promise<ApiResponse<{ message: string }>> {
    return this.delete<{ message: string }>('/profile/picture');
  }

  /**
   * Update vehicle information
   */
  async updateVehicle(vehicleData: UpdateVehicleRequest): Promise<ApiResponse<VehicleInfo>> {
    return this.put<VehicleInfo>('/profile/vehicle', vehicleData);
  }

  /**
   * Delete vehicle information
   */
  async deleteVehicle(): Promise<ApiResponse<{ message: string }>> {
    return this.delete<{ message: string }>('/profile/vehicle');
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: UpdatePreferencesRequest): Promise<ApiResponse<UserPreferences>> {
    return this.put<UserPreferences>('/profile/preferences', preferences);
  }

  /**
   * Rate another user
   */
  async rateUser(ratingData: RatingRequest): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/profile/ratings', ratingData);
  }

  /**
   * Get user's ratings and reviews
   */
  async getUserRatings(userId?: number): Promise<ApiResponse<any[]>> {
    const endpoint = userId ? `/profile/${userId}/ratings` : '/profile/my-ratings';
    return this.get<any[]>(endpoint);
  }

  /**
   * Request identity verification
   */
  async requestIdentityVerification(documentFile: File | Blob): Promise<ApiResponse<{ message: string }>> {
    const formData = new FormData();
    formData.append('identity_document', documentFile);

    return this.request<{ message: string }>(
      '/profile/verification/identity',
      {
        method: 'POST',
        body: formData,
        headers: {},
      },
      true
    );
  }

  /**
   * Request license verification (for drivers)
   */
  async requestLicenseVerification(licenseFile: File | Blob): Promise<ApiResponse<{ message: string }>> {
    const formData = new FormData();
    formData.append('driving_license', licenseFile);

    return this.request<{ message: string }>(
      '/profile/verification/license',
      {
        method: 'POST',
        body: formData,
        headers: {},
      },
      true
    );
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(): Promise<ApiResponse<VerificationStatus>> {
    return this.get<VerificationStatus>('/profile/verification/status');
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(reason?: string): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/profile/deactivate', { reason });
  }
}

export const userProfileApiService = new UserProfileApiService();
export default userProfileApiService;