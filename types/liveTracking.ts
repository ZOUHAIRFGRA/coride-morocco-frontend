// Phase 8: Real-time Features & WebSockets - Type Definitions

// Enums
export enum LocationUpdateType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  GPS_TRACKING = 'gps_tracking',
  CHECK_IN = 'check_in',
}

export enum RideTrackingStatus {
  WAITING = 'waiting',
  EN_ROUTE_PICKUP = 'en_route_pickup',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  NEAR_DESTINATION = 'near_destination',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
}

export enum EmergencyType {
  PANIC_BUTTON = 'panic_button',
  ACCIDENT = 'accident',
  UNSAFE_SITUATION = 'unsafe_situation',
  VEHICLE_BREAKDOWN = 'vehicle_breakdown',
  MEDICAL_EMERGENCY = 'medical_emergency',
  OTHER = 'other',
}

export enum EmergencyStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESPONDING = 'responding',
  RESOLVED = 'resolved',
  FALSE_ALARM = 'false_alarm',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

// Live Location Tracking
export interface LiveLocation {
  id: number;
  user_id: number;
  ride_id: number | null;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  altitude_meters: number | null;
  speed_kmh: number | null;
  heading_degrees: number | null;
  update_type: LocationUpdateType;
  battery_level: number | null;
  network_type: string | null;
  recorded_at: string;
  created_at: string;
}

export interface UpdateLocationRequest {
  ride_id?: number;
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
  altitude_meters?: number;
  speed_kmh?: number;
  heading_degrees?: number;
  update_type?: LocationUpdateType;
  battery_level?: number;
  network_type?: string;
}

// Ride Tracking
export interface RideTracking {
  id: number;
  ride_id: number;
  tracking_status: RideTrackingStatus;
  current_latitude: number | null;
  current_longitude: number | null;
  distance_to_pickup_km: number | null;
  distance_to_destination_km: number | null;
  estimated_pickup_time: string | null;
  estimated_arrival_time: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  delay_minutes: number | null;
  delay_reason: string | null;
  route_deviated: boolean;
  shared_with_users: number[];
  created_at: string;
  updated_at: string;
}

export interface UpdateRideTrackingRequest {
  tracking_status?: RideTrackingStatus;
  current_latitude?: number;
  current_longitude?: number;
  distance_to_pickup_km?: number;
  distance_to_destination_km?: number;
  estimated_pickup_time?: string;
  estimated_arrival_time?: string;
  delay_minutes?: number;
  delay_reason?: string;
  route_deviated?: boolean;
}

// Emergency Alerts
export interface EmergencyAlert {
  id: number;
  user_id: number;
  user: {
    id: number;
    full_name: string;
    avatar_url: string | null;
    phone_number: string | null;
  };
  ride_id: number | null;
  emergency_type: EmergencyType;
  status: EmergencyStatus;
  latitude: number;
  longitude: number;
  address: string | null;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  contacts_notified: Array<{
    contact_id: number;
    contact_name: string;
    contact_phone: string;
    notified_at: string;
  }>;
  authorities_notified: boolean;
  acknowledged_by_id: number | null;
  resolved_by_id: number | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  photo_urls: string[];
  audio_recording_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmergencyAlertRequest {
  ride_id?: number;
  emergency_type: EmergencyType;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  photo_urls?: string[];
  audio_recording_url?: string;
}

export interface EmergencyAlertListResponse {
  alerts: EmergencyAlert[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Notifications
export interface RideNotification {
  id: number;
  user_id: number;
  ride_id: number | null;
  notification_type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: Array<'push' | 'sms' | 'email' | 'in_app'>;
  delivery_status: Record<string, 'pending' | 'sent' | 'delivered' | 'failed'>;
  action_url: string | null;
  is_read: boolean;
  is_clicked: boolean;
  read_at: string | null;
  clicked_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: RideNotification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// WebSocket Messages
export interface WSLocationUpdate {
  type: 'location_update';
  user_id: number;
  ride_id: number;
  latitude: number;
  longitude: number;
  speed_kmh: number | null;
  heading_degrees: number | null;
  timestamp: string;
}

export interface WSRideStatusUpdate {
  type: 'ride_status_update';
  ride_id: number;
  tracking_status: RideTrackingStatus;
  estimated_arrival_time: string | null;
  distance_remaining_km: number | null;
  timestamp: string;
}

export interface WSEmergencyAlert {
  type: 'emergency_alert';
  alert: EmergencyAlert;
  timestamp: string;
}

export interface WSNotification {
  type: 'notification';
  notification: RideNotification;
  timestamp: string;
}

export interface WSError {
  type: 'error';
  error: string;
  code?: string;
  timestamp: string;
}

export type LiveTrackingWSMessage =
  | WSLocationUpdate
  | WSRideStatusUpdate
  | WSEmergencyAlert
  | WSNotification
  | WSError;

// UI State
export interface LiveTrackingState {
  isTracking: boolean;
  currentLocation: LiveLocation | null;
  rideTracking: RideTracking | null;
  locationHistory: LiveLocation[];
  error: string | null;
}

export interface EmergencyState {
  activeAlert: EmergencyAlert | null;
  alertHistory: EmergencyAlert[];
  loading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: RideNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}
