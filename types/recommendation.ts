// Phase 6: AI & Recommendations - Type Definitions

// Enums
export enum RecommendationType {
  RIDE = 'ride',
  TRIBE = 'tribe',
  USER = 'user',
  ROUTE = 'route',
}

export enum InteractionType {
  VIEW_RIDE = 'view_ride',
  SEARCH_RIDE = 'search_ride',
  JOIN_RIDE = 'join_ride',
  COMPLETE_RIDE = 'complete_ride',
  CANCEL_RIDE = 'cancel_ride',
  VIEW_PROFILE = 'view_profile',
  SEARCH_LOCATION = 'search_location',
  SAVE_LOCATION = 'save_location',
  JOIN_TRIBE = 'join_tribe',
  SEND_MESSAGE = 'send_message',
  RATE_USER = 'rate_user',
}

export enum PreferenceCategory {
  ROUTE = 'route',
  TIME = 'time',
  SOCIAL = 'social',
  COST = 'cost',
  COMFORT = 'comfort',
}

// Score Breakdowns
export interface RecommendationScoreBreakdown {
  route_score: number;
  time_score: number;
  preference_score: number;
  social_score: number;
  cost_score: number;
  overall_score: number;
}

export interface TribeRecommendationScoreBreakdown {
  route_match_score: number;
  member_compatibility_score: number;
  activity_level_score: number;
  size_preference_score: number;
  overall_score: number;
}

// Location Frequency
export interface LocationFrequency {
  latitude: number;
  longitude: number;
  address: string;
  count: number;
}

// Ride Recommendations
export interface RideRecommendation {
  ride_id: number;
  ride: {
    id: number;
    driver_id: number;
    driver: {
      id: number;
      full_name: string;
      avatar_url: string | null;
      average_rating: number | null;
    };
    start_location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    end_location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    departure_time: string;
    available_seats: number;
    price_per_seat: number;
    preferences: Record<string, any>;
  };
  score_breakdown: RecommendationScoreBreakdown;
  reasons: string[];
  confidence_level: number;
}

// Tribe Recommendations
export interface TribeRecommendation {
  tribe_id: number;
  tribe: {
    id: number;
    name: string;
    description: string | null;
    start_location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    end_location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    member_count: number;
    message_count: number;
    is_public: boolean;
    avatar_url: string | null;
  };
  score_breakdown: TribeRecommendationScoreBreakdown;
  reasons: string[];
  confidence_level: number;
}

// User Recommendations
export interface UserRecommendation {
  user_id: number;
  user: {
    id: number;
    full_name: string;
    avatar_url: string | null;
    average_rating: number | null;
    completed_rides_count: number;
  };
  similarity_score: number;
  common_tribes_count: number;
  common_routes_count: number;
  reasons: string[];
  confidence_level: number;
}

// Route Recommendations
export interface RouteRecommendation {
  route_id: number;
  start_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  end_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  popularity_score: number;
  demand_level: string;
  average_cost: number;
  estimated_time_minutes: number;
  frequent_departure_hours: number[];
  active_tribes_count: number;
  reasons: string[];
}

// Comprehensive Recommendations Response
export interface RecommendationsResponse {
  rides?: RideRecommendation[];
  tribes?: TribeRecommendation[];
  users?: UserRecommendation[];
  routes?: RouteRecommendation[];
  generated_at: string;
  personalization_confidence: number;
}

// Behavior Pattern
export interface BehaviorPattern {
  user_id: number;
  route_preferences: {
    frequent_start_locations: LocationFrequency[];
    frequent_end_locations: LocationFrequency[];
    preferred_routes: Array<{
      start_location: LocationFrequency;
      end_location: LocationFrequency;
      frequency: number;
    }>;
  };
  time_preferences: {
    preferred_hours: number[];
    preferred_days_of_week: number[];
    average_booking_advance_hours: number;
  };
  social_preferences: {
    prefers_tribes: boolean;
    preferred_tribe_sizes: string[];
    interaction_frequency: number;
  };
  cost_preferences: {
    average_price_tolerance: number;
    cost_sensitivity_score: number;
  };
  ride_behavior: {
    completion_rate: number;
    cancellation_rate: number;
    average_punctuality_minutes: number;
  };
  preference_priorities: {
    comfort_priority: number;
    social_priority: number;
    cost_priority: number;
  };
  last_updated: string;
}

// User Analytics
export interface UserAnalytics {
  total_interactions: number;
  ride_interactions: number;
  tribe_interactions: number;
  location_searches: number;
  profile_views: number;
  behavior_pattern: BehaviorPattern | null;
  top_routes: Array<{
    start_location: LocationFrequency;
    end_location: LocationFrequency;
    ride_count: number;
  }>;
  active_days: number[];
  peak_hours: number[];
  recommendation_stats: {
    total_recommendations_shown: number;
    total_recommendations_clicked: number;
    click_through_rate: number;
  };
}

// Smart Route Request/Response
export interface SmartRouteRequest {
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  departure_time?: string;
}

export interface SmartRouteResponse {
  route_popularity: number;
  demand_level: string;
  estimated_cost_range: {
    min: number;
    max: number;
    average: number;
  };
  optimal_departure_times: string[];
  active_tribes: Array<{
    id: number;
    name: string;
    member_count: number;
  }>;
  similar_users_count: number;
  recommendations: string[];
}

// Interaction Tracking
export interface CreateInteractionInput {
  interaction_type: InteractionType;
  target_type?: string;
  target_id?: number;
  search_query?: Record<string, any>;
  location_data?: {
    latitude: number;
    longitude: number;
  };
  metadata?: Record<string, any>;
  session_id?: string;
}

export interface InteractionResponse {
  id: number;
  user_id: number;
  interaction_type: InteractionType;
  target_type: string | null;
  target_id: number | null;
  interaction_time: string;
}

// Recommendation Feedback
export interface RecommendationFeedback {
  recommendation_type: RecommendationType;
  target_id: number;
  was_helpful: boolean;
  was_clicked: boolean;
  was_converted: boolean;
  feedback_notes?: string;
}

// Request DTOs
export interface GetRecommendationsRequest {
  recommendation_types: RecommendationType[];
  limit?: number;
  include_reasons?: boolean;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  destination?: {
    latitude: number;
    longitude: number;
  };
  departure_time?: string;
}

// UI State
export interface RecommendationFilters {
  types: RecommendationType[];
  includeReasons: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  destination: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface RecommendationState {
  recommendations: RecommendationsResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}
