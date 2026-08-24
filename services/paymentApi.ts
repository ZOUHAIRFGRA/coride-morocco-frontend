// Payment & Cost Management API Service
// Phase 7: Complete financial management system

import { BaseApiService } from './BaseApiService';
import type {
  CostEstimateRequest,
  CostEstimateResponse,
  Payment,
  CreatePaymentRequest,
  ConfirmPaymentRequest,
  PaymentListResponse,
  PaymentDispute,
  CreateDisputeRequest,
  DisputeListResponse,
  PaymentHistory,
  SavingsCalculation,
  FuelPrice,
} from '../types/payment';
import type { ApiResponse } from './BaseApiService';

class PaymentApiService extends BaseApiService {
  // ==================== Cost Calculation ====================

  /**
   * Calculate estimated ride cost
   */
  async estimateCost(request: CostEstimateRequest): Promise<ApiResponse<CostEstimateResponse>> {
    return this.post<CostEstimateResponse>('/payments/cost/estimate', request);
  }

  // ==================== Payment Management ====================

  /**
   * Create a payment record for a completed ride
   */
  async createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return this.post<Payment>('/payments', data);
  }

  /**
   * Confirm payment (driver or rider)
   */
  async confirmPayment(data: ConfirmPaymentRequest): Promise<ApiResponse<Payment>> {
    return this.post<Payment>(`/payments/${data.payment_id}/confirm`, data);
  }

  /**
   * Get user's payments with filters
   */
  async getPayments(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    payment_method?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<PaymentListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    return this.get<PaymentListResponse>(`/payments?${queryParams.toString()}`);
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: number): Promise<ApiResponse<Payment>> {
    return this.get<Payment>(`/payments/${paymentId}`);
  }

  // ==================== Dispute Management ====================

  /**
   * Create a payment dispute
   */
  async createDispute(data: CreateDisputeRequest): Promise<ApiResponse<PaymentDispute>> {
    return this.post<PaymentDispute>('/payments/disputes', data);
  }

  /**
   * Get user's disputes
   */
  async getDisputes(params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<ApiResponse<DisputeListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.status) queryParams.append('status', params.status);

    return this.get<DisputeListResponse>(`/payments/disputes?${queryParams.toString()}`);
  }

  /**
   * Get dispute by ID
   */
  async getDisputeById(disputeId: number): Promise<ApiResponse<PaymentDispute>> {
    return this.get<PaymentDispute>(`/payments/disputes/${disputeId}`);
  }

  // ==================== Payment History & Analytics ====================

  /**
   * Get user's payment history
   */
  async getPaymentHistory(): Promise<ApiResponse<PaymentHistory>> {
    return this.get<PaymentHistory>('/payments/history');
  }

  /**
   * Calculate savings
   */
  async calculateSavings(params?: {
    from_date?: string;
    to_date?: string;
  }): Promise<ApiResponse<SavingsCalculation>> {
    const queryParams = new URLSearchParams();
    if (params?.from_date) queryParams.append('from_date', params.from_date);
    if (params?.to_date) queryParams.append('to_date', params.to_date);

    return this.get<SavingsCalculation>(`/payments/savings?${queryParams.toString()}`);
  }

  // ==================== Fuel Prices ====================

  /**
   * Get current fuel prices
   */
  async getFuelPrices(params?: {
    fuel_type?: 'essence' | 'diesel';
    region?: string;
  }): Promise<ApiResponse<FuelPrice[]>> {
    const queryParams = new URLSearchParams();
    if (params?.fuel_type) queryParams.append('fuel_type', params.fuel_type);
    if (params?.region) queryParams.append('region', params.region);

    return this.get<FuelPrice[]>(`/payments/fuel-prices?${queryParams.toString()}`);
  }

  // ==================== Helper Methods ====================

  /**
   * Quick cost estimate for a ride
   */
  async quickEstimate(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    passengers: number = 1
  ): Promise<ApiResponse<CostEstimateResponse>> {
    const now = new Date();
    const departureTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    return this.estimateCost({
      start_latitude: startLat,
      start_longitude: startLng,
      end_latitude: endLat,
      end_longitude: endLng,
      departure_time: departureTime.toISOString(),
      passengers,
    });
  }

  /**
   * Confirm payment as driver
   */
  async confirmAsDriver(paymentId: number, notes?: string): Promise<ApiResponse<Payment>> {
    return this.confirmPayment({
      payment_id: paymentId,
      confirm: true,
      notes,
    });
  }

  /**
   * Confirm payment as rider
   */
  async confirmAsRider(paymentId: number, notes?: string): Promise<ApiResponse<Payment>> {
    return this.confirmPayment({
      payment_id: paymentId,
      confirm: true,
      notes,
    });
  }

  /**
   * Get pending payments (waiting for confirmation)
   */
  async getPendingPayments(): Promise<ApiResponse<PaymentListResponse>> {
    return this.getPayments({
      status: 'pending',
      page: 1,
      page_size: 50,
    });
  }

  /**
   * Get disputed payments
   */
  async getDisputedPayments(): Promise<ApiResponse<PaymentListResponse>> {
    return this.getPayments({
      status: 'disputed',
      page: 1,
      page_size: 50,
    });
  }

  /**
   * Get recent payments (last 30 days)
   */
  async getRecentPayments(): Promise<ApiResponse<PaymentListResponse>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return this.getPayments({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      page: 1,
      page_size: 100,
    });
  }

  /**
   * Calculate monthly earnings (for drivers)
   */
  async getMonthlyEarnings(year: number, month: number): Promise<ApiResponse<PaymentListResponse>> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.getPayments({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      page: 1,
      page_size: 1000,
    });
  }

  /**
   * Get year-to-date savings
   */
  async getYearToDateSavings(): Promise<ApiResponse<SavingsCalculation>> {
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const endDate = new Date();

    return this.calculateSavings({
      from_date: startDate.toISOString().split('T')[0],
      to_date: endDate.toISOString().split('T')[0],
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
export const paymentApiService = new PaymentApiService(defaultConfig);

// Export class for testing or custom instances
export { PaymentApiService };
