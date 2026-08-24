// AI & Recommendations API Service
// Phase 6: Intelligent recommendation system

import { BaseApiService } from './BaseApiService';
import type {
  RecommendationsResponse,
  RideRecommendation,
  TribeRecommendation,
  UserRecommendation,
  BehaviorPattern,
  UserAnalytics,
  SmartRouteRequest,
  SmartRouteResponse,
  CreateInteractionInput,
  InteractionResponse,
  RecommendationFeedback,
  GetRecommendationsRequest,
  RecommendationType,
} from '../types/recommendation';
import type { ApiResponse } from './BaseApiService';

class RecommendationsApiService extends BaseApiService {
  /**
   * Get comprehensive personalized recommendations
   * @param request Recommendation request parameters
   */
  async getRecommendations(request: GetRecommendationsRequest): Promise<ApiResponse<RecommendationsResponse>> {
    return this.post<RecommendationsResponse>('/ai/recommendations', request);
  }

  /**
   * Get ride recommendations only
   * @param limit Number of recommendations (1-50)
   * @param includeReasons Include human-readable reasons
   */
  async getRideRecommendations(
    limit: number = 10,
    includeReasons: boolean = true
  ): Promise<ApiResponse<RideRecommendation[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      include_reasons: includeReasons.toString(),
    });
    return this.get<RideRecommendation[]>(`/ai/recommendations/rides?${params.toString()}`);
  }

  /**
   * Get tribe recommendations only
   * @param limit Number of recommendations (1-50)
   * @param includeReasons Include human-readable reasons
   */
  async getTribeRecommendations(
    limit: number = 10,
    includeReasons: boolean = true
  ): Promise<ApiResponse<TribeRecommendation[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      include_reasons: includeReasons.toString(),
    });
    return this.get<TribeRecommendation[]>(`/ai/recommendations/tribes?${params.toString()}`);
  }

  /**
   * Get user recommendations (compatible users)
   * @param limit Number of recommendations (1-50)
   * @param includeReasons Include human-readable reasons
   */
  async getUserRecommendations(
    limit: number = 10,
    includeReasons: boolean = true
  ): Promise<ApiResponse<UserRecommendation[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      include_reasons: includeReasons.toString(),
    });
    return this.get<UserRecommendation[]>(`/ai/recommendations/users?${params.toString()}`);
  }

  /**
   * Get smart route suggestions with demand analysis
   * @param request Route analysis request
   */
  async getSmartRoute(request: SmartRouteRequest): Promise<ApiResponse<SmartRouteResponse>> {
    return this.post<SmartRouteResponse>('/ai/smart-routes', request);
  }

  /**
   * Track user interaction for behavior analysis
   * @param interaction Interaction data
   */
  async trackInteraction(interaction: CreateInteractionInput): Promise<ApiResponse<InteractionResponse>> {
    return this.post<InteractionResponse>('/ai/interactions', interaction);
  }

  /**
   * Get user's behavior pattern
   */
  async getBehaviorPattern(): Promise<ApiResponse<BehaviorPattern>> {
    return this.get<BehaviorPattern>('/ai/behavior/pattern');
  }

  /**
   * Get comprehensive user analytics
   */
  async getUserAnalytics(): Promise<ApiResponse<UserAnalytics>> {
    return this.get<UserAnalytics>('/ai/analytics');
  }

  /**
   * Submit recommendation feedback
   * @param feedback User feedback on recommendation
   */
  async submitFeedback(feedback: RecommendationFeedback): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/ai/feedback', feedback);
  }

  /**
   * Manually trigger behavior pattern analysis
   */
  async analyzeBehavior(): Promise<ApiResponse<BehaviorPattern>> {
    return this.post<BehaviorPattern>('/ai/behavior/analyze', {});
  }

  // ==================== Helper Methods ====================

  /**
   * Track ride view interaction
   */
  async trackRideView(rideId: number, metadata?: Record<string, any>): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'view_ride',
      target_type: 'ride',
      target_id: rideId,
      metadata,
    });
  }

  /**
   * Track ride search interaction
   */
  async trackRideSearch(
    searchQuery: Record<string, any>,
    locationData?: { latitude: number; longitude: number }
  ): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'search_ride',
      target_type: 'ride',
      search_query: searchQuery,
      location_data: locationData,
    });
  }

  /**
   * Track ride join interaction
   */
  async trackRideJoin(rideId: number): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'join_ride',
      target_type: 'ride',
      target_id: rideId,
    });
  }

  /**
   * Track ride completion
   */
  async trackRideComplete(rideId: number): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'complete_ride',
      target_type: 'ride',
      target_id: rideId,
    });
  }

  /**
   * Track ride cancellation
   */
  async trackRideCancel(rideId: number, reason?: string): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'cancel_ride',
      target_type: 'ride',
      target_id: rideId,
      metadata: reason ? { reason } : undefined,
    });
  }

  /**
   * Track profile view
   */
  async trackProfileView(userId: number): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'view_profile',
      target_type: 'user',
      target_id: userId,
    });
  }

  /**
   * Track location search
   */
  async trackLocationSearch(locationData: { latitude: number; longitude: number }, address?: string): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'search_location',
      target_type: 'location',
      location_data: locationData,
      metadata: address ? { address } : undefined,
    });
  }

  /**
   * Track location save
   */
  async trackLocationSave(locationData: { latitude: number; longitude: number }, address: string): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'save_location',
      target_type: 'location',
      location_data: locationData,
      metadata: { address },
    });
  }

  /**
   * Track tribe join
   */
  async trackTribeJoin(tribeId: number): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'join_tribe',
      target_type: 'tribe',
      target_id: tribeId,
    });
  }

  /**
   * Track message send
   */
  async trackMessageSend(targetType: 'tribe' | 'user', targetId: number): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'send_message',
      target_type: targetType,
      target_id: targetId,
    });
  }

  /**
   * Track user rating
   */
  async trackUserRating(userId: number, rating: number): Promise<void> {
    await this.trackInteraction({
      interaction_type: 'rate_user',
      target_type: 'user',
      target_id: userId,
      metadata: { rating },
    });
  }

  /**
   * Submit positive recommendation feedback
   */
  async markRecommendationHelpful(type: RecommendationType, targetId: number): Promise<void> {
    await this.submitFeedback({
      recommendation_type: type,
      target_id: targetId,
      was_helpful: true,
      was_clicked: true,
      was_converted: false,
    });
  }

  /**
   * Submit recommendation click feedback
   */
  async markRecommendationClicked(type: RecommendationType, targetId: number): Promise<void> {
    await this.submitFeedback({
      recommendation_type: type,
      target_id: targetId,
      was_helpful: false,
      was_clicked: true,
      was_converted: false,
    });
  }

  /**
   * Submit recommendation conversion feedback (user took action)
   */
  async markRecommendationConverted(type: RecommendationType, targetId: number): Promise<void> {
    await this.submitFeedback({
      recommendation_type: type,
      target_id: targetId,
      was_helpful: true,
      was_clicked: true,
      was_converted: true,
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
export const recommendationsApiService = new RecommendationsApiService(defaultConfig);

// Export class for testing or custom instances
export { RecommendationsApiService };
