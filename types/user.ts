// User API types for CoRide Morocco
// Based on the backend User API documentation

export interface UserProfile {
  id: number;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: 'RIDER' | 'DRIVER' | 'ADMIN';
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  preferred_language: string;
  bio?: string;
  profile_photo_url?: string;
  rating_average: number | null;
  rating_count: number;
  created_at: string;
  last_login: string;
  music_preference: string;
  conversation_preference: string;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  air_conditioning: boolean;
  max_detour_minutes: number;
  // Role management properties
  can_drive: boolean;
  driver_license_verified: boolean;
  identity_verified: boolean;
  available_roles: string[];
  // Additional properties for compatibility
  verification_status: {
    identity_verified: boolean;
    phone_verified: boolean;
    driver_license_verified: boolean;
  };
  ratings: {
    as_driver: number;
    as_passenger: number;
    total_ratings: number;
  };
}

// Role management types — single source of truth lives in services/userRoleApi.ts
// (this used to be a separate, drifted copy with a lowercase available_roles type
// that didn't match what the API actually returns).
export type { UserRoleInfo, RoleSwitchResponse } from '@/services/userRoleApi';

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_language?: string;
  bio?: string;
}

export interface UserPreferences {
  music_preference: string;
  conversation_preference: string;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  air_conditioning: boolean;
  max_detour_minutes: number;
}

export interface UpdatePreferencesRequest {
  music_preference?: string;
  conversation_preference?: string;
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  air_conditioning?: boolean;
  max_detour_minutes?: number;
}

export interface UserLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  location_type: string;
  created_at: string;
}

export interface CreateLocationRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  location_type: string;
}

export interface UserSearchResult {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  rating_average: number;
  rating_count: number;
  profile_photo_url?: string;
  bio?: string;
}

export interface UserSearchParams {
  q?: string;
  role?: string;
  min_rating?: number;
  verified_only?: boolean;
  limit?: number;
  offset?: number;
}

export interface PublicUserProfile {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  rating_average: number;
  rating_count: number;
  profile_photo_url?: string;
  bio?: string;
}

export interface UserStats {
  profile_completion: number;
  saved_locations: number;
  rating_average: number;
  rating_count: number;
  email_verified: boolean;
  phone_verified: boolean;
  member_since: string;
  last_login: string;
}

export interface ProfilePhotoUploadResponse {
  message: string;
  photo_url: string;
  public_id: string;
}

// Document verification types
export interface IdentityDocument {
  id: number;
  document_type: string;
  status: string;
  front_image_url: string;
  back_image_url?: string;
  uploaded_at: string;
  verified_at?: string;
}

export interface DriverLicense {
  id: number;
  license_number: string;
  status: string;
  front_image_url: string;
  back_image_url: string;
  expiry_date: string;
  uploaded_at: string;
  verified_at?: string;
}

export interface UserDocuments {
  identity_documents: IdentityDocument[];
  driver_license?: DriverLicense;
  verification_summary: {
    identity_verified: boolean;
    driver_license_verified: boolean;
    can_drive: boolean;
  };
}

export interface DocumentStatusResponse {
  document_id: number;
  document_type: string;
  status: string;
  uploaded_at: string;
  verified_at?: string;
  rejection_reason?: string;
  license_number?: string;
  expiry_date?: string;
}

export interface UploadIdentityDocumentResponse {
  message: string;
  document_id: number;
  document_type: string;
  status: string;
  verification_task_id: string;
  front_image_url: string;
  back_image_url?: string;
}

export interface UploadDriverLicenseResponse {
  message: string;
  license_id: number;
  license_number: string;
  status: string;
  verification_task_id: string;
  front_image_url: string;
  back_image_url: string;
  expiry_date: string;
}

// New types for verification tracking
export interface VerificationStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  extracted_data?: DocumentExtraction;
  error?: string;
}

export interface DocumentExtraction {
  id: number;
  document_type: string;
  extracted_data: {
    [key: string]: any;
    // For identity documents
    cin?: string;
    full_name?: string;
    birth_date?: string;
    address?: string;
    // For driver license
    license_number?: string;
    expiry_date?: string;
    issue_date?: string;
  };
  confidence_score: number;
  created_at: string;
}

// Enums for validation
export enum LocationType {
  HOME = 'home',
  WORK = 'work',
  UNIVERSITY = 'university',
  OTHER = 'other'
}

export enum MusicPreference {
  QUIET = 'quiet',
  BACKGROUND = 'background',
  ANY = 'any'
}

export enum ConversationPreference {
  CHATTY = 'chatty',
  QUIET = 'quiet',
  ANY = 'any'
}

export enum DocumentType {
  NATIONAL_ID = 'national_id',
  PASSPORT = 'passport',
  RESIDENCE_PERMIT = 'residence_permit'
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum PreferredLanguage {
  FRENCH = 'fr',
  ARABIC = 'ar',
  ENGLISH = 'en'
}