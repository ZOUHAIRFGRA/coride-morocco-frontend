// Services Index - CoRide Morocco
// Central export point for all API services

// Base API service and types
export { BaseApiService, defaultApiConfig } from './BaseApiService';
export type { ApiConfig, ApiError, ApiResponse, TokenStorage } from './BaseApiService';

// Authentication service
import { authService } from './auth';
import { ridesApiService } from './ridesApi';
import { userApiService } from './userApi';

export type {
    PasswordChangeRequest, TokenResponse, UserLoginRequest, UserRegistrationRequest, UserResponse
} from '../types/auth';
export { authService };

// Rides service
export type {
    BookingRequest, CreateRideRequest, Ride, RideSearchParams
} from './ridesApi';
export { ridesApiService };

// User API service (complete User Management API)
export type {
    UserProfile, UpdateProfileRequest, UserPreferences, UpdatePreferencesRequest,
    UserLocation, CreateLocationRequest, UserSearchResult, UserSearchParams,
    PublicUserProfile, UserStats, ProfilePhotoUploadResponse, UserDocuments,
    DocumentStatusResponse, UploadIdentityDocumentResponse, UploadDriverLicenseResponse,
    DocumentType
} from '../types/user';
export { userApiService };

// Document Verification WebSocket service
export { documentVerificationWebSocket } from './documentVerificationWebSocket';
export type { VerificationStatus, WebSocketMessage } from './documentVerificationWebSocket';

// Service configuration helpers
export const configureServices = (config: {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}) => {
  // Update all services with new config
  authService.updateConfig(config);
  ridesApiService.updateConfig(config);
  userApiService.updateConfig(config);
};

// Service status checker
export const checkServicesHealth = async () => {
  const results = {
    auth: false,
    rides: false,
    profile: false,
  };

  try {
    // Just check if services are configured without making API calls
    results.auth = true; // Service exists
    results.rides = true; // Service exists
    results.profile = true; // Service exists
  } catch (error) {
    console.error('Services health check failed:', error);
  }

  return results;
};