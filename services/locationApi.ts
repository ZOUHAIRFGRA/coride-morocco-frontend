// Location Services API for CoRide Morocco Phase 3
// Implements all 6 Location Services endpoints from the Phase 3 API documentation

import { BaseApiService, ApiResponse, defaultApiConfig } from './BaseApiService';
import { authService } from './auth';
import type {
  AutocompleteRequest,
  LocationSuggestion,
  ReverseGeocodeResponse,
  LocationHistoryItem,
  NearbyPlace,
  RouteInfo,
  CoordinateValidationResponse,
  PlaceCategory,
  LocationServiceParams
} from '../types/geospatial';

class LocationApiService extends BaseApiService {
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
   * 1. Address Autocomplete
   * POST /api/locations/autocomplete
   * Provides intelligent address autocomplete suggestions for Morocco
   */
  async getAutocompleteSuggestions(
    request: AutocompleteRequest
  ): Promise<ApiResponse<LocationSuggestion[]>> {
    if (!request.query || request.query.length < 2) {
      return {
        success: false,
        error: {
          message: 'Query must be at least 2 characters long',
          code: 'INVALID_QUERY'
        }
      };
    }

    const requestData = {
      query: request.query,
      latitude: request.latitude,
      longitude: request.longitude,
      limit: Math.min(request.limit || 10, 50) // Ensure limit is max 50
    };

    return this.post<LocationSuggestion[]>('/locations/autocomplete', requestData);
  }

  /**
   * 2. Reverse Geocoding
   * GET /api/locations/reverse-geocode
   * Convert coordinates to readable address information
   */
  async reverseGeocode(
    latitude: number, 
    longitude: number
  ): Promise<ApiResponse<ReverseGeocodeResponse>> {
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

    return this.get<ReverseGeocodeResponse>(`/locations/reverse-geocode?${params.toString()}`);
  }

  /**
   * 3. Location History
   * GET /api/locations/history
   * Get user's location search history and frequently used locations
   */
  async getLocationHistory(limit: number = 20): Promise<ApiResponse<LocationHistoryItem[]>> {
    const params = new URLSearchParams({
      limit: Math.min(Math.max(limit, 1), 100).toString() // Ensure limit is between 1-100
    });

    return this.get<LocationHistoryItem[]>(`/locations/history?${params.toString()}`);
  }

  /**
   * 4. Nearby Places
   * GET /api/locations/nearby
   * Find nearby points of interest
   */
  async getNearbyPlaces(
    latitude: number,
    longitude: number,
    options: {
      radius_km?: number;
      category?: PlaceCategory;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<NearbyPlace[]>> {
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
      params.append('radius_km', Math.min(Math.max(options.radius_km, 0.1), 50).toString());
    }

    if (options.category) {
      params.append('category', options.category);
    }

    if (options.limit !== undefined) {
      params.append('limit', Math.min(Math.max(options.limit, 1), 100).toString());
    }

    return this.get<NearbyPlace[]>(`/locations/nearby?${params.toString()}`);
  }

  /**
   * 5. Route Information
   * GET /api/locations/route-info
   * Get comprehensive route information including distance, duration, and nearby rides
   */
  async getRouteInfo(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<ApiResponse<RouteInfo>> {
    // Validate all coordinates
    if (!this.isValidCoordinate(startLat, startLng) || !this.isValidCoordinate(endLat, endLng)) {
      return {
        success: false,
        error: {
          message: 'Invalid coordinates provided',
          code: 'INVALID_COORDINATES'
        }
      };
    }

    const params = new URLSearchParams({
      start_lat: startLat.toString(),
      start_lng: startLng.toString(),
      end_lat: endLat.toString(),
      end_lng: endLng.toString()
    });

    return this.get<RouteInfo>(`/locations/route-info?${params.toString()}`);
  }

  /**
   * 6. Coordinate Validation
   * POST /api/locations/validate
   * Validate coordinates and get location information within Morocco
   */
  async validateCoordinates(
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<CoordinateValidationResponse>> {
    const requestData = {
      latitude,
      longitude
    };

    return this.post<CoordinateValidationResponse>('/locations/validate', requestData);
  }

  // ============== Utility Methods ==============

  /**
   * Basic coordinate validation
   */
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  /**
   * Check if coordinates are within Morocco bounds (approximate)
   */
  isInMorocco(latitude: number, longitude: number): boolean {
    return (
      latitude >= 21.0 && latitude <= 36.0 && // Morocco latitude bounds
      longitude >= -17.0 && longitude <= -1.0  // Morocco longitude bounds
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
   * Format coordinates for display
   */
  formatCoordinates(latitude: number, longitude: number): string {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get major Moroccan cities (for local fallback/validation)
   */
  getMoroccanCities(): Array<{name: string; latitude: number; longitude: number; region: string}> {
    return [
      { name: 'Casablanca', latitude: 33.5731, longitude: -7.5898, region: 'Casablanca-Settat' },
      { name: 'Rabat', latitude: 34.0209, longitude: -6.8416, region: 'Rabat-Salé-Kénitra' },
      { name: 'Marrakech', latitude: 31.6295, longitude: -7.9811, region: 'Marrakech-Safi' },
      { name: 'Fez', latitude: 34.0181, longitude: -5.0078, region: 'Fès-Meknès' },
      { name: 'Tangier', latitude: 35.7595, longitude: -5.834, region: 'Tanger-Tétouan-Al Hoceïma' },
      { name: 'Agadir', latitude: 30.4278, longitude: -9.5981, region: 'Souss-Massa' },
      { name: 'Oujda', latitude: 34.6867, longitude: -1.9114, region: 'Oriental' },
      { name: 'Kenitra', latitude: 34.2610, longitude: -6.5802, region: 'Rabat-Salé-Kénitra' },
      { name: 'Tetouan', latitude: 35.5889, longitude: -5.368, region: 'Tanger-Tétouan-Al Hoceïma' },
      { name: 'Safi', latitude: 32.2994, longitude: -9.2372, region: 'Marrakech-Safi' }
    ];
  }

  /**
   * Get popular landmarks in Morocco (for suggestions/validation)
   */
  getMoroccanLandmarks(): Array<{
    name: string; 
    latitude: number; 
    longitude: number; 
    city: string;
    category: string;
  }> {
    return [
      {
        name: 'Hassan II Mosque',
        latitude: 33.6084,
        longitude: -7.6325,
        city: 'Casablanca',
        category: 'religious'
      },
      {
        name: 'Mohammed V University',
        latitude: 33.5731,
        longitude: -7.5898,
        city: 'Casablanca',
        category: 'education'
      },
      {
        name: 'Casa Port Train Station',
        latitude: 33.5970,
        longitude: -7.6097,
        city: 'Casablanca',
        category: 'transport'
      },
      {
        name: 'Mohammed V Airport',
        latitude: 33.3676,
        longitude: -7.5896,
        city: 'Casablanca',
        category: 'transport'
      },
      {
        name: 'Rabat Ville Train Station',
        latitude: 34.0134,
        longitude: -6.8363,
        city: 'Rabat',
        category: 'transport'
      },
      {
        name: 'Jemaa el-Fnaa',
        latitude: 31.6258,
        longitude: -7.9891,
        city: 'Marrakech',
        category: 'entertainment'
      },
      {
        name: 'Medina Marrakech',
        latitude: 31.6295,
        longitude: -7.9811,
        city: 'Marrakech',
        category: 'entertainment'
      },
      {
        name: 'Medina Casablanca',
        latitude: 33.5928,
        longitude: -7.6187,
        city: 'Casablanca',
        category: 'entertainment'
      }
    ];
  }

  /**
   * Find nearest city to given coordinates
   */
  findNearestCity(latitude: number, longitude: number): {
    city: string;
    distance: number;
    region: string;
  } | null {
    const cities = this.getMoroccanCities();
    let nearest = null;
    let minDistance = Infinity;

    for (const city of cities) {
      const distance = this.calculateDistance(
        latitude, longitude,
        city.latitude, city.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = {
          city: city.name,
          distance: distance,
          region: city.region
        };
      }
    }

    return nearest;
  }

  /**
   * Search suggestions in cached data (fallback for offline)
   */
  searchLocalSuggestions(
    query: string,
    userLat?: number,
    userLng?: number,
    limit: number = 10
  ): LocationSuggestion[] {
    const queryLower = query.toLowerCase();
    const cities = this.getMoroccanCities();
    const landmarks = this.getMoroccanLandmarks();
    
    const suggestions: LocationSuggestion[] = [];

    // Search cities
    cities.forEach(city => {
      if (city.name.toLowerCase().includes(queryLower)) {
        const distance = userLat && userLng 
          ? this.calculateDistance(userLat, userLng, city.latitude, city.longitude)
          : 0;

        suggestions.push({
          display_name: city.name,
          address: `${city.name}, ${city.region}, Morocco`,
          latitude: city.latitude,
          longitude: city.longitude,
          relevance_score: city.name.toLowerCase().startsWith(queryLower) ? 1.0 : 0.8,
          distance_km: distance,
          city: city.name,
          region: city.region,
          country: 'Morocco'
        });
      }
    });

    // Search landmarks
    landmarks.forEach(landmark => {
      if (landmark.name.toLowerCase().includes(queryLower)) {
        const distance = userLat && userLng 
          ? this.calculateDistance(userLat, userLng, landmark.latitude, landmark.longitude)
          : 0;

        suggestions.push({
          display_name: landmark.name,
          address: `${landmark.name}, ${landmark.city}, Morocco`,
          latitude: landmark.latitude,
          longitude: landmark.longitude,
          relevance_score: landmark.name.toLowerCase().startsWith(queryLower) ? 0.9 : 0.7,
          distance_km: distance,
          city: landmark.city,
          country: 'Morocco'
        });
      }
    });

    // Sort by relevance and distance
    suggestions.sort((a, b) => {
      const scoreDiff = b.relevance_score - a.relevance_score;
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      return a.distance_km - b.distance_km;
    });

    return suggestions.slice(0, limit);
  }
}

export const locationApiService = new LocationApiService();
export default locationApiService;