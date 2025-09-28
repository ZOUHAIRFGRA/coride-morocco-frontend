// User API Service for CoRide Morocco
// Implements all 11 User API endpoints from the backend documentation

import { BaseApiService, ApiResponse, defaultApiConfig } from './BaseApiService';
import type {
  UserProfile,
  UpdateProfileRequest,
  UserPreferences,
  UpdatePreferencesRequest,
  UserLocation,
  CreateLocationRequest,
  UserSearchResult,
  UserSearchParams,
  PublicUserProfile,
  UserStats,
  ProfilePhotoUploadResponse,
  UserDocuments,
  DocumentStatusResponse,
  UploadIdentityDocumentResponse,
  UploadDriverLicenseResponse,
  DocumentType
} from '../types/user';

class UserApiService extends BaseApiService {
  constructor() {
    super(defaultApiConfig);
  }

  // Request deduplication for getProfile
  private profileRequest: Promise<ApiResponse<UserProfile>> | null = null;
  private preferencesRequest: Promise<ApiResponse<UserPreferences>> | null = null;
  private locationsRequest: Promise<ApiResponse<UserLocation[]>> | null = null;
  private statsRequest: Promise<ApiResponse<UserStats>> | null = null;
  private documentsRequest: Promise<ApiResponse<UserDocuments>> | null = null;

  /**
   * 1. Get User Profile
   * GET /api/users/profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    // Request deduplication
    if (this.profileRequest) {
      return this.profileRequest;
    }

    this.profileRequest = this.get<UserProfile>('/users/profile');
    
    try {
      const result = await this.profileRequest;
      return result;
    } finally {
      this.profileRequest = null;
    }
  }

  /**
   * 2. Update User Profile
   * PUT /api/users/profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    return this.put<UserProfile>('/users/profile', profileData);
  }

  /**
   * 3. Upload Profile Photo
   * POST /api/users/profile/photo
   */
  async uploadProfilePhoto(photoFile: File | Blob): Promise<ApiResponse<ProfilePhotoUploadResponse>> {
    const formData = new FormData();
    formData.append('photo', photoFile);

    return this.request<ProfilePhotoUploadResponse>(
      '/users/profile/photo',
      {
        method: 'POST',
        body: formData,
        // Don't set Content-Type, let browser set it with boundary for FormData
        headers: {},
      }
    );
  }

  /**
   * 4. Get User Preferences
   * GET /api/users/preferences
   */
  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    // Request deduplication
    if (this.preferencesRequest) {
      return this.preferencesRequest;
    }

    this.preferencesRequest = this.get<UserPreferences>('/users/preferences');
    
    try {
      const result = await this.preferencesRequest;
      return result;
    } finally {
      this.preferencesRequest = null;
    }
  }

  /**
   * 5. Update User Preferences
   * PUT /api/users/preferences
   */
  async updatePreferences(preferences: UpdatePreferencesRequest): Promise<ApiResponse<UserPreferences>> {
    return this.put<UserPreferences>('/users/preferences', preferences);
  }

  /**
   * 6. Get User Locations
   * GET /api/users/locations
   */
  async getLocations(): Promise<ApiResponse<UserLocation[]>> {
    // Request deduplication
    if (this.locationsRequest) {
      return this.locationsRequest;
    }

    this.locationsRequest = this.get<UserLocation[]>('/users/locations');
    
    try {
      const result = await this.locationsRequest;
      return result;
    } finally {
      this.locationsRequest = null;
    }
  }

  /**
   * 7. Create User Location
   * POST /api/users/locations
   */
  async createLocation(locationData: CreateLocationRequest): Promise<ApiResponse<UserLocation>> {
    return this.post<UserLocation>('/users/locations', locationData);
  }

  /**
   * 8. Delete User Location
   * DELETE /api/users/locations/{location_id}
   */
  async deleteLocation(locationId: number): Promise<ApiResponse<{ message: string }>> {
    return this.delete<{ message: string }>(`/users/locations/${locationId}`);
  }

  /**
   * 9. Search Users
   * GET /api/users/search
   */
  async searchUsers(params: UserSearchParams = {}): Promise<ApiResponse<UserSearchResult[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.role) queryParams.append('role', params.role);
    if (params.min_rating) queryParams.append('min_rating', params.min_rating.toString());
    if (params.verified_only) queryParams.append('verified_only', params.verified_only.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/users/search?${queryString}` : '/users/search';

    return this.get<UserSearchResult[]>(url);
  }

  /**
   * 10. Get Public User Profile
   * GET /api/users/{user_id}/profile
   */
  async getPublicProfile(userId: number): Promise<ApiResponse<PublicUserProfile>> {
    return this.get<PublicUserProfile>(`/users/${userId}/profile`);
  }

  /**
   * 11. Get User Statistics
   * GET /api/users/stats
   */
  async getStats(): Promise<ApiResponse<UserStats>> {
    // Request deduplication
    if (this.statsRequest) {
      return this.statsRequest;
    }

    this.statsRequest = this.get<UserStats>('/users/stats');
    
    try {
      const result = await this.statsRequest;
      return result;
    } finally {
      this.statsRequest = null;
    }
  }

  /**
   * 12. Upload Identity Document
   * POST /api/users/documents/identity
   */
  async uploadIdentityDocument(
    frontImage: File | Blob,
    documentType: DocumentType,
    backImage?: File | Blob
  ): Promise<ApiResponse<UploadIdentityDocumentResponse>> {
    const formData = new FormData();
    formData.append('front_image', frontImage);
    if (backImage) {
      formData.append('back_image', backImage);
    }

    return this.request<UploadIdentityDocumentResponse>(
      `/users/documents/identity?document_type=${documentType}`,
      {
        method: 'POST',
        body: formData,
        headers: {},
      }
    );
  }

  /**
   * 13. Upload Driver License
   * POST /api/users/documents/driver-license
   */
  async uploadDriverLicense(
    frontImage: File | Blob,
    backImage: File | Blob,
    licenseNumber: string,
    expiryDate: string
  ): Promise<ApiResponse<UploadDriverLicenseResponse>> {
    const formData = new FormData();
    formData.append('front_image', frontImage);
    formData.append('back_image', backImage);

    const params = new URLSearchParams({
      license_number: licenseNumber,
      expiry_date: expiryDate
    });

    return this.request<UploadDriverLicenseResponse>(
      `/users/documents/driver-license?${params.toString()}`,
      {
        method: 'POST',
        body: formData,
        headers: {},
      }
    );
  }

  /**
   * 14. Get User Documents
   * GET /api/users/documents
   */
  async getDocuments(): Promise<ApiResponse<UserDocuments>> {
    // Request deduplication
    if (this.documentsRequest) {
      return this.documentsRequest;
    }

    this.documentsRequest = this.get<UserDocuments>('/users/documents');
    
    try {
      const result = await this.documentsRequest;
      return result;
    } finally {
      this.documentsRequest = null;
    }
  }

  /**
   * 15. Get Document Status
   * GET /api/users/documents/{document_id}/status
   */
  async getDocumentStatus(documentId: number): Promise<ApiResponse<DocumentStatusResponse>> {
    return this.get<DocumentStatusResponse>(`/users/documents/${documentId}/status`);
  }

  /**
   * Clear all cached requests (useful for logout or force refresh)
   */
  clearCache(): void {
    this.profileRequest = null;
    this.preferencesRequest = null;
    this.locationsRequest = null;
    this.statsRequest = null;
    this.documentsRequest = null;
  }
}

export const userApiService = new UserApiService();
export default userApiService;