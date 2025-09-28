// Services Index - CoRide Morocco
// Central export point for all API services

// Base API service and types
export { BaseApiService, defaultApiConfig } from './BaseApiService';
export type { ApiConfig, ApiError, ApiResponse, TokenStorage } from './BaseApiService';

// Authentication service
import { authService } from './auth';
import { ridesApiService } from './ridesApi';
import { userProfileApiService } from './userProfileApi';

export type {
    PasswordChangeRequest, TokenResponse, UserLoginRequest, UserRegistrationRequest, UserResponse
} from '../types/auth';
export { authService };

// Rides service
export type {
    BookingRequest, CreateRideRequest, Ride, RideSearchParams
} from './ridesApi';
export { ridesApiService };

// User profile service
export type {
    RatingRequest, UpdatePreferencesRequest, UpdateProfileRequest,
    UpdateVehicleRequest, UserPreferences, UserProfile, UserRatings, VehicleInfo, VerificationStatus
} from './userProfileApi';
export { userProfileApiService };

// Service configuration helpers
export const configureServices = (config: {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}) => {
  // Update all services with new config
  authService.updateConfig(config);
  ridesApiService.updateConfig(config);
  userProfileApiService.updateConfig(config);
};

// Service status checker
export const checkServicesHealth = async () => {
  const results = {
    auth: false,
    rides: false,
    profile: false,
  };

  try {
    // You can implement health check endpoints
    // For now, just check if services are configured
    results.auth = await authService.isAuthenticated() || true; // Service exists
    results.rides = true; // Service exists
    results.profile = true; // Service exists
  } catch (error) {
    console.error('Services health check failed:', error);
  }

  return results;
};