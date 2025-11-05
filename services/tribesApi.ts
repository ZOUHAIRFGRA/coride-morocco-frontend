// Tribes API Service
// Handles all API calls related to Trajectory Tribes

import { BaseApiService } from './BaseApiService';
import type {
  Tribe,
  TribeListResponse,
  TribeMember,
  TribeMemberListResponse,
  TribeMessage,
  TribeMessageListResponse,
  TribeSearchParams,
  CreateTribeRequest,
  UpdateTribeRequest,
  JoinTribeRequest,
  JoinTribeResponse,
  SendMessageRequest,
  UpdateMemberRoleRequest,
  MessageQueryParams,
  MemberQueryParams,
  TribeStatistics,
} from '../types/tribe';
import type { ApiResponse } from './BaseApiService';

class TribesApiService extends BaseApiService {
  /**
   * Search and discover tribes
   */
  async searchTribes(params: TribeSearchParams = {}): Promise<ApiResponse<TribeListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('query', params.query);
    if (params.near_latitude) queryParams.append('near_latitude', params.near_latitude.toString());
    if (params.near_longitude) queryParams.append('near_longitude', params.near_longitude.toString());
    if (params.max_distance_km) queryParams.append('max_distance_km', params.max_distance_km.toString());
    if (params.only_public !== undefined) queryParams.append('only_public', params.only_public.toString());
    if (params.has_space !== undefined) queryParams.append('has_space', params.has_space.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());

    return this.get<TribeListResponse>(`/tribes/?${queryParams.toString()}`);
  }

  /**
   * Get tribes the current user is a member of
   */
  async getMyTribes(page: number = 1, pageSize: number = 20): Promise<ApiResponse<TribeListResponse>> {
    return this.get<TribeListResponse>(`/tribes/my/tribes?page=${page}&page_size=${pageSize}`);
  }

  /**
   * Get tribe details by ID
   */
  async getTribeById(tribeId: number): Promise<ApiResponse<Tribe>> {
    return this.get<Tribe>(`/tribes/${tribeId}`);
  }

  /**
   * Create a new tribe
   */
  async createTribe(data: CreateTribeRequest): Promise<ApiResponse<Tribe>> {
    return this.post<Tribe>('/tribes/', data);
  }

  /**
   * Update tribe information (Admin only)
   */
  async updateTribe(tribeId: number, data: UpdateTribeRequest): Promise<ApiResponse<Tribe>> {
    return this.patch<Tribe>(`/tribes/${tribeId}`, data);
  }

  /**
   * Delete a tribe (Admin only)
   */
  async deleteTribe(tribeId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/tribes/${tribeId}`);
  }

  /**
   * Join a tribe or submit join request
   */
  async joinTribe(tribeId: number, data?: JoinTribeRequest): Promise<ApiResponse<JoinTribeResponse>> {
    return this.post<JoinTribeResponse>(`/tribes/${tribeId}/join`, data || {});
  }

  /**
   * Leave a tribe
   */
  async leaveTribe(tribeId: number): Promise<ApiResponse<void>> {
    return this.post<void>(`/tribes/${tribeId}/leave`, {});
  }

  /**
   * Get tribe members with pagination
   */
  async getTribeMembers(
    tribeId: number,
    params: MemberQueryParams = {}
  ): Promise<ApiResponse<TribeMemberListResponse>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());

    return this.get<TribeMemberListResponse>(`/tribes/${tribeId}/members?${queryParams.toString()}`);
  }

  /**
   * Update member role (Admin only)
   */
  async updateMemberRole(
    tribeId: number,
    userId: number,
    data: UpdateMemberRoleRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.patch<{ message: string }>(`/tribes/${tribeId}/members/${userId}/role`, data);
  }

  /**
   * Remove member from tribe (Admin/Moderator only)
   */
  async removeMember(tribeId: number, userId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/tribes/${tribeId}/members/${userId}`);
  }

  /**
   * Get tribe messages with pagination
   */
  async getMessages(
    tribeId: number,
    params: MessageQueryParams = {}
  ): Promise<ApiResponse<TribeMessageListResponse>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.before_id) queryParams.append('before_id', params.before_id.toString());

    return this.get<TribeMessageListResponse>(`/tribes/${tribeId}/messages?${queryParams.toString()}`);
  }

  /**
   * Send a message to the tribe
   */
  async sendMessage(tribeId: number, data: SendMessageRequest): Promise<ApiResponse<TribeMessage>> {
    return this.post<TribeMessage>(`/tribes/${tribeId}/messages`, data);
  }

  /**
   * Get tribe statistics (if endpoint exists)
   */
  async getTribeStatistics(tribeId: number): Promise<ApiResponse<TribeStatistics>> {
    return this.get<TribeStatistics>(`/tribes/${tribeId}/statistics`);
  }

  /**
   * Search tribes near a specific route
   */
  async searchTribesNearRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    maxDistance: number = 5
  ): Promise<ApiResponse<TribeListResponse>> {
    return this.searchTribes({
      near_latitude: startLat,
      near_longitude: startLng,
      max_distance_km: maxDistance,
      only_public: true,
      has_space: true,
    });
  }

  /**
   * Get nearby tribes based on user's current location
   */
  async getNearbyTribes(
    latitude: number,
    longitude: number,
    maxDistance: number = 10,
    page: number = 1
  ): Promise<ApiResponse<TribeListResponse>> {
    return this.searchTribes({
      near_latitude: latitude,
      near_longitude: longitude,
      max_distance_km: maxDistance,
      only_public: true,
      page,
      page_size: 20,
    });
  }
}

// Default API configuration
const defaultConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Export singleton instance
export const tribesApiService = new TribesApiService(defaultConfig);

// Export class for testing or custom instances
export { TribesApiService };
