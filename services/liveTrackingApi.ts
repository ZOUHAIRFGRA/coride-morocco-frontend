// Live Tracking & Real-time Features API Service
// Phase 8: Location tracking, emergency alerts, notifications

import { BaseApiService } from './BaseApiService';
import type {
  LiveLocation,
  UpdateLocationRequest,
  RideTracking,
  UpdateRideTrackingRequest,
  EmergencyAlert,
  CreateEmergencyAlertRequest,
  EmergencyAlertListResponse,
  RideNotification,
  NotificationListResponse,
} from '../types/liveTracking';
import type { ApiResponse } from './BaseApiService';

class LiveTrackingApiService extends BaseApiService {
  // ==================== Live Location Tracking ====================

  /**
   * Update user's current location
   */
  async updateLocation(data: UpdateLocationRequest): Promise<ApiResponse<LiveLocation>> {
    return this.post<LiveLocation>('/live/location', data);
  }

  /**
   * Get user's location history
   */
  async getLocationHistory(params?: {
    user_id?: number;
    ride_id?: number;
    from_time?: string;
    to_time?: string;
    limit?: number;
  }): Promise<ApiResponse<LiveLocation[]>> {
    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.ride_id) queryParams.append('ride_id', params.ride_id.toString());
    if (params?.from_time) queryParams.append('from_time', params.from_time);
    if (params?.to_time) queryParams.append('to_time', params.to_time);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.get<LiveLocation[]>(`/live/location/history?${queryParams.toString()}`);
  }

  /**
   * Get latest location for a user
   */
  async getLatestLocation(userId: number): Promise<ApiResponse<LiveLocation>> {
    return this.get<LiveLocation>(`/live/location/latest/${userId}`);
  }

  // ==================== Ride Tracking ====================

  /**
   * Get ride tracking information
   */
  async getRideTracking(rideId: number): Promise<ApiResponse<RideTracking>> {
    return this.get<RideTracking>(`/live/rides/${rideId}/tracking`);
  }

  /**
   * Update ride tracking status
   */
  async updateRideTracking(
    rideId: number,
    data: UpdateRideTrackingRequest
  ): Promise<ApiResponse<RideTracking>> {
    return this.put<RideTracking>(`/live/rides/${rideId}/tracking`, data);
  }

  /**
   * Start ride tracking (driver)
   */
  async startRideTracking(rideId: number): Promise<ApiResponse<RideTracking>> {
    return this.post<RideTracking>(`/live/rides/${rideId}/tracking/start`, {});
  }

  /**
   * Complete ride tracking
   */
  async completeRideTracking(rideId: number): Promise<ApiResponse<RideTracking>> {
    return this.post<RideTracking>(`/live/rides/${rideId}/tracking/complete`, {});
  }

  // ==================== Emergency Alerts ====================

  /**
   * Create emergency alert (panic button)
   */
  async createEmergencyAlert(data: CreateEmergencyAlertRequest): Promise<ApiResponse<EmergencyAlert>> {
    return this.post<EmergencyAlert>('/live/emergency', data);
  }

  /**
   * Get user's emergency alerts
   */
  async getEmergencyAlerts(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<EmergencyAlertListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    return this.get<EmergencyAlertListResponse>(`/live/emergency?${queryParams.toString()}`);
  }

  /**
   * Get emergency alert by ID
   */
  async getEmergencyAlertById(alertId: number): Promise<ApiResponse<EmergencyAlert>> {
    return this.get<EmergencyAlert>(`/live/emergency/${alertId}`);
  }

  /**
   * Cancel emergency alert (false alarm)
   */
  async cancelEmergencyAlert(alertId: number, reason?: string): Promise<ApiResponse<EmergencyAlert>> {
    return this.post<EmergencyAlert>(`/live/emergency/${alertId}/cancel`, { reason });
  }

  // ==================== Notifications ====================

  /**
   * Get user's notifications
   */
  async getNotifications(params?: {
    unread_only?: boolean;
    priority?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<NotificationListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.unread_only) queryParams.append('unread_only', params.unread_only.toString());
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    return this.get<NotificationListResponse>(`/live/notifications?${queryParams.toString()}`);
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: number): Promise<ApiResponse<RideNotification>> {
    return this.post<RideNotification>(`/live/notifications/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<ApiResponse<{ message: string; count: number }>> {
    return this.post<{ message: string; count: number }>('/live/notifications/read-all', {});
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/live/notifications/${notificationId}`);
  }

  // ==================== Helper Methods ====================

  /**
   * Quick location update with minimal data
   */
  async quickLocationUpdate(
    latitude: number,
    longitude: number,
    rideId?: number
  ): Promise<ApiResponse<LiveLocation>> {
    return this.updateLocation({
      latitude,
      longitude,
      ride_id: rideId,
      update_type: 'automatic' as any,
    });
  }

  /**
   * Panic button - create critical emergency alert
   */
  async triggerPanicButton(
    latitude: number,
    longitude: number,
    rideId?: number,
    description?: string
  ): Promise<ApiResponse<EmergencyAlert>> {
    return this.createEmergencyAlert({
      emergency_type: 'panic_button' as any,
      latitude,
      longitude,
      ride_id: rideId,
      description: description || 'Emergency assistance needed',
      severity: 'critical',
    });
  }

  /**
   * Report accident
   */
  async reportAccident(
    latitude: number,
    longitude: number,
    rideId?: number,
    description?: string,
    photoUrls?: string[]
  ): Promise<ApiResponse<EmergencyAlert>> {
    return this.createEmergencyAlert({
      emergency_type: 'accident' as any,
      latitude,
      longitude,
      ride_id: rideId,
      description: description || 'Traffic accident reported',
      severity: 'high',
      photo_urls: photoUrls,
    });
  }

  /**
   * Report vehicle breakdown
   */
  async reportBreakdown(
    latitude: number,
    longitude: number,
    rideId?: number,
    description?: string
  ): Promise<ApiResponse<EmergencyAlert>> {
    return this.createEmergencyAlert({
      emergency_type: 'vehicle_breakdown' as any,
      latitude,
      longitude,
      ride_id: rideId,
      description: description || 'Vehicle breakdown',
      severity: 'medium',
    });
  }

  /**
   * Update ride status to picked up
   */
  async markRiderPickedUp(rideId: number): Promise<ApiResponse<RideTracking>> {
    return this.updateRideTracking(rideId, {
      tracking_status: 'picked_up' as any,
    });
  }

  /**
   * Update ride status to in transit
   */
  async markInTransit(rideId: number): Promise<ApiResponse<RideTracking>> {
    return this.updateRideTracking(rideId, {
      tracking_status: 'in_transit' as any,
    });
  }

  /**
   * Update ride status to near destination
   */
  async markNearDestination(rideId: number, distanceKm: number): Promise<ApiResponse<RideTracking>> {
    return this.updateRideTracking(rideId, {
      tracking_status: 'near_destination' as any,
      distance_to_destination_km: distanceKm,
    });
  }

  /**
   * Update ride status to arrived
   */
  async markArrived(rideId: number): Promise<ApiResponse<RideTracking>> {
    return this.updateRideTracking(rideId, {
      tracking_status: 'arrived' as any,
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.getNotifications({
      unread_only: true,
      page: 1,
      page_size: 1,
    });

    if (response.success && response.data) {
      return response.data.unread_count;
    }

    return 0;
  }

  /**
   * Get active emergency alerts
   */
  async getActiveEmergencies(): Promise<ApiResponse<EmergencyAlertListResponse>> {
    return this.getEmergencyAlerts({
      status: 'active',
      page: 1,
      page_size: 10,
    });
  }
}

// Default API configuration
const defaultConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Export singleton instance
export const liveTrackingApiService = new LiveTrackingApiService(defaultConfig);

// Export class for testing or custom instances
export { LiveTrackingApiService };
