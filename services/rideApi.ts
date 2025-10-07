// Ride Management API Service for CoRide Morocco Phase 4
// Implements all ride management endpoints from the Phase 4 API documentation

import { BaseApiService, ApiResponse, defaultApiConfig } from './BaseApiService';
import { authService } from './auth';
import type {
  Ride,
  CreateRideOfferRequest,
  CreateRideRequestRequest,
  SearchRidesRequest,
  JoinRideRequest,
  JoinRideResponse,
  UpdateRideStatusRequest,
  UpdateRideStatusResponse,
  CancelRideResponse,
  RideHealthResponse,
  RideQueryParams,
  RideStatus
} from '../types/ride';

class RideApiService extends BaseApiService {
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
   * 1. Create Ride Offer
   * POST /api/rides/offers
   * Create a new ride offer as a driver
   */
  async createRideOffer(offerData: CreateRideOfferRequest): Promise<ApiResponse<Ride>> {
    // Validate required fields
    const validationError = this.validateRideOfferData(offerData);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Ensure departure time is in the future
    const departureTime = new Date(offerData.departure_time);
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
      start_address: offerData.start_address,
      end_address: offerData.end_address,
      start_latitude: offerData.start_latitude,
      start_longitude: offerData.start_longitude,
      end_latitude: offerData.end_latitude,
      end_longitude: offerData.end_longitude,
      departure_time: offerData.departure_time,
      available_seats: Math.min(Math.max(offerData.available_seats, 1), 8),
      estimated_cost: Math.max(offerData.estimated_cost, 0),
      cost_per_person: Math.max(offerData.cost_per_person, 0),
      is_recurring: offerData.is_recurring || false,
      smoking_allowed: offerData.smoking_allowed || false,
      pets_allowed: offerData.pets_allowed || false,
      music_preferences: offerData.music_preferences || null,
      notes: offerData.notes || null,
      vehicle_info: offerData.vehicle_info || null
    };

    return this.post<Ride>('/rides/offers', requestData);
  }

  /**
   * 2. Create Ride Request
   * POST /api/rides/requests
   * Create a new ride request as a rider
   */
  async createRideRequest(requestData: CreateRideRequestRequest): Promise<ApiResponse<Ride>> {
    // Validate required fields
    const validationError = this.validateRideRequestData(requestData);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Ensure departure time is in the future
    const departureTime = new Date(requestData.departure_time);
    if (departureTime <= new Date()) {
      return {
        success: false,
        error: {
          message: 'Departure time must be in the future',
          code: 'INVALID_DEPARTURE_TIME'
        }
      };
    }

    const formattedData = {
      start_address: requestData.start_address,
      end_address: requestData.end_address,
      start_latitude: requestData.start_latitude,
      start_longitude: requestData.start_longitude,
      end_latitude: requestData.end_latitude,
      end_longitude: requestData.end_longitude,
      departure_time: requestData.departure_time,
      flexible_time_minutes: Math.min(Math.max(requestData.flexible_time_minutes || 30, 0), 180),
      max_cost_per_person: Math.max(requestData.max_cost_per_person, 0),
      notes: requestData.notes || null
    };

    return this.post<Ride>('/rides/requests', formattedData);
  }

  /**
   * 3. Search Available Rides
   * POST /api/rides/search
   * Search for available ride offers matching criteria
   */
  async searchRides(searchParams: SearchRidesRequest): Promise<ApiResponse<Ride[]>> {
    // Validate required fields
    const validationError = this.validateSearchParams(searchParams);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(searchParams.departure_date)) {
      return {
        success: false,
        error: {
          message: 'Departure date must be in YYYY-MM-DD format',
          code: 'INVALID_DATE_FORMAT'
        }
      };
    }

    const requestData = {
      start_latitude: searchParams.start_latitude,
      start_longitude: searchParams.start_longitude,
      end_latitude: searchParams.end_latitude,
      end_longitude: searchParams.end_longitude,
      departure_date: searchParams.departure_date,
      departure_time_from: searchParams.departure_time_from,
      departure_time_to: searchParams.departure_time_to,
      max_distance_km: searchParams.max_distance_km ? Math.min(Math.max(searchParams.max_distance_km, 0.1), 100) : undefined,
      max_cost_per_person: searchParams.max_cost_per_person ? Math.max(searchParams.max_cost_per_person, 0) : undefined,
      available_seats_min: searchParams.available_seats_min ? Math.min(Math.max(searchParams.available_seats_min, 1), 8) : undefined,
      smoking_allowed: searchParams.smoking_allowed,
      pets_allowed: searchParams.pets_allowed,
      sort_by: searchParams.sort_by || 'departure_time',
      limit: searchParams.limit ? Math.min(Math.max(searchParams.limit, 1), 100) : 10
    };

    return this.post<Ride[]>('/rides/search', requestData);
  }

  /**
   * 4. Join a Ride
   * POST /api/rides/{ride_id}/join
   * Request to join an available ride
   */
  async joinRide(rideId: number, joinData: JoinRideRequest = {}): Promise<ApiResponse<JoinRideResponse>> {
    if (!rideId || rideId <= 0) {
      return {
        success: false,
        error: {
          message: 'Valid ride ID is required',
          code: 'INVALID_RIDE_ID'
        }
      };
    }

    const requestData = {
      message: joinData.message || '',
      pickup_address: joinData.pickup_address,
      pickup_latitude: joinData.pickup_latitude,
      pickup_longitude: joinData.pickup_longitude,
      dropoff_address: joinData.dropoff_address,
      dropoff_latitude: joinData.dropoff_latitude,
      dropoff_longitude: joinData.dropoff_longitude
    };

    return this.post<JoinRideResponse>(`/rides/${rideId}/join`, requestData);
  }

  /**
   * 5. Get My Ride Offers
   * GET /api/rides/my-offers
   * Get current user's ride offers
   */
  async getMyRideOffers(params: RideQueryParams = {}): Promise<ApiResponse<Ride[]>> {
    const queryParams = new URLSearchParams();

    if (params.status_filter) {
      queryParams.append('status_filter', params.status_filter);
    }

    if (params.limit !== undefined) {
      queryParams.append('limit', Math.min(Math.max(params.limit, 1), 100).toString());
    }

    if (params.offset !== undefined) {
      queryParams.append('offset', Math.max(params.offset, 0).toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/rides/my-offers?${queryString}` : '/rides/my-offers';

    return this.get<Ride[]>(url);
  }

  /**
   * 6. Get My Ride Requests
   * GET /api/rides/my-requests
   * Get current user's ride requests and joined rides
   */
  async getMyRideRequests(params: RideQueryParams = {}): Promise<ApiResponse<Ride[]>> {
    const queryParams = new URLSearchParams();

    if (params.status_filter) {
      queryParams.append('status_filter', params.status_filter);
    }

    if (params.limit !== undefined) {
      queryParams.append('limit', Math.min(Math.max(params.limit, 1), 100).toString());
    }

    if (params.offset !== undefined) {
      queryParams.append('offset', Math.max(params.offset, 0).toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/rides/my-requests?${queryString}` : '/rides/my-requests';

    return this.get<Ride[]>(url);
  }

  /**
   * 7. Get Ride Details
   * GET /api/rides/{ride_id}
   * Get detailed information about a specific ride
   */
  async getRideDetails(rideId: number): Promise<ApiResponse<Ride>> {
    if (!rideId || rideId <= 0) {
      return {
        success: false,
        error: {
          message: 'Valid ride ID is required',
          code: 'INVALID_RIDE_ID'
        }
      };
    }

    return this.get<Ride>(`/rides/${rideId}`);
  }

  /**
   * 8. Update Ride Status
   * PUT /api/rides/{ride_id}/status
   * Update ride status (driver or rider only)
   */
  async updateRideStatus(
    rideId: number, 
    statusData: UpdateRideStatusRequest
  ): Promise<ApiResponse<UpdateRideStatusResponse>> {
    if (!rideId || rideId <= 0) {
      return {
        success: false,
        error: {
          message: 'Valid ride ID is required',
          code: 'INVALID_RIDE_ID'
        }
      };
    }

    // Validate status
    const validStatuses: RideStatus[] = ['offered', 'requested', 'matched', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(statusData.new_status)) {
      return {
        success: false,
        error: {
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS'
        }
      };
    }

    return this.put<UpdateRideStatusResponse>(`/rides/${rideId}/status`, statusData);
  }

  /**
   * 9. Cancel Ride
   * DELETE /api/rides/{ride_id}
   * Cancel a ride (driver only)
   */
  async cancelRide(rideId: number): Promise<ApiResponse<CancelRideResponse>> {
    if (!rideId || rideId <= 0) {
      return {
        success: false,
        error: {
          message: 'Valid ride ID is required',
          code: 'INVALID_RIDE_ID'
        }
      };
    }

    return this.delete<CancelRideResponse>(`/rides/${rideId}`);
  }

  /**
   * 10. Health Check
   * GET /api/rides/health
   * Health check for ride management service
   */
  async healthCheck(): Promise<ApiResponse<RideHealthResponse>> {
    return this.get<RideHealthResponse>('/rides/health');
  }

  // ============== Validation Methods ==============

  /**
   * Validate ride offer data
   */
  private validateRideOfferData(data: CreateRideOfferRequest): { message: string; code: string } | null {
    if (!data.start_address || data.start_address.trim().length === 0) {
      return { message: 'Start address is required', code: 'MISSING_START_ADDRESS' };
    }

    if (!data.end_address || data.end_address.trim().length === 0) {
      return { message: 'End address is required', code: 'MISSING_END_ADDRESS' };
    }

    if (!this.isValidCoordinate(data.start_latitude, data.start_longitude)) {
      return { message: 'Invalid start coordinates', code: 'INVALID_START_COORDINATES' };
    }

    if (!this.isValidCoordinate(data.end_latitude, data.end_longitude)) {
      return { message: 'Invalid end coordinates', code: 'INVALID_END_COORDINATES' };
    }

    if (!data.departure_time) {
      return { message: 'Departure time is required', code: 'MISSING_DEPARTURE_TIME' };
    }

    if (isNaN(new Date(data.departure_time).getTime())) {
      return { message: 'Invalid departure time format (use ISO format)', code: 'INVALID_DATE_FORMAT' };
    }

    if (!data.available_seats || data.available_seats < 1 || data.available_seats > 8) {
      return { message: 'Available seats must be between 1 and 8', code: 'INVALID_AVAILABLE_SEATS' };
    }

    if (data.estimated_cost < 0) {
      return { message: 'Estimated cost cannot be negative', code: 'INVALID_ESTIMATED_COST' };
    }

    if (data.cost_per_person < 0) {
      return { message: 'Cost per person cannot be negative', code: 'INVALID_COST_PER_PERSON' };
    }

    return null;
  }

  /**
   * Validate ride request data
   */
  private validateRideRequestData(data: CreateRideRequestRequest): { message: string; code: string } | null {
    if (!data.start_address || data.start_address.trim().length === 0) {
      return { message: 'Start address is required', code: 'MISSING_START_ADDRESS' };
    }

    if (!data.end_address || data.end_address.trim().length === 0) {
      return { message: 'End address is required', code: 'MISSING_END_ADDRESS' };
    }

    if (!this.isValidCoordinate(data.start_latitude, data.start_longitude)) {
      return { message: 'Invalid start coordinates', code: 'INVALID_START_COORDINATES' };
    }

    if (!this.isValidCoordinate(data.end_latitude, data.end_longitude)) {
      return { message: 'Invalid end coordinates', code: 'INVALID_END_COORDINATES' };
    }

    if (!data.departure_time) {
      return { message: 'Departure time is required', code: 'MISSING_DEPARTURE_TIME' };
    }

    if (isNaN(new Date(data.departure_time).getTime())) {
      return { message: 'Invalid departure time format (use ISO format)', code: 'INVALID_DATE_FORMAT' };
    }

    if (data.max_cost_per_person < 0) {
      return { message: 'Max cost per person cannot be negative', code: 'INVALID_MAX_COST' };
    }

    return null;
  }

  /**
   * Validate search parameters
   */
  private validateSearchParams(params: SearchRidesRequest): { message: string; code: string } | null {
    if (!this.isValidCoordinate(params.start_latitude, params.start_longitude)) {
      return { message: 'Invalid start coordinates', code: 'INVALID_START_COORDINATES' };
    }

    if (!this.isValidCoordinate(params.end_latitude, params.end_longitude)) {
      return { message: 'Invalid end coordinates', code: 'INVALID_END_COORDINATES' };
    }

    if (!params.departure_date) {
      return { message: 'Departure date is required', code: 'MISSING_DEPARTURE_DATE' };
    }

    // Validate time format if provided
    if (params.departure_time_from && !/^\d{2}:\d{2}$/.test(params.departure_time_from)) {
      return { message: 'Departure time from must be in HH:MM format', code: 'INVALID_TIME_FORMAT' };
    }

    if (params.departure_time_to && !/^\d{2}:\d{2}$/.test(params.departure_time_to)) {
      return { message: 'Departure time to must be in HH:MM format', code: 'INVALID_TIME_FORMAT' };
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
   * Check if coordinates are within Morocco bounds
   */
  isInMorocco(latitude: number, longitude: number): boolean {
    return (
      latitude >= 21.0 && latitude <= 36.0 && // Morocco latitude bounds
      longitude >= -17.0 && longitude <= -1.0  // Morocco longitude bounds
    );
  }

  /**
   * Format ride status for display
   */
  formatRideStatus(status: RideStatus): string {
    const statusMap: Record<RideStatus, string> = {
      offered: 'Available',
      requested: 'Requested',
      matched: 'Matched',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: RideStatus): string {
    const colorMap: Record<RideStatus, string> = {
      offered: '#10B981', // green
      requested: '#3B82F6', // blue
      matched: '#F59E0B', // yellow
      in_progress: '#8B5CF6', // purple
      completed: '#06B6D4', // cyan
      cancelled: '#EF4444' // red
    };
    return colorMap[status] || '#6B7280';
  }

  /**
   * Estimate travel time based on distance
   */
  estimateTravelTime(distanceKm: number, averageSpeedKmh: number = 60): number {
    return Math.round((distanceKm / averageSpeedKmh) * 60); // Return minutes
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return `${price.toFixed(0)} MAD`;
  }

  /**
   * Validate ride timing
   */
  isValidDepartureTime(departureTime: string): boolean {
    const date = new Date(departureTime);
    const now = new Date();
    return date > now && !isNaN(date.getTime());
  }
}

export const rideApiService = new RideApiService();
export default rideApiService;