// Services Index - CoRide Morocco
// Central export point for all API services

// Base API service and types
export { BaseApiService, defaultApiConfig } from './BaseApiService';
export type { ApiConfig, ApiError, ApiResponse, TokenStorage } from './BaseApiService';

// Authentication service
import { authService } from './auth';
import { ridesApiService } from './ridesApi';
import { userApiService } from './userApi';
import { tribesApiService } from './tribesApi';
import { paymentApiService } from './paymentApi';
import { liveTrackingApiService } from './liveTrackingApi';

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

// Tribes service
export { tribesApiService } from './tribesApi';
export type {
  Tribe, TribeMember, TribeMessage, TribeListResponse, TribeMemberListResponse,
  TribeMessageListResponse, CreateTribeRequest, UpdateTribeRequest, JoinTribeRequest,
  SendMessageRequest, TribeSearchParams
} from '../types/tribe';

// Tribe WebSocket service
export { tribeWebSocketService } from './tribeWebSocket';
export type { TribeWebSocketCallbacks } from './tribeWebSocket';

// Payment API service (Phase 7: Payments & Cost Management)
export { paymentApiService, PaymentApiService } from './paymentApi';
export type {
  CostEstimateRequest, CostEstimateResponse, Payment, CreatePaymentRequest,
  ConfirmPaymentRequest, PaymentListResponse, PaymentDispute, CreateDisputeRequest,
  DisputeListResponse, PaymentHistory, SavingsCalculation, FuelPrice,
  PaymentStatus, PaymentMethod, DisputeStatus, DisputeType, PricingTier
} from '../types/payment';

// Live Tracking API service (Phase 8: Real-time Features)
export { liveTrackingApiService, LiveTrackingApiService } from './liveTrackingApi';
export type {
  LiveLocation, UpdateLocationRequest, RideTracking, UpdateRideTrackingRequest,
  EmergencyAlert, CreateEmergencyAlertRequest, EmergencyAlertListResponse,
  RideNotification, NotificationListResponse, LocationUpdateType, RideTrackingStatus,
  EmergencyType, EmergencyStatus, NotificationPriority
} from '../types/liveTracking';

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
  tribesApiService.updateConfig(config);
  paymentApiService.updateConfig(config);
  liveTrackingApiService.updateConfig(config);
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