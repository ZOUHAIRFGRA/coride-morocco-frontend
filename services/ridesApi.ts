// Rides API Service for CoRide Morocco
// Demonstrates usage of BaseApiService for ride-related endpoints

import { ApiResponse, BaseApiService, defaultApiConfig } from './BaseApiService';

// Types for rides (you can move these to types folder later)
export interface Ride {
  id: number;
  driver_id: number;
  origin: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateRideRequest {
  origin_latitude: number;
  origin_longitude: number;
  origin_address: string;
  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  description?: string;
}

export interface RideSearchParams {
  origin_latitude?: number;
  origin_longitude?: number;
  destination_latitude?: number;
  destination_longitude?: number;
  departure_date?: string;
  max_price?: number;
  min_seats?: number;
  radius?: number; // km
}

export interface BookingRequest {
  ride_id: number;
  seats_requested: number;
  message?: string;
}

class RidesApiService extends BaseApiService {
  constructor() {
    super(defaultApiConfig);
  }

  /**
   * Create a new ride
   */
  async createRide(rideData: CreateRideRequest): Promise<ApiResponse<Ride>> {
    return this.post<Ride>('/rides', rideData);
  }

  /**
   * Get user's rides (as driver or passenger)
   */
  async getMyRides(): Promise<ApiResponse<Ride[]>> {
    return this.get<Ride[]>('/rides/my-rides');
  }

  /**
   * Search for available rides
   */
  async searchRides(params: RideSearchParams): Promise<ApiResponse<Ride[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/rides/search?${queryParams.toString()}`;
    return this.get<Ride[]>(endpoint);
  }

  /**
   * Get ride by ID
   */
  async getRideById(rideId: number): Promise<ApiResponse<Ride>> {
    return this.get<Ride>(`/rides/${rideId}`);
  }

  /**
   * Update ride
   */
  async updateRide(rideId: number, updates: Partial<CreateRideRequest>): Promise<ApiResponse<Ride>> {
    return this.put<Ride>(`/rides/${rideId}`, updates);
  }

  /**
   * Cancel ride
   */
  async cancelRide(rideId: number): Promise<ApiResponse<{ message: string }>> {
    return this.delete<{ message: string }>(`/rides/${rideId}`);
  }

  /**
   * Book a ride
   */
  async bookRide(bookingData: BookingRequest): Promise<ApiResponse<{ booking_id: number; message: string }>> {
    return this.post<{ booking_id: number; message: string }>('/bookings', bookingData);
  }

  /**
   * Get ride bookings (for drivers)
   */
  async getRideBookings(rideId: number): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`/rides/${rideId}/bookings`);
  }

  /**
   * Accept/reject booking
   */
  async updateBookingStatus(
    bookingId: number, 
    status: 'accepted' | 'rejected'
  ): Promise<ApiResponse<{ message: string }>> {
    return this.patch<{ message: string }>(`/bookings/${bookingId}`, { status });
  }
}

export const ridesApiService = new RidesApiService();
export default ridesApiService;