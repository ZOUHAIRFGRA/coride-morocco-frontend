// User Role Management API Service
// Handles role switching between rider and driver modes

import { BaseApiService, ApiResponse, defaultApiConfig } from './BaseApiService';
import { authService } from './auth';

export interface UserRoleInfo {
  current_role: 'rider' | 'driver' | 'admin';
  can_drive: boolean;
  driver_license_verified: boolean;
  identity_verified: boolean;
  available_roles: string[];
}

export interface RoleSwitchResponse {
  message: string;
  new_role: 'rider' | 'driver';
  can_drive: boolean;
  driver_license_verified: boolean;
}

class UserRoleApiService extends BaseApiService {
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
   * Get current user role and driving eligibility
   */
  async getUserRole(): Promise<ApiResponse<UserRoleInfo>> {
    try {
      const response = await this.get<UserRoleInfo>('/users/role');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Get user role error:', error);
      
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Failed to get user role information',
          code: error.response?.status?.toString() || '500',
          statusCode: error.response?.status || 500
        }
      };
    }
  }

  /**
   * Switch user role between rider and driver
   * @param role - The role to switch to ('rider' or 'driver')
   */
  async switchRole(role: 'rider' | 'driver'): Promise<ApiResponse<RoleSwitchResponse>> {
    try {
      // Validate role parameter
      if (!['rider', 'driver'].includes(role)) {
        return {
          success: false,
          error: {
            message: "Can only switch between 'rider' and 'driver' roles",
            code: '400',
            statusCode: 400
          }
        };
      }

      const response = await this.put<RoleSwitchResponse>('/users/role', {
        new_role: role
      });
      
      return response;
    } catch (error: any) {
      console.error('Switch role error:', error);
      
      const errorMessage = error.response?.data?.message;
      let userFriendlyMessage = 'Failed to switch role';

      // Handle specific error cases
      if (errorMessage?.includes('driver license')) {
        userFriendlyMessage = 'You need a verified driver license to become a driver. Please upload and verify your license first.';
      } else if (errorMessage?.includes('expired')) {
        userFriendlyMessage = 'Your driver license has expired. Please upload a valid license to continue as a driver.';
      } else if (errorMessage?.includes('identity')) {
        userFriendlyMessage = 'Please verify your identity first before switching roles.';
      } else if (errorMessage) {
        userFriendlyMessage = errorMessage;
      }
      
      return {
        success: false,
        error: {
          message: userFriendlyMessage,
          code: error.response?.status?.toString() || '500',
          statusCode: error.response?.status || 500
        }
      };
    }
  }

  /**
   * Check if user can switch to driver role
   */
  async canSwitchToDriver(): Promise<ApiResponse<boolean>> {
    try {
      const roleInfo = await this.getUserRole();
      
      if (!roleInfo.success || !roleInfo.data) {
        return {
          success: false,
          error: {
            message: 'Unable to check driver eligibility',
            code: '500',
            statusCode: 500
          }
        };
      }

      const canSwitch = roleInfo.data.can_drive && 
                       roleInfo.data.driver_license_verified && 
                       roleInfo.data.identity_verified;

      return {
        success: true,
        data: canSwitch
      };
    } catch (error: any) {
      console.error('Check driver eligibility error:', error);
      
      return {
        success: false,
        error: {
          message: 'Failed to check driver eligibility',
          code: '500',
          statusCode: 500
        }
      };
    }
  }
}

export const userRoleApiService = new UserRoleApiService();