// Ride Management types for CoRide Morocco Phase 4
// Based on the Phase 4 API documentation

// ============== Core Ride Types ==============

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  rating_average: number;
  rating_count: number;
  profile_photo_url?: string;
}

export interface Ride {
  id: number;
  driver_id: number;
  rider_id?: number | null;
  start_address: string;
  end_address: string;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  departure_time: string;
  arrival_time_estimated?: string | null;
  available_seats: number;
  occupied_seats: number;
  estimated_cost: number;
  cost_per_person: number;
  status: RideStatus;
  is_recurring: boolean;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  music_preferences?: string | null;
  notes?: string | null;
  vehicle_info?: string | null;
  created_at: string;
  distance_km?: number;
  driver?: User;
  rider?: User | null;
}

export type RideStatus = 
  | 'offered'
  | 'requested'
  | 'matched'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// ============== Request Types ==============

export interface CreateRideOfferRequest {
  start_address: string;
  end_address: string;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  departure_time: string;
  available_seats: number;
  estimated_cost: number;
  cost_per_person: number;
  is_recurring?: boolean;
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  music_preferences?: string;
  notes?: string;
  vehicle_info?: string;
}

export interface CreateRideRequestRequest {
  start_address: string;
  end_address: string;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  departure_time: string;
  flexible_time_minutes?: number;
  max_cost_per_person: number;
  notes?: string;
}

export interface SearchRidesRequest {
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  departure_date: string;
  departure_time_from?: string;
  departure_time_to?: string;
  max_distance_km?: number;
  max_cost_per_person?: number;
  available_seats_min?: number;
  smoking_allowed?: boolean | null;
  pets_allowed?: boolean | null;
  sort_by?: 'departure_time' | 'distance' | 'price' | 'created_at';
  limit?: number;
}

export interface JoinRideRequest {
  message?: string;
  pickup_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_address?: string;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
}

export interface UpdateRideStatusRequest {
  new_status: RideStatus;
}

// ============== Response Types ==============

export interface JoinRideResponse {
  message: string;
  ride_id: number;
  status: RideStatus;
  driver_contact: {
    name: string;
    rating: number;
  };
}

export interface UpdateRideStatusResponse {
  message: string;
  ride_id: number;
  new_status: RideStatus;
}

export interface CancelRideResponse {
  message: string;
  ride_id: number;
  status: RideStatus;
}

export interface RideHealthResponse {
  status: string;
  service: string;
  endpoints: string[];
  features: string[];
  timestamp: string;
}

// ============== Query Parameters ==============

export interface RideQueryParams {
  status_filter?: RideStatus;
  limit?: number;
  offset?: number;
}

// ============== Error Types ==============

export interface RideError {
  message: string;
  error_code: string;
  details?: {
    field_errors?: Record<string, string[]>;
    total_errors?: number;
  };
  type: 'validation_error' | 'ride_error' | 'http_error';
}

// ============== Utility Types ==============

export interface RideFilters {
  status?: RideStatus;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  seatsMin?: number;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
}

export interface RideStats {
  totalOffered: number;
  totalRequested: number;
  totalMatched: number;
  totalCompleted: number;
  totalCancelled: number;
  averageCost: number;
  averageRating: number;
}

// ============== UI Helper Types ==============

export interface RideCardData {
  id: number;
  driverName: string;
  driverRating: number;
  driverPhoto?: string;
  route: {
    from: string;
    to: string;
    distance: number;
  };
  timing: {
    departure: string;
    arrival?: string;
    duration?: number;
  };
  pricing: {
    costPerSeat: number;
    totalCost: number;
  };
  availability: {
    availableSeats: number;
    occupiedSeats: number;
  };
  preferences: {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    musicPreference?: string;
  };
  status: RideStatus;
  notes?: string;
  vehicleInfo?: string;
}

// ============== Form Types ==============

export interface RideOfferFormData {
  startLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  endLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  departureTime: Date;
  availableSeats: number;
  costPerPerson: number;
  preferences: {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    musicPreference: string;
  };
  notes: string;
  vehicleInfo: string;
  isRecurring: boolean;
}

export interface RideSearchFormData {
  startLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  endLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  departureDate: Date;
  timeRange: {
    from: string;
    to: string;
  };
  maxDistance: number;
  maxPrice: number;
  minSeats: number;
  preferences: {
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
  };
}

// ============== Integration Types ==============

export interface RideWithGeospatial extends Ride {
  routeInfo?: {
    distance: number;
    estimatedDuration: number;
    optimalRoute: Array<{lat: number; lng: number}>;
    trafficConditions: 'light' | 'moderate' | 'heavy';
  };
  compatibilityScore?: number;
  pickupDistance?: number;
  detourDistance?: number;
}

export interface SmartRideMatch extends Ride {
  matchScore: number;
  routeCompatibility: number;
  timeCompatibility: number;
  priceCompatibility: number;
  preferencesMatch: number;
  distanceFromUser: number;
}

// ============== Constants ==============

export const RIDE_STATUS_LABELS: Record<RideStatus, string> = {
  offered: 'Available',
  requested: 'Requested',
  matched: 'Matched',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const RIDE_STATUS_COLORS: Record<RideStatus, string> = {
  offered: '#10B981', // green
  requested: '#3B82F6', // blue
  matched: '#F59E0B', // yellow
  in_progress: '#8B5CF6', // purple
  completed: '#06B6D4', // cyan
  cancelled: '#EF4444' // red
};

export const MAX_SEATS = 8;
export const MIN_SEATS = 1;
export const MAX_DISTANCE_KM = 50;
export const MAX_COST_PER_PERSON = 1000; // MAD