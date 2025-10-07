// Integrated Ride Management Service for CoRide Morocco
// Combines Phase 3 (Geospatial) + Phase 4 (Ride Management) APIs
// Provides unified interface for complete rideshare functionality

import rideApiService from './rideApi';
import { geospatialService } from './geospatialService';
import type { ApiResponse } from './BaseApiService';
import type { 
  Ride,
  CreateRideOfferRequest,
  CreateRideRequestRequest,
  SearchRidesRequest,
  JoinRideRequest,
  JoinRideResponse,
  UpdateRideStatusRequest,
  RideQueryParams,
  RideStatus,
  RideWithGeospatial,
  SmartRideMatch,
  RideCardData
} from '../types/ride';
import type { LocationSuggestion, RouteMatch } from '../types/geospatial';

interface SmartSearchRequest {
  startLocation: LocationSuggestion;
  endLocation: LocationSuggestion;
  departureTime: Date;
  passengerCount?: number;
  maxDistance?: number;
  maxPrice?: number;
  preferences?: {
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
  };
}

interface RideCreationData {
  startLocation: LocationSuggestion;
  endLocation: LocationSuggestion;
  departureTime: Date;
  availableSeats: number;
  costPerPerson: number;
  preferences: {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    musicPreference?: string;
  };
  notes?: string;
  vehicleInfo?: string;
  isRecurring?: boolean;
}

interface RideInsights {
  totalDistance: number;
  estimatedDuration: number;
  trafficConditions: 'light' | 'moderate' | 'heavy';
  alternativeRoutes: number;
  popularityScore: number;
  optimalDepartureTime: string;
  costSuggestion: {
    min: number;
    max: number;
    recommended: number;
  };
}

class IntegratedRideService {
  constructor() {
    // Services are initialized as singletons
  }

  // ============== Smart Ride Creation ==============

  /**
   * Create a ride offer with geospatial optimization
   */
  async createSmartRideOffer(rideData: RideCreationData): Promise<ApiResponse<RideWithGeospatial>> {
    try {
      // Get route insights using Phase 3 geospatial services
      const routeInsights = await this.getRouteInsights(
        rideData.startLocation,
        rideData.endLocation
      );

      // Prepare ride offer data
      const offerRequest: CreateRideOfferRequest = {
        start_address: rideData.startLocation.display_name,
        end_address: rideData.endLocation.display_name,
        start_latitude: rideData.startLocation.latitude,
        start_longitude: rideData.startLocation.longitude,
        end_latitude: rideData.endLocation.latitude,
        end_longitude: rideData.endLocation.longitude,
        departure_time: rideData.departureTime.toISOString(),
        available_seats: rideData.availableSeats,
        estimated_cost: rideData.costPerPerson * rideData.availableSeats,
        cost_per_person: rideData.costPerPerson,
        is_recurring: rideData.isRecurring || false,
        smoking_allowed: rideData.preferences.smokingAllowed,
        pets_allowed: rideData.preferences.petsAllowed,
        music_preferences: rideData.preferences.musicPreference,
        notes: rideData.notes,
        vehicle_info: rideData.vehicleInfo
      };

      // Create the ride offer
      const rideResponse = await rideApiService.createRideOffer(offerRequest);

      if (rideResponse.success && rideResponse.data) {
        // Enhance with geospatial data
        const enhancedRide: RideWithGeospatial = {
          ...rideResponse.data,
          routeInfo: {
            distance: routeInsights.totalDistance,
            estimatedDuration: routeInsights.estimatedDuration,
            optimalRoute: [], // Would be populated by route optimization
            trafficConditions: routeInsights.trafficConditions
          }
        };

        return {
          success: true,
          data: enhancedRide
        };
      }

      return rideResponse as ApiResponse<RideWithGeospatial>;
    } catch (error) {
      console.error('Error creating smart ride offer:', error);
      return {
        success: false,
        error: {
          message: 'Failed to create ride offer',
          code: 'RIDE_CREATION_ERROR'
        }
      };
    }
  }

  /**
   * Create a ride request with intelligent matching
   */
  async createSmartRideRequest(
    startLocation: LocationSuggestion,
    endLocation: LocationSuggestion,
    departureTime: Date,
    maxCostPerPerson: number,
    notes?: string
  ): Promise<ApiResponse<Ride>> {
    const requestData: CreateRideRequestRequest = {
      start_address: startLocation.display_name,
      end_address: endLocation.display_name,
      start_latitude: startLocation.latitude,
      start_longitude: startLocation.longitude,
      end_latitude: endLocation.latitude,
      end_longitude: endLocation.longitude,
      departure_time: departureTime.toISOString(),
      flexible_time_minutes: 30, // 30 minutes flexibility by default
      max_cost_per_person: maxCostPerPerson,
      notes
    };

    return rideApiService.createRideRequest(requestData);
  }

  // ============== Smart Search and Matching ==============

  /**
   * Smart ride search combining Phase 3 geospatial + Phase 4 ride matching
   */
  async smartRideSearch(searchRequest: SmartSearchRequest): Promise<ApiResponse<SmartRideMatch[]>> {
    try {
      // Prepare search parameters
      const searchParams: SearchRidesRequest = {
        start_latitude: searchRequest.startLocation.latitude,
        start_longitude: searchRequest.startLocation.longitude,
        end_latitude: searchRequest.endLocation.latitude,
        end_longitude: searchRequest.endLocation.longitude,
        departure_date: this.formatDateForAPI(searchRequest.departureTime),
        departure_time_from: this.getTimeWindow(searchRequest.departureTime, -60), // 1 hour before
        departure_time_to: this.getTimeWindow(searchRequest.departureTime, 60), // 1 hour after
        max_distance_km: searchRequest.maxDistance || 15,
        max_cost_per_person: searchRequest.maxPrice || 1000,
        available_seats_min: searchRequest.passengerCount || 1,
        smoking_allowed: searchRequest.preferences?.smokingAllowed,
        pets_allowed: searchRequest.preferences?.petsAllowed,
        sort_by: 'departure_time',
        limit: 20
      };

      // Search rides using Phase 4 API
      const searchResponse = await rideApiService.searchRides(searchParams);

      if (!searchResponse.success || !searchResponse.data) {
        return searchResponse as ApiResponse<SmartRideMatch[]>;
      }

      // Enhance rides with geospatial intelligence
      const enhancedRides: SmartRideMatch[] = [];

      for (const ride of searchResponse.data) {
        try {
          // Calculate compatibility scores using Phase 3 geospatial services
          const routeCompatibility = await this.calculateRouteCompatibility(
            searchRequest.startLocation,
            searchRequest.endLocation,
            ride
          );

          const timeCompatibility = this.calculateTimeCompatibility(
            searchRequest.departureTime,
            new Date(ride.departure_time)
          );

          const priceCompatibility = this.calculatePriceCompatibility(
            searchRequest.maxPrice || 1000,
            ride.cost_per_person
          );

          const preferencesMatch = this.calculatePreferencesMatch(
            searchRequest.preferences || {},
            ride
          );

          const distanceFromUser = rideApiService.calculateDistance(
            searchRequest.startLocation.latitude,
            searchRequest.startLocation.longitude,
            ride.start_latitude,
            ride.start_longitude
          );

          // Calculate overall match score
          const matchScore = this.calculateOverallMatchScore({
            routeCompatibility,
            timeCompatibility,
            priceCompatibility,
            preferencesMatch,
            distanceFromUser
          });

          const smartMatch: SmartRideMatch = {
            ...ride,
            matchScore,
            routeCompatibility,
            timeCompatibility,
            priceCompatibility,
            preferencesMatch,
            distanceFromUser
          };

          enhancedRides.push(smartMatch);
        } catch (error) {
          console.error('Error enhancing ride with geospatial data:', error);
          // Still include the ride but with default scores
          const smartMatch: SmartRideMatch = {
            ...ride,
            matchScore: 0.5,
            routeCompatibility: 0.5,
            timeCompatibility: 0.5,
            priceCompatibility: 0.5,
            preferencesMatch: 0.5,
            distanceFromUser: 0
          };
          enhancedRides.push(smartMatch);
        }
      }

      // Sort by match score (highest first)
      enhancedRides.sort((a, b) => b.matchScore - a.matchScore);

      return {
        success: true,
        data: enhancedRides
      };
    } catch (error) {
      console.error('Error in smart ride search:', error);
      return {
        success: false,
        error: {
          message: 'Failed to search rides',
          code: 'SEARCH_ERROR'
        }
      };
    }
  }

  /**
   * Find best matching rides using Phase 3 route matching + Phase 4 search
   */
  async findBestMatches(
    startLocation: LocationSuggestion,
    endLocation: LocationSuggestion,
    departureTime: Date,
    passengerCount: number = 1
  ): Promise<ApiResponse<SmartRideMatch[]>> {
    // Use Phase 3 geospatial route matching for intelligent suggestions
    const routeMatches = await geospatialService.findQuickRoutes({
      startLat: startLocation.latitude,
      startLng: startLocation.longitude,
      endLat: endLocation.latitude,
      endLng: endLocation.longitude,
      departureTime: departureTime.toISOString(),
      passengerCount
    });

    if (routeMatches.success && routeMatches.data && routeMatches.data.matches.length > 0) {
      // Convert RouteMatch to SmartRideMatch
      const smartMatches: SmartRideMatch[] = routeMatches.data.matches.map(match => ({
        id: match.ride_id,
        driver_id: match.driver_id,
        rider_id: null,
        start_address: `${startLocation.city}, Morocco`,
        end_address: `${endLocation.city}, Morocco`,
        start_latitude: match.pickup_point.latitude,
        start_longitude: match.pickup_point.longitude,
        end_latitude: match.dropoff_point.latitude,
        end_longitude: match.dropoff_point.longitude,
        departure_time: match.departure_time,
        arrival_time_estimated: match.arrival_time,
        available_seats: match.available_seats,
        occupied_seats: 0,
        estimated_cost: match.cost_per_seat * match.available_seats,
        cost_per_person: match.cost_per_seat,
        status: 'offered' as RideStatus,
        is_recurring: false,
        smoking_allowed: false,
        pets_allowed: false,
        music_preferences: null,
        notes: null,
        vehicle_info: null,
        created_at: new Date().toISOString(),
        driver: {
          id: match.driver_id,
          first_name: match.driver_name.split(' ')[0] || 'Driver',
          last_name: match.driver_name.split(' ')[1] || '',
          rating_average: match.driver_rating,
          rating_count: 25, // Default value
          profile_photo_url: undefined
        },
        matchScore: match.compatibility_score,
        routeCompatibility: match.similarity_score,
        timeCompatibility: 0.9, // High since it's from route matching
        priceCompatibility: 0.8, // Default good value
        preferencesMatch: 0.7, // Default moderate value
        distanceFromUser: match.pickup_distance_km
      }));

      return {
        success: true,
        data: smartMatches
      };
    }

    // Fallback to regular smart search
    return this.smartRideSearch({
      startLocation,
      endLocation,
      departureTime,
      passengerCount
    });
  }

  // ============== Ride Management ==============

  /**
   * Join a ride with pickup/dropoff optimization
   */
  async joinRideWithOptimization(
    rideId: number,
    passengerLocation: LocationSuggestion,
    destinationLocation: LocationSuggestion,
    message?: string
  ): Promise<ApiResponse<JoinRideResponse>> {
    const joinData: JoinRideRequest = {
      message: message || 'Hi! I would like to join your ride.',
      pickup_address: passengerLocation.display_name,
      pickup_latitude: passengerLocation.latitude,
      pickup_longitude: passengerLocation.longitude,
      dropoff_address: destinationLocation.display_name,
      dropoff_latitude: destinationLocation.latitude,
      dropoff_longitude: destinationLocation.longitude
    };

    return rideApiService.joinRide(rideId, joinData);
  }

  /**
   * Get my rides with enhanced geospatial data
   */
  async getMyRidesEnhanced(type: 'offers' | 'requests' = 'offers'): Promise<ApiResponse<RideWithGeospatial[]>> {
    const ridesResponse = type === 'offers' 
      ? await rideApiService.getMyRideOffers()
      : await rideApiService.getMyRideRequests();

    if (!ridesResponse.success || !ridesResponse.data) {
      return ridesResponse as ApiResponse<RideWithGeospatial[]>;
    }

    // Enhance rides with geospatial data
    const enhancedRides: RideWithGeospatial[] = [];

    for (const ride of ridesResponse.data) {
      try {
        const routeInsights = await geospatialService.getRouteInsights(
          ride.start_latitude,
          ride.start_longitude,
          ride.end_latitude,
          ride.end_longitude
        );

        const enhancedRide: RideWithGeospatial = {
          ...ride,
          routeInfo: {
            distance: routeInsights.distance,
            estimatedDuration: routeInsights.estimatedDuration,
            optimalRoute: [], // Would be populated by route optimization
            trafficConditions: 'moderate' // Default value
          }
        };

        enhancedRides.push(enhancedRide);
      } catch (error) {
        console.error('Error enhancing ride with geospatial data:', error);
        // Still include the ride without enhancement
        enhancedRides.push(ride as RideWithGeospatial);
      }
    }

    return {
      success: true,
      data: enhancedRides
    };
  }

  /**
   * Update ride status with location tracking
   */
  async updateRideStatusWithTracking(
    rideId: number,
    newStatus: RideStatus,
    currentLocation?: { latitude: number; longitude: number }
  ): Promise<ApiResponse<any>> {
    // Update ride status
    const statusResponse = await rideApiService.updateRideStatus(rideId, { new_status: newStatus });

    if (statusResponse.success && currentLocation && newStatus === 'in_progress') {
      // Could integrate with real-time location tracking here
      // For now, we'll just return the status update response
    }

    return statusResponse;
  }

  // ============== Utility and Helper Methods ==============

  /**
   * Get route insights combining geospatial analysis
   */
  async getRouteInsights(
    startLocation: LocationSuggestion,
    endLocation: LocationSuggestion
  ): Promise<RideInsights> {
    try {
      const insights = await geospatialService.getRouteInsights(
        startLocation.latitude,
        startLocation.longitude,
        endLocation.latitude,
        endLocation.longitude
      );

      // Get popular routes for cost suggestions
      const popularRoutes = await geospatialService.getPopularRoutes({ limit: 10 });
      
      let costSuggestion = {
        min: 20,
        max: 200,
        recommended: 50
      };

      if (popularRoutes.success && popularRoutes.data) {
        const avgCost = popularRoutes.data.popular_routes.reduce((sum, route) => sum + route.average_cost, 0) / popularRoutes.data.popular_routes.length;
        costSuggestion = {
          min: Math.max(Math.round(avgCost * 0.7), 20),
          max: Math.round(avgCost * 1.5),
          recommended: Math.round(avgCost)
        };
      }

      return {
        totalDistance: insights.distance,
        estimatedDuration: insights.estimatedDuration,
        trafficConditions: 'moderate', // Default, could be enhanced with real traffic data
        alternativeRoutes: insights.nearbyAlternatives,
        popularityScore: insights.popularityScore,
        optimalDepartureTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        costSuggestion
      };
    } catch (error) {
      console.error('Error getting route insights:', error);
      return {
        totalDistance: 50, // Default values
        estimatedDuration: 60,
        trafficConditions: 'moderate',
        alternativeRoutes: 0,
        popularityScore: 0.5,
        optimalDepartureTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        costSuggestion: {
          min: 20,
          max: 200,
          recommended: 50
        }
      };
    }
  }

  /**
   * Convert ride to card display format
   */
  convertToRideCardData(ride: Ride | SmartRideMatch): RideCardData {
    return {
      id: ride.id,
      driverName: ride.driver ? `${ride.driver.first_name} ${ride.driver.last_name}` : 'Unknown Driver',
      driverRating: ride.driver?.rating_average || 0,
      driverPhoto: ride.driver?.profile_photo_url,
      route: {
        from: ride.start_address,
        to: ride.end_address,
        distance: ride.distance_km || 0
      },
      timing: {
        departure: ride.departure_time,
        arrival: ride.arrival_time_estimated || undefined,
        duration: ride.arrival_time_estimated 
          ? Math.round((new Date(ride.arrival_time_estimated).getTime() - new Date(ride.departure_time).getTime()) / (1000 * 60))
          : undefined
      },
      pricing: {
        costPerSeat: ride.cost_per_person,
        totalCost: ride.estimated_cost
      },
      availability: {
        availableSeats: ride.available_seats,
        occupiedSeats: ride.occupied_seats
      },
      preferences: {
        smokingAllowed: ride.smoking_allowed,
        petsAllowed: ride.pets_allowed,
        musicPreference: ride.music_preferences || undefined
      },
      status: ride.status,
      notes: ride.notes || undefined,
      vehicleInfo: ride.vehicle_info || undefined
    };
  }

  // ============== Private Helper Methods ==============

  private async calculateRouteCompatibility(
    searchStart: LocationSuggestion,
    searchEnd: LocationSuggestion,
    ride: Ride
  ): Promise<number> {
    try {
      // Use geospatial service to calculate route compatibility
      const compatibility = geospatialService.calculateRouteCompatibility(
        {
          startLat: searchStart.latitude,
          startLng: searchStart.longitude,
          endLat: searchEnd.latitude,
          endLng: searchEnd.longitude
        },
        {
          startLat: ride.start_latitude,
          startLng: ride.start_longitude,
          endLat: ride.end_latitude,
          endLng: ride.end_longitude
        }
      );

      return compatibility;
    } catch (error) {
      console.error('Error calculating route compatibility:', error);
      return 0.5; // Default moderate compatibility
    }
  }

  private calculateTimeCompatibility(requestedTime: Date, rideTime: Date): number {
    const timeDiffMinutes = Math.abs(requestedTime.getTime() - rideTime.getTime()) / (1000 * 60);
    
    if (timeDiffMinutes <= 15) return 1.0; // Perfect match
    if (timeDiffMinutes <= 30) return 0.8; // Good match
    if (timeDiffMinutes <= 60) return 0.6; // Acceptable match
    if (timeDiffMinutes <= 120) return 0.4; // Poor match
    return 0.2; // Very poor match
  }

  private calculatePriceCompatibility(maxPrice: number, ridePrice: number): number {
    if (ridePrice <= maxPrice * 0.7) return 1.0; // Great price
    if (ridePrice <= maxPrice * 0.85) return 0.8; // Good price
    if (ridePrice <= maxPrice) return 0.6; // Acceptable price
    if (ridePrice <= maxPrice * 1.15) return 0.4; // Expensive
    return 0.2; // Too expensive
  }

  private calculatePreferencesMatch(searchPrefs: any, ride: Ride): number {
    let score = 1.0;
    let factorsCount = 0;

    if (searchPrefs.smokingAllowed !== undefined) {
      factorsCount++;
      if (searchPrefs.smokingAllowed === ride.smoking_allowed) {
        score *= 1.0;
      } else {
        score *= 0.5;
      }
    }

    if (searchPrefs.petsAllowed !== undefined) {
      factorsCount++;
      if (searchPrefs.petsAllowed === ride.pets_allowed) {
        score *= 1.0;
      } else {
        score *= 0.5;
      }
    }

    return factorsCount > 0 ? score : 0.8; // Default good match if no preferences specified
  }

  private calculateOverallMatchScore(scores: {
    routeCompatibility: number;
    timeCompatibility: number;
    priceCompatibility: number;
    preferencesMatch: number;
    distanceFromUser: number;
  }): number {
    // Weights for different factors
    const weights = {
      route: 0.3,
      time: 0.25,
      price: 0.2,
      preferences: 0.15,
      distance: 0.1
    };

    // Convert distance to score (closer is better)
    const distanceScore = Math.max(0, 1 - (scores.distanceFromUser / 20)); // 20km max distance

    const weightedScore = 
      scores.routeCompatibility * weights.route +
      scores.timeCompatibility * weights.time +
      scores.priceCompatibility * weights.price +
      scores.preferencesMatch * weights.preferences +
      distanceScore * weights.distance;

    return Math.min(Math.max(weightedScore, 0), 1); // Ensure score is between 0 and 1
  }

  private formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private getTimeWindow(date: Date, offsetMinutes: number): string {
    const newDate = new Date(date.getTime() + offsetMinutes * 60 * 1000);
    return newDate.toTimeString().slice(0, 5); // HH:MM format
  }

  // ============== Direct API Access Methods ==============

  /**
   * Direct access to ride API service methods
   */
  get api() {
    return {
      createRideOffer: rideApiService.createRideOffer.bind(rideApiService),
      createRideRequest: rideApiService.createRideRequest.bind(rideApiService),
      searchRides: rideApiService.searchRides.bind(rideApiService),
      joinRide: rideApiService.joinRide.bind(rideApiService),
      getMyRideOffers: rideApiService.getMyRideOffers.bind(rideApiService),
      getMyRideRequests: rideApiService.getMyRideRequests.bind(rideApiService),
      getRideDetails: rideApiService.getRideDetails.bind(rideApiService),
      updateRideStatus: rideApiService.updateRideStatus.bind(rideApiService),
      cancelRide: rideApiService.cancelRide.bind(rideApiService),
      healthCheck: rideApiService.healthCheck.bind(rideApiService)
    };
  }
}

export const integratedRideService = new IntegratedRideService();
export default integratedRideService;