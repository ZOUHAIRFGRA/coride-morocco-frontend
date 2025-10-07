// Route Management API for CoRide Morocco Phase 3
// Implements all 5 Route Management endpoints from the Phase 3 API documentation

import { BaseApiService, ApiResponse, defaultApiConfig } from './BaseApiService';
import { authService } from './auth';
import type {
  RouteMatchRequest,
  RouteMatchResponse,
  RouteOptimizationRequest,
  RouteOptimizationResponse,
  RouteAnalysisRequest,
  RouteAnalysisResponse,
  NearbyRoutesResponse,
  PopularRoutesResponse,
  RouteServiceParams
} from '../types/geospatial';

class RouteApiService extends BaseApiService {
  constructor() {
    super(defaultApiConfig);
  }

  // Override getAccessToken to use authService's token storage
  protected async getAccessToken(): Promise<string | null> {
    return await authService.getStoredAccessToken();
  }

  // Override getRefreshToken to use authService's token storage  
  protected async getRefreshToken(): Promise<string | null> {
    return await authService.getStoredRefreshToken();
  }

  // Override refreshTokens to use authService's authentication check which handles refresh
  protected async refreshTokens(): Promise<boolean> {
    return await authService.isAuthenticated();
  }

  /**
   * 7. Find Matching Routes
   * POST /api/routes/match
   * Find routes that match passenger requirements using intelligent algorithms
   */
  async findMatchingRoutes(request: RouteMatchRequest): Promise<ApiResponse<RouteMatchResponse>> {
    // Validate required fields
    const validationError = this.validateRouteMatchRequest(request);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Ensure departure time is in the future
    const departureTime = new Date(request.departure_time);
    if (departureTime <= new Date()) {
      return {
        success: false,
        error: {
          message: 'Departure time must be in the future',
          code: 'INVALID_DEPARTURE_TIME'
        }
      };
    }

    // Set defaults for optional fields
    const requestData = {
      start_latitude: request.start_latitude,
      start_longitude: request.start_longitude,
      end_latitude: request.end_latitude,
      end_longitude: request.end_longitude,
      departure_time: request.departure_time,
      time_flexibility_minutes: Math.min(Math.max(request.time_flexibility_minutes || 30, 0), 180),
      max_detour_km: Math.min(Math.max(request.max_detour_km || 5.0, 0.5), 20),
      max_pickup_distance_km: Math.min(Math.max(request.max_pickup_distance_km || 3.0, 0.1), 10),
      max_dropoff_distance_km: Math.min(Math.max(request.max_dropoff_distance_km || 3.0, 0.1), 10),
      required_seats: Math.min(Math.max(request.required_seats || 1, 1), 4),
      preferences: request.preferences || {}
    };

    return this.post<RouteMatchResponse>('/routes/match', requestData);
  }

  /**
   * 8. Optimize Multi-Passenger Route
   * POST /api/routes/optimize
   * Optimize pickup/dropoff order for multiple passengers
   */
  async optimizeRoute(request: RouteOptimizationRequest): Promise<ApiResponse<RouteOptimizationResponse>> {
    // Validate required fields
    const validationError = this.validateRouteOptimizationRequest(request);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Set defaults
    const requestData = {
      driver_start_latitude: request.driver_start_latitude,
      driver_start_longitude: request.driver_start_longitude,
      driver_end_latitude: request.driver_end_latitude,
      driver_end_longitude: request.driver_end_longitude,
      passengers: request.passengers,
      max_detour_km: Math.min(Math.max(request.max_detour_km || 10.0, 0.5), 50)
    };

    return this.post<RouteOptimizationResponse>('/routes/optimize', requestData);
  }

  /**
   * 9. Route Analysis
   * POST /api/routes/analyze
   * Analyze routes for similarity, coverage, and demand patterns
   */
  async analyzeRoute(request: RouteAnalysisRequest): Promise<ApiResponse<RouteAnalysisResponse>> {
    // Validate required fields
    const validationError = this.validateRouteAnalysisRequest(request);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    const requestData = {
      start_latitude: request.start_latitude,
      start_longitude: request.start_longitude,
      end_latitude: request.end_latitude,
      end_longitude: request.end_longitude,
      analysis_type: request.analysis_type,
      radius_km: Math.min(Math.max(request.radius_km || 10.0, 1), 50)
    };

    return this.post<RouteAnalysisResponse>('/routes/analyze', requestData);
  }

  /**
   * 10. Nearby Routes
   * GET /api/routes/nearby
   * Find routes near a specific location
   */
  async getNearbyRoutes(
    latitude: number,
    longitude: number,
    options: {
      radius_km?: number;
      departure_date?: string;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<NearbyRoutesResponse>> {
    // Validate coordinates
    if (!this.isValidCoordinate(latitude, longitude)) {
      return {
        success: false,
        error: {
          message: 'Invalid coordinates provided',
          code: 'INVALID_COORDINATES'
        }
      };
    }

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString()
    });

    if (options.radius_km !== undefined) {
      params.append('radius_km', Math.min(Math.max(options.radius_km, 1), 50).toString());
    }

    if (options.departure_date) {
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(options.departure_date)) {
        return {
          success: false,
          error: {
            message: 'Departure date must be in YYYY-MM-DD format',
            code: 'INVALID_DATE_FORMAT'
          }
        };
      }
      params.append('departure_date', options.departure_date);
    }

    if (options.limit !== undefined) {
      params.append('limit', Math.min(Math.max(options.limit, 1), 100).toString());
    }

    return this.get<NearbyRoutesResponse>(`/routes/nearby?${params.toString()}`);
  }

  /**
   * 11. Popular Routes
   * GET /api/routes/popular
   * Get most popular routes based on historical data
   */
  async getPopularRoutes(
    options: {
      limit?: number;
      time_period_days?: number;
    } = {}
  ): Promise<ApiResponse<PopularRoutesResponse>> {
    const params = new URLSearchParams();

    if (options.limit !== undefined) {
      params.append('limit', Math.min(Math.max(options.limit, 1), 50).toString());
    }

    if (options.time_period_days !== undefined) {
      params.append('time_period_days', Math.min(Math.max(options.time_period_days, 1), 365).toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/routes/popular?${queryString}` : '/routes/popular';

    return this.get<PopularRoutesResponse>(url);
  }

  // ============== Validation Methods ==============

  /**
   * Validate route match request
   */
  private validateRouteMatchRequest(request: RouteMatchRequest): { message: string; code: string } | null {
    if (!this.isValidCoordinate(request.start_latitude, request.start_longitude)) {
      return { message: 'Invalid start coordinates', code: 'INVALID_START_COORDINATES' };
    }

    if (!this.isValidCoordinate(request.end_latitude, request.end_longitude)) {
      return { message: 'Invalid end coordinates', code: 'INVALID_END_COORDINATES' };
    }

    if (!request.departure_time) {
      return { message: 'Departure time is required', code: 'MISSING_DEPARTURE_TIME' };
    }

    // Validate ISO date format
    if (isNaN(new Date(request.departure_time).getTime())) {
      return { message: 'Invalid departure time format (use ISO format)', code: 'INVALID_DATE_FORMAT' };
    }

    return null;
  }

  /**
   * Validate route optimization request
   */
  private validateRouteOptimizationRequest(request: RouteOptimizationRequest): { message: string; code: string } | null {
    if (!this.isValidCoordinate(request.driver_start_latitude, request.driver_start_longitude)) {
      return { message: 'Invalid driver start coordinates', code: 'INVALID_DRIVER_START_COORDINATES' };
    }

    if (!this.isValidCoordinate(request.driver_end_latitude, request.driver_end_longitude)) {
      return { message: 'Invalid driver end coordinates', code: 'INVALID_DRIVER_END_COORDINATES' };
    }

    if (!request.passengers || request.passengers.length === 0) {
      return { message: 'At least one passenger is required', code: 'NO_PASSENGERS' };
    }

    if (request.passengers.length > 4) {
      return { message: 'Maximum 4 passengers allowed', code: 'TOO_MANY_PASSENGERS' };
    }

    // Validate passenger coordinates
    for (let i = 0; i < request.passengers.length; i++) {
      const passenger = request.passengers[i];
      if (!this.isValidCoordinate(passenger.pickup_lat, passenger.pickup_lng)) {
        return { 
          message: `Invalid pickup coordinates for passenger ${i + 1}`, 
          code: 'INVALID_PASSENGER_PICKUP_COORDINATES' 
        };
      }
      if (!this.isValidCoordinate(passenger.dropoff_lat, passenger.dropoff_lng)) {
        return { 
          message: `Invalid dropoff coordinates for passenger ${i + 1}`, 
          code: 'INVALID_PASSENGER_DROPOFF_COORDINATES' 
        };
      }
    }

    return null;
  }

  /**
   * Validate route analysis request
   */
  private validateRouteAnalysisRequest(request: RouteAnalysisRequest): { message: string; code: string } | null {
    if (!this.isValidCoordinate(request.start_latitude, request.start_longitude)) {
      return { message: 'Invalid start coordinates', code: 'INVALID_START_COORDINATES' };
    }

    if (!this.isValidCoordinate(request.end_latitude, request.end_longitude)) {
      return { message: 'Invalid end coordinates', code: 'INVALID_END_COORDINATES' };
    }

    if (!['similarity', 'coverage', 'demand'].includes(request.analysis_type)) {
      return { 
        message: 'Analysis type must be one of: similarity, coverage, demand', 
        code: 'INVALID_ANALYSIS_TYPE' 
      };
    }

    return null;
  }

  // ============== Utility Methods ==============

  /**
   * Basic coordinate validation
   */
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) && !isNaN(longitude)
    );
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate bearing between two points
   */
  calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = this.toRadians(lon2 - lon1);
    const lat1Rad = this.toRadians(lat1);
    const lat2Rad = this.toRadians(lat2);
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    const bearing = Math.atan2(y, x);
    return (bearing * 180 / Math.PI + 360) % 360; // Convert to degrees and normalize
  }

  /**
   * Check if coordinates are within Morocco bounds
   */
  isInMorocco(latitude: number, longitude: number): boolean {
    return (
      latitude >= 21.0 && latitude <= 36.0 && // Morocco latitude bounds
      longitude >= -17.0 && longitude <= -1.0  // Morocco longitude bounds
    );
  }

  /**
   * Estimate travel time based on distance (simple calculation)
   */
  estimateTravelTime(distanceKm: number, averageSpeedKmh: number = 60): number {
    return Math.round((distanceKm / averageSpeedKmh) * 60); // Return minutes
  }

  /**
   * Format route for display
   */
  formatRoute(
    startLat: number, startLng: number, 
    endLat: number, endLng: number
  ): string {
    return `${startLat.toFixed(4)}, ${startLng.toFixed(4)} → ${endLat.toFixed(4)}, ${endLng.toFixed(4)}`;
  }

  /**
   * Calculate route efficiency score
   */
  calculateRouteEfficiency(
    directDistance: number,
    actualDistance: number,
    passengerCount: number = 1
  ): number {
    if (actualDistance === 0 || directDistance === 0) return 0;
    
    const distanceEfficiency = directDistance / actualDistance;
    const passengerBonus = Math.min(passengerCount / 4, 1); // Up to 4 passengers
    
    return Math.min(distanceEfficiency * (1 + passengerBonus * 0.2), 1);
  }

  /**
   * Generate route waypoints for display
   */
  generateRouteWaypoints(
    startLat: number, startLng: number,
    endLat: number, endLng: number,
    waypoints: number = 5
  ): Array<{latitude: number; longitude: number}> {
    const points: Array<{latitude: number; longitude: number}> = [];
    
    for (let i = 0; i <= waypoints; i++) {
      const ratio = i / waypoints;
      const lat = startLat + (endLat - startLat) * ratio;
      const lng = startLng + (endLng - startLng) * ratio;
      
      points.push({ latitude: lat, longitude: lng });
    }
    
    return points;
  }
}

export const routeApiService = new RouteApiService();
export default routeApiService;