// Geospatial and Route Management types for CoRide Morocco Phase 3
// Based on the Phase 3 API documentation

// ============== Location Services Types ==============

export interface LocationSuggestion {
  display_name: string;
  address: string;
  latitude: number;
  longitude: number;
  relevance_score: number;
  distance_km: number;
  city?: string;
  region?: string;
  country: string;
}

export interface AutocompleteRequest {
  query: string;
  latitude?: number;
  longitude?: number;
  limit?: number;
}

export interface ReverseGeocodeResponse {
  address: string;
  formatted_address: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country: string;
  latitude: number;
  longitude: number;
  accuracy: 'exact' | 'approximate' | 'city' | 'region';
}

export interface LocationHistoryItem {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  search_count: number;
  last_searched: string;
  is_frequent: boolean;
}

export interface NearbyPlace {
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  address: string;
  rating?: number;
}

export interface RouteInfo {
  distance_km: number;
  estimated_duration_minutes: number;
  optimal_route: Array<{lat: number; lng: number}>;
  nearby_rides: NearbyRide[];
  traffic_conditions: 'light' | 'moderate' | 'heavy';
}

export interface NearbyRide {
  id: number;
  driver_id: number;
  start_location: {latitude: number; longitude: number};
  end_location: {latitude: number; longitude: number};
  departure_time: string;
  available_seats: number;
  cost_per_seat: number;
}

export interface CoordinateValidationResponse {
  is_valid: boolean;
  latitude: number;
  longitude: number;
  formatted: string;
  nearest_city?: string;
  distance_to_city_km?: number;
  region?: string;
}

// ============== Route Management Types ==============

export interface RouteMatchRequest {
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  departure_time: string;
  time_flexibility_minutes?: number;
  max_detour_km?: number;
  max_pickup_distance_km?: number;
  max_dropoff_distance_km?: number;
  required_seats?: number;
  preferences?: {
    smoking_allowed?: boolean;
    pets_allowed?: boolean;
    music_preference?: string;
    conversation_preference?: string;
  };
}

export interface RouteMatch {
  ride_id: number;
  driver_id: number;
  driver_name: string;
  similarity_score: number;
  pickup_point: {latitude: number; longitude: number};
  dropoff_point: {latitude: number; longitude: number};
  pickup_distance_km: number;
  dropoff_distance_km: number;
  detour_distance_km: number;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  cost_per_seat: number;
  driver_rating: number;
  compatibility_score: number;
  route_efficiency: number;
}

export interface RouteMatchResponse {
  matches: RouteMatch[];
  total_matches: number;
  search_parameters: {
    start_location: string;
    end_location: string;
    departure_time: string;
    time_flexibility_minutes: number;
    max_detour_km: number;
    required_seats: number;
  };
  execution_time_ms: number;
}

export interface PassengerOptimization {
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
}

export interface RouteOptimizationRequest {
  driver_start_latitude: number;
  driver_start_longitude: number;
  driver_end_latitude: number;
  driver_end_longitude: number;
  passengers: PassengerOptimization[];
  max_detour_km?: number;
}

export interface OptimizedPassenger {
  passenger_id: number;
  pickup_location: {latitude: number; longitude: number};
  dropoff_location: {latitude: number; longitude: number};
  pickup_order: number;
  dropoff_order: number;
}

export interface RouteOptimizationResponse {
  optimized_route: Array<{latitude: number; longitude: number}>;
  total_distance_km: number;
  estimated_duration_minutes: number;
  detour_distance_km: number;
  passenger_order: OptimizedPassenger[];
  efficiency_score: number;
}

export interface RouteAnalysisRequest {
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  analysis_type: 'similarity' | 'coverage' | 'demand';
  radius_km?: number;
}

export interface RouteAnalysisResponse {
  analysis_type: string;
  route_distance_km: number;
  similar_routes_count?: number;
  coverage_analysis?: {
    route_distance_km: number;
    start_city: string;
    end_city: string;
    crosses_regions: boolean;
    popular_corridor: boolean;
  };
  demand_analysis?: any;
  recommendations: string[];
}

export interface NearbyRoute {
  ride_id: number;
  driver_id: number;
  start_location: {latitude: number; longitude: number};
  end_location: {latitude: number; longitude: number};
  departure_time: string;
  available_seats: number;
  cost_per_seat: number;
  distance_to_start_km: number;
  distance_to_end_km: number;
  route_distance_km: number;
}

export interface NearbyRoutesResponse {
  routes: NearbyRoute[];
  total_count: number;
  search_center: {latitude: number; longitude: number};
  search_radius_km: number;
  departure_date?: string;
}

export interface PopularRoute {
  start_location: {latitude: number; longitude: number};
  end_location: {latitude: number; longitude: number};
  route_count: number;
  average_cost: number;
  average_advance_booking_hours: number;
  distance_km: number;
  start_city: string;
  end_city: string;
}

export interface PopularRoutesResponse {
  popular_routes: PopularRoute[];
  time_period_days: number;
  analysis_date: string;
}

// ============== Utility Types ==============

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeospatialQueryParams {
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  limit?: number;
  offset?: number;
}

// ============== Error Types ==============

export interface GeospatialError {
  message: string;
  error_code: string;
  type: 'geospatial_error' | 'validation_error' | 'http_error';
  coordinates?: {latitude: number; longitude: number};
  suggestion?: string;
}

// ============== Categories ==============

export enum PlaceCategory {
  TRANSPORT = 'transport',
  EDUCATION = 'education',
  SHOPPING = 'shopping',
  RELIGIOUS = 'religious',
  HEALTHCARE = 'healthcare',
  ENTERTAINMENT = 'entertainment',
  GOVERNMENT = 'government'
}

// ============== Morocco Specific ==============

export interface MoroccanCity {
  name: string;
  name_ar?: string;
  name_fr?: string;
  latitude: number;
  longitude: number;
  region: string;
  is_major: boolean;
}

export interface MoroccanLandmark {
  name: string;
  name_ar?: string;
  name_fr?: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  city: string;
  description?: string;
}

// ============== Request/Response Wrapper Types ==============

export interface LocationServiceParams extends GeospatialQueryParams {
  category?: PlaceCategory;
  departure_date?: string;
  time_period_days?: number;
}

export interface RouteServiceParams {
  departure_date?: string;
  time_period_days?: number;
}