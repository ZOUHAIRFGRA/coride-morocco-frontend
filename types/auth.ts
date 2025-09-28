// Authentication types for CoRide Morocco
// TypeScript interfaces matching the backend Pydantic models

export enum UserRole {
  RIDER = 'rider',
  DRIVER = 'driver',
  ADMIN = 'admin'
}

export interface UserRegistrationRequest {
  email: string;
  phone?: string;
  password: string;
  first_name: string;
  last_name: string;
  preferred_language?: 'fr' | 'ar';
  role?: UserRole;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UserResponse {
  id: number;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  preferred_language: string;
  rating_average?: number;
  rating_count: number;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface VerificationRequest {
  verification_code: string;
}

// Form validation interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  preferredLanguage: 'fr' | 'ar';
  role: UserRole;
  acceptTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
  verificationCode: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface AuthError {
  message: string;
  details?: string;
  field?: string;
}

// Auth state types for Redux/Context
export interface AuthState {
  user: UserResponse | null;
  tokens: TokenResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

// API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: AuthError;
  success: boolean;
}

// Phone validation for Morocco
export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  message?: string;
}

// Password strength validation
export interface PasswordValidationResult {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
  message?: string;
}