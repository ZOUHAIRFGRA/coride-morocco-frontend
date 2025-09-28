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

// Custom token storage for auth service
class AuthTokenStorage implements TokenStorage {
  private tokens: { access?: string; refresh?: string } = {};

  getAccessToken(): string | null {
    return this.tokens.access || null;
  }

  getRefreshToken(): string | null {
    return this.tokens.refresh || null;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.tokens.access = accessToken;
    this.tokens.refresh = refreshToken;
  }

  clearTokens(): void {
    this.tokens = {};
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
      
      // Get user data after login
      const userResponse = await this.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        userData = userResponse.data;
      }
    }

    return response;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return this.get<UserResponse>('/auth/me');
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

    // Optionally validate token by making a request
    try {
      const response = await this.getCurrentUser();
      return response.success;
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
}

export const authService = new AuthService();
export default authService;