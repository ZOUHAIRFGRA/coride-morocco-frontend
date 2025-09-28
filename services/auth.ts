// Authentication API Service for CoRide Morocco
// Extends BaseApiService for consistent API handling

import {
    ApiResponse,
    PasswordChangeRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegistrationRequest,
    UserResponse,
} from '../types/auth';
import { BaseApiService, defaultApiConfig, TokenStorage } from './BaseApiService';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom token storage for auth service with persistence
class AuthTokenStorage implements TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = '@coride/access_token';
  private static readonly REFRESH_TOKEN_KEY = '@coride/refresh_token';

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AuthTokenStorage.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token from storage:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AuthTokenStorage.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token from storage:', error);
      return null;
    }
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(AuthTokenStorage.ACCESS_TOKEN_KEY, accessToken),
        AsyncStorage.setItem(AuthTokenStorage.REFRESH_TOKEN_KEY, refreshToken)
      ]);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AuthTokenStorage.ACCESS_TOKEN_KEY),
        AsyncStorage.removeItem(AuthTokenStorage.REFRESH_TOKEN_KEY)
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
}

// Store user data separately
let userData: UserResponse | null = null;

class AuthService extends BaseApiService {
  constructor() {
    super(defaultApiConfig, new AuthTokenStorage());
  }

  /**
   * Implement token refresh from base class
   */
  protected async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await this.post<TokenResponse>(
        '/auth/refresh',
        { refresh_token: refreshToken },
        false // Don't require auth for refresh
      );

      if (response.success && response.data) {
        await this.storeTokens(response.data.access_token, response.data.refresh_token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Register new user
   */
  async register(data: UserRegistrationRequest): Promise<ApiResponse<UserResponse>> {
    // Set default role if not provided
    const registrationData = {
      ...data,
      role: data.role || 'rider',
      preferred_language: data.preferred_language || 'fr'
    };
    
    const response = await this.post<UserResponse>('/auth/register', registrationData, false);

    if (response.success && response.data) {
      userData = response.data;
    }

    return response;
  }

  /**
   * Login user
   */
  async login(credentials: UserLoginRequest): Promise<ApiResponse<TokenResponse>> {
    const response = await this.post<TokenResponse>('/auth/login', credentials, false);

    if (response.success && response.data) {
      await this.storeTokens(response.data.access_token, response.data.refresh_token);
      
      // Get user data after login (this will be cached and deduplicated)
      const userResponse = await this.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        userData = userResponse.data;
      }
    }

    return response;
  }

  // Request deduplication for getCurrentUser
  private currentUserRequest: Promise<ApiResponse<UserResponse>> | null = null;

  /**
   * Get current user info (with request deduplication)
   */
  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    // If there's already a request in progress, return the same promise
    if (this.currentUserRequest) {
      return this.currentUserRequest;
    }

    // Create new request and store the promise
    this.currentUserRequest = this.get<UserResponse>('/auth/me');
    
    try {
      const result = await this.currentUserRequest;
      return result;
    } finally {
      // Clear the request after completion (success or failure)
      this.currentUserRequest = null;
    }
  }

  /**
   * Change password
   */
  async changePassword(data: PasswordChangeRequest): Promise<ApiResponse<{ message: string }>> {
    return this.put<{ message: string }>('/auth/change-password', data);
  }

  /**
   * Verify email
   */
  async verifyEmail(code: string): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>(`/auth/verify-email?verification_code=${code}`, {});
  }

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/auth/resend-verification', {});
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.post<{ message: string }>('/auth/logout', {});

    // Clear local data
    await this.clearTokens();
    userData = null;

    return response;
  }

  /**
   * Check if user is authenticated (override base method)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) {
      return false;
    }

    // Validate token by making a request
    try {
      const response = await this.getCurrentUser();
      if (response.success) {
        return true;
      }
      
      // If token is invalid, try to refresh
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        // Try again with new token
        const retryResponse = await this.getCurrentUser();
        return retryResponse.success;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get stored user data
   */
  getUserData(): UserResponse | null {
    return userData;
  }

  /**
   * Clear auth data
   */
  async clearAuth(): Promise<void> {
    await this.clearTokens();
    userData = null;
  }

  /**
   * Get current access token (public method)
   */
  async getStoredAccessToken(): Promise<string | null> {
    return await this.getAccessToken();
  }

  /**
   * Get current refresh token (public method)
   */
  async getStoredRefreshToken(): Promise<string | null> {
    return await this.getRefreshToken();
  }
}

export const authService = new AuthService();
export default authService;