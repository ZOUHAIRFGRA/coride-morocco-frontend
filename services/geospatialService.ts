// Central Geospatial Service for CoRide Morocco Phase 3
// Combines Location Services and Route Management APIs
// Provides unified interface for all geospatial operations

import locationApiService from './locationApi';
import routeApiService from './routeApi';
import type { ApiResponse } from './BaseApiService';
import type { 
  LocationSuggestion,
  RouteMatchRequest,
  RouteMatchResponse,
  RouteOptimizationRequest,
  RouteOptimizationResponse,
  RouteAnalysisRequest,
  RouteAnalysisResponse,
  NearbyRoutesResponse,
  PopularRoutesResponse,
  LocationHistoryItem,
  NearbyPlace,
  RouteInfo,
  ReverseGeocodeResponse
} from '../types/geospatial';

interface QuickRouteRequest {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  departureTime: string;
  passengerCount?: number;
}

interface LocationSearchResult {
  suggestions: LocationSuggestion[];
  searchTime: number;
  fallbackUsed: boolean;
}

interface RouteInsights {
  distance: number;
  estimatedDuration: number;
  efficiency: number;
  popularityScore: number;
  nearbyAlternatives: number;
}

class GeospatialService {
  constructor() {
    // Services are initialized as singletons
  }

  // ============== Location Services ==============

  /**
   * Smart location search with autocomplete and caching
   */
  async searchLocation(
    query: string,
    currentLocation?: { latitude: number; longitude: number },
    limit?: number
  ): Promise<ApiResponse<LocationSuggestion[]>> {
    const result = await this.searchLocations(query, {
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude,
      limit
    });
    
    return {
      success: true,
      data: result.suggestions
    };
  }

  /**
   * Smart location search with autocomplete and caching (detailed version)
   */
  async searchLocations(
    query: string,
    options: {
      latitude?: number;
      longitude?: number;
      limit?: number;
      preferMorocco?: boolean;
    } = {}
  ): Promise<LocationSearchResult> {
    const startTime = Date.now();
    
    try {
      const response = await locationApiService.getAutocompleteSuggestions({
        query,
        latitude: options.latitude,
        longitude: options.longitude,
        limit: options.limit || 10
      });

      if (response.success && response.data) {
        return {
          suggestions: response.data,
          searchTime: Date.now() - startTime,
          fallbackUsed: false
        };
      }

      // Fallback to local search if API fails
      return {
        suggestions: this.getLocalLocationSuggestions(query, options.limit || 10),
        searchTime: Date.now() - startTime,
        fallbackUsed: true
      };
    } catch (error) {
      return {
        suggestions: this.getLocalLocationSuggestions(query, options.limit || 10),
        searchTime: Date.now() - startTime,
        fallbackUsed: true
      };
    }
  }

  /**
   * Get location details from coordinates (reverse geocoding)
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<ReverseGeocodeResponse>> {
    return locationApiService.reverseGeocode(latitude, longitude);
  }

  /**
   * Get location details from coordinates
   */
  async getLocationFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<LocationSuggestion>> {
    const reverseResponse = await locationApiService.reverseGeocode(latitude, longitude);
    
    if (reverseResponse.success && reverseResponse.data) {
      return {
        success: true,
        data: {
          display_name: reverseResponse.data.formatted_address,
          address: reverseResponse.data.address,
          latitude: reverseResponse.data.latitude,
          longitude: reverseResponse.data.longitude,
          relevance_score: 0.9,
          distance_km: 0,
          city: reverseResponse.data.city,
          region: reverseResponse.data.region,
          country: reverseResponse.data.country
        }
      };
    }

    // Fallback to basic location object
    return {
      success: true,
      data: {
        display_name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        latitude,
        longitude,
        relevance_score: 0.5,
        distance_km: 0,
        city: this.getNearestMoroccanCity(latitude, longitude),
        country: 'Morocco'
      }
    };
  }

  /**
   * Get user's location history
   */
  async getLocationHistory(limit?: number): Promise<ApiResponse<LocationHistoryItem[]>> {
    return locationApiService.getLocationHistory(limit);
  }

  /**
   * Find nearby places of interest
   */
  async getNearbyPlaces(
    latitude: number,
    longitude: number,
    options: {
      radius_km?: number;
      place_types?: string[];
      limit?: number;
    } = {}
  ): Promise<ApiResponse<NearbyPlace[]>> {
    return locationApiService.getNearbyPlaces(latitude, longitude, options);
  }

  /**
   * Validate coordinates for Morocco
   */
  async validateCoordinates(latitude: number, longitude: number): Promise<boolean> {
    const response = await locationApiService.validateCoordinates(latitude, longitude);
    return response.success && response.data?.is_valid === true;
  }

  // ============== Route Services ==============

  /**
   * Quick route matching for passengers
   */
  async findQuickRoutes(request: QuickRouteRequest): Promise<ApiResponse<RouteMatchResponse>> {
    const routeRequest: RouteMatchRequest = {
      start_latitude: request.startLat,
      start_longitude: request.startLng,
      end_latitude: request.endLat,
      end_longitude: request.endLng,
      departure_time: request.departureTime,
      required_seats: request.passengerCount || 1,
      time_flexibility_minutes: 30,
      max_detour_km: 5.0,
      max_pickup_distance_km: 2.0,
      max_dropoff_distance_km: 2.0,
      preferences: {
        smoking_allowed: false,
        pets_allowed: false
      }
    };

    return routeApiService.findMatchingRoutes(routeRequest);
  }

  /**
   * Optimize multi-passenger route
   */
  async optimizeMultiPassengerRoute(
    request: RouteOptimizationRequest
  ): Promise<ApiResponse<RouteOptimizationResponse>> {
    return routeApiService.optimizeRoute(request);
  }

  /**
   * Analyze route patterns and demand
   */
  async analyzeRoute(request: RouteAnalysisRequest): Promise<ApiResponse<RouteAnalysisResponse>> {
    return routeApiService.analyzeRoute(request);
  }

  /**
   * Get routes near a location
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
    return routeApiService.getNearbyRoutes(latitude, longitude, options);
  }

  /**
   * Get popular routes in the system
   */
  async getPopularRoutes(options: {
    limit?: number;
    time_period_days?: number;
  } = {}): Promise<ApiResponse<PopularRoutesResponse>> {
    return routeApiService.getPopularRoutes(options);
  }

  // ============== Combined Services ==============

  /**
   * Get comprehensive route insights
   */
  async getRouteInsights(
    startLat: number, startLng: number,
    endLat: number, endLng: number
  ): Promise<RouteInsights> {
    const distance = routeApiService.calculateDistance(startLat, startLng, endLat, endLng);
    
    // Get route information
    const routeInfoResponse = await locationApiService.getRouteInfo(
      startLat, startLng, endLat, endLng
    );

    let estimatedDuration = routeApiService.estimateTravelTime(distance);
    let popularityScore = 0.5; // Default

    if (routeInfoResponse.success && routeInfoResponse.data) {
      estimatedDuration = routeInfoResponse.data.estimated_duration_minutes || estimatedDuration;
      // Convert traffic conditions to popularity score
      const trafficScore = routeInfoResponse.data.traffic_conditions === 'light' ? 0.8 : 
                          routeInfoResponse.data.traffic_conditions === 'moderate' ? 0.6 : 0.4;
      popularityScore = trafficScore;
    }

    // Get nearby routes to calculate alternatives
    const nearbyResponse = await this.getNearbyRoutes(startLat, startLng, {
      radius_km: 10,
      limit: 20
    });

    const nearbyAlternatives = nearbyResponse.success ? 
      (nearbyResponse.data?.routes.length || 0) : 0;

    const efficiency = routeApiService.calculateRouteEfficiency(
      distance,
      distance * 1.2, // Assume 20% detour for actual route
      1
    );

    return {
      distance,
      estimatedDuration,
      efficiency,
      popularityScore,
      nearbyAlternatives
    };
  }

  /**
   * Smart location picker with route preview
   */
  async getLocationWithRoutePreview(
    query: string,
    fromLatitude?: number,
    fromLongitude?: number
  ): Promise<{
    locations: LocationSuggestion[];
    routePreviews: Array<{
      locationId: string;
      distance: number;
      duration: number;
    }>;
  }> {
    // Search for locations
    const searchResult = await this.searchLocations(query, {
      latitude: fromLatitude,
      longitude: fromLongitude,
      limit: 5
    });

    const routePreviews: Array<{
      locationId: string;
      distance: number;
      duration: number;
    }> = [];

    // If we have a starting point, calculate route previews
    if (fromLatitude && fromLongitude) {
      for (const location of searchResult.suggestions) {
        const distance = routeApiService.calculateDistance(
          fromLatitude, fromLongitude,
          location.latitude, location.longitude
        );
        const duration = routeApiService.estimateTravelTime(distance);

        routePreviews.push({
          locationId: `${location.latitude}_${location.longitude}`,
          distance,
          duration
        });
      }
    }

    return {
      locations: searchResult.suggestions,
      routePreviews
    };
  }

  /**
   * Find optimal meeting point for multiple users
   */
  async findOptimalMeetingPoint(
    locations: Array<{ latitude: number; longitude: number; weight?: number }>
  ): Promise<{ latitude: number; longitude: number; averageDistance: number }> {
    if (locations.length === 0) {
      throw new Error('At least one location is required');
    }

    if (locations.length === 1) {
      return {
        latitude: locations[0].latitude,
        longitude: locations[0].longitude,
        averageDistance: 0
      };
    }

    // Calculate weighted centroid
    let totalWeight = 0;
    let weightedLatSum = 0;
    let weightedLngSum = 0;

    locations.forEach(loc => {
      const weight = loc.weight || 1;
      totalWeight += weight;
      weightedLatSum += loc.latitude * weight;
      weightedLngSum += loc.longitude * weight;
    });

    const centroidLat = weightedLatSum / totalWeight;
    const centroidLng = weightedLngSum / totalWeight;

    // Calculate average distance to centroid
    const totalDistance = locations.reduce((sum, loc) => {
      return sum + routeApiService.calculateDistance(
        centroidLat, centroidLng,
        loc.latitude, loc.longitude
      );
    }, 0);

    return {
      latitude: centroidLat,
      longitude: centroidLng,
      averageDistance: totalDistance / locations.length
    };
  }

  // ============== Utility Methods ==============

  /**
   * Calculate route compatibility score between two routes
   */
  calculateRouteCompatibility(
    route1: { startLat: number; startLng: number; endLat: number; endLng: number },
    route2: { startLat: number; startLng: number; endLat: number; endLng: number }
  ): number {
    // Calculate distances between corresponding points
    const startDistance = routeApiService.calculateDistance(
      route1.startLat, route1.startLng,
      route2.startLat, route2.startLng
    );

    const endDistance = routeApiService.calculateDistance(
      route1.endLat, route1.endLng,
      route2.endLat, route2.endLng
    );

    // Calculate bearing similarity
    const bearing1 = routeApiService.calculateBearing(
      route1.startLat, route1.startLng,
      route1.endLat, route1.endLng
    );

    const bearing2 = routeApiService.calculateBearing(
      route2.startLat, route2.startLng,
      route2.endLat, route2.endLng
    );

    let bearingDiff = Math.abs(bearing1 - bearing2);
    if (bearingDiff > 180) bearingDiff = 360 - bearingDiff;

    // Combine factors (lower is better)
    const maxAcceptableDistance = 5; // km
    const maxBearingDiff = 45; // degrees

    const distanceScore = Math.max(0, 1 - (startDistance + endDistance) / (2 * maxAcceptableDistance));
    const bearingScore = Math.max(0, 1 - bearingDiff / maxBearingDiff);

    return (distanceScore + bearingScore) / 2;
  }

  /**
   * Get local fallback location suggestions
   */
  private getLocalLocationSuggestions(query: string, limit: number): LocationSuggestion[] {
    const moroccanCities = [
      { name: 'Casablanca', lat: 33.5928, lng: -7.6164 },
      { name: 'Rabat', lat: 34.0209, lng: -6.8416 },
      { name: 'Fès', lat: 34.0181, lng: -5.0078 },
      { name: 'Marrakech', lat: 31.6295, lng: -7.9811 },
      { name: 'Tangier', lat: 35.7595, lng: -5.8340 },
      { name: 'Agadir', lat: 30.4278, lng: -9.5981 },
      { name: 'Meknes', lat: 33.8935, lng: -5.5473 },
      { name: 'Oujda', lat: 34.6814, lng: -1.9086 },
      { name: 'Kenitra', lat: 34.2610, lng: -6.5802 },
      { name: 'Tetouan', lat: 35.5889, lng: -5.3626 }
    ];

    const filtered = moroccanCities
      .filter(city => city.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit)
      .map((city, index) => ({
        display_name: `${city.name}, Morocco`,
        address: `${city.name}, Morocco`,
        latitude: city.lat,
        longitude: city.lng,
        relevance_score: 0.8,
        distance_km: 0,
        city: city.name,
        country: 'Morocco'
      }));

    return filtered;
  }

  /**
   * Get nearest Moroccan city for coordinates
   */
  private getNearestMoroccanCity(latitude: number, longitude: number): string {
    const cities = [
      { name: 'Casablanca', lat: 33.5928, lng: -7.6164 },
      { name: 'Rabat', lat: 34.0209, lng: -6.8416 },
      { name: 'Fès', lat: 34.0181, lng: -5.0078 },
      { name: 'Marrakech', lat: 31.6295, lng: -7.9811 },
      { name: 'Tangier', lat: 35.7595, lng: -5.8340 }
    ];

    let nearestCity = cities[0];
    let minDistance = routeApiService.calculateDistance(
      latitude, longitude, nearestCity.lat, nearestCity.lng
    );

    cities.forEach(city => {
      const distance = routeApiService.calculateDistance(
        latitude, longitude, city.lat, city.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    });

    return nearestCity.name;
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(latitude: number, longitude: number): string {
    return `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
  }

  /**
   * Check if two locations are nearby
   */
  areLocationsNearby(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
    thresholdKm: number = 1
  ): boolean {
    const distance = routeApiService.calculateDistance(lat1, lng1, lat2, lng2);
    return distance <= thresholdKm;
  }
}

export const geospatialService = new GeospatialService();
export default geospatialService;