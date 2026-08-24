// Phase 7: Payment & Cost Management - Type Definitions

// Enums
export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DISPUTED = 'disputed',
  COMPLETED = 'completed',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
}

export enum DisputeType {
  PAYMENT_NOT_RECEIVED = 'payment_not_received',
  INCORRECT_AMOUNT = 'incorrect_amount',
  SERVICE_NOT_PROVIDED = 'service_not_provided',
  RIDE_CANCELLED = 'ride_cancelled',
  OVERCHARGE = 'overcharge',
  OTHER = 'other',
}

export enum PricingTier {
  LOW_DEMAND = 'low_demand',
  NORMAL = 'normal',
  MODERATE = 'moderate',
  HIGH_DEMAND = 'high_demand',
  PEAK = 'peak',
}

// Cost Calculation
export interface CostEstimateRequest {
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  departure_time: string;
  passengers?: number;
  vehicle_consumption_rate?: number;
}

export interface CostBreakdown {
  base_cost: number;
  fuel_cost: number;
  distance_cost: number;
  time_cost: number;
  vehicle_wear_cost: number;
  demand_multiplier: number;
  seasonal_adjustment: number;
  weather_adjustment: number;
  final_cost: number;
}

export interface CostEstimateResponse {
  estimated_cost: number;
  cost_breakdown: CostBreakdown;
  distance_km: number;
  estimated_duration_minutes: number;
  pricing_tier: PricingTier;
  cost_per_passenger: number;
  fuel_price_used: number;
  demand_level: string;
  surge_active: boolean;
  alternative_times?: Array<{
    departure_time: string;
    estimated_cost: number;
    pricing_tier: PricingTier;
  }>;
  savings_vs_taxi: number;
  savings_vs_public_transport: number;
  savings_percentage: number;
  potential_savings: number;
}

// Payment Management
export interface Payment {
  id: number;
  ride_id: number;
  payer_id: number;
  payee_id: number;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_reference: string | null;
  receipt_url: string | null;
  notes: string | null;
  confirmed_by_driver: boolean;
  confirmed_by_rider: boolean;
  driver_confirmed_at: string | null;
  rider_confirmed_at: string | null;
  dispute_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  ride_id: number;
  amount: number;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  receipt_url?: string;
  notes?: string;
}

export interface ConfirmPaymentRequest {
  payment_id: number;
  confirm: boolean;
  notes?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Payment Disputes
export interface PaymentDispute {
  id: number;
  payment_id: number;
  raised_by_id: number;
  raised_by: {
    id: number;
    full_name: string;
    avatar_url: string | null;
  };
  dispute_type: DisputeType;
  status: DisputeStatus;
  description: string;
  evidence_urls: string[];
  admin_notes: string | null;
  resolution_notes: string | null;
  refund_amount: number | null;
  assigned_to_id: number | null;
  resolved_by_id: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDisputeRequest {
  payment_id: number;
  dispute_type: DisputeType;
  description: string;
  evidence_urls?: string[];
}

export interface DisputeListResponse {
  disputes: PaymentDispute[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Payment History & Analytics
export interface PaymentHistory {
  user_id: number;
  total_earned: number;
  total_spent: number;
  completed_payments_as_driver: number;
  completed_payments_as_rider: number;
  total_distance_driven_km: number;
  total_distance_traveled_km: number;
  disputes_raised: number;
  disputes_favorably_resolved: number;
  average_ride_cost: number;
  monthly_breakdown: Record<string, {
    earned: number;
    spent: number;
    rides: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface SavingsCalculation {
  total_rides: number;
  total_spent: number;
  estimated_taxi_cost: number;
  estimated_public_transport_cost: number;
  savings_vs_taxi: number;
  savings_vs_public_transport: number;
  percentage_saved: number;
  co2_savings_kg: number;
  date_range: {
    from: string;
    to: string;
  };
}

// Fuel Prices
export interface FuelPrice {
  id: number;
  fuel_type: 'essence' | 'diesel';
  price_per_liter: number;
  region: string;
  effective_date: string;
  is_official: boolean;
  source: string | null;
  created_at: string;
}

// UI State
export interface PaymentFormData {
  amount: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  receiptUrl: string;
  notes: string;
}

export interface DisputeFormData {
  disputeType: DisputeType;
  description: string;
  evidenceUrls: string[];
}

export interface CostCalculatorState {
  loading: boolean;
  estimate: CostEstimateResponse | null;
  error: string | null;
}

export interface PaymentState {
  payments: Payment[];
  selectedPayment: Payment | null;
  loading: boolean;
  error: string | null;
}

export interface DisputeState {
  disputes: PaymentDispute[];
  selectedDispute: PaymentDispute | null;
  loading: boolean;
  error: string | null;
}
