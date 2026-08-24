// Cost Calculator Screen
// Phase 7: Estimate ride costs with detailed breakdown

import React, { useState, useEffect } from 'react';
import { Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { paymentApiService } from '@/services/paymentApi';
import { Ionicons } from '@expo/vector-icons';
import type { CostEstimateResponse, CostEstimateRequest } from '@/types/payment';

export default function CostCalculatorScreen() {
  const router = useRouter();
  
  // Form state
  const [startLat, setStartLat] = useState('');
  const [startLng, setStartLng] = useState('');
  const [endLat, setEndLat] = useState('');
  const [endLng, setEndLng] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [departureTime, setDepartureTime] = useState(new Date());
  
  // Results state
  const [estimate, setEstimate] = useState<CostEstimateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  /**
   * Calculate cost estimate
   */
  const handleCalculate = async () => {
    // Validate inputs
    if (!startLat || !startLng || !endLat || !endLng) {
      Alert.alert('Error', 'Please enter all location coordinates');
      return;
    }
    
    const request: CostEstimateRequest = {
      start_latitude: parseFloat(startLat),
      start_longitude: parseFloat(startLng),
      end_latitude: parseFloat(endLat),
      end_longitude: parseFloat(endLng),
      departure_time: departureTime.toISOString(),
      passengers: parseInt(passengers) || 1,
    };
    
    setLoading(true);
    try {
      const response = await paymentApiService.estimateCost(request);
      if (response.success && response.data) {
        setEstimate(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to calculate cost');
      }
    } catch (error) {
      console.error('Cost calculation error:', error);
      Alert.alert('Error', 'Failed to calculate cost');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Use current location for start
   */
  const useCurrentLocation = () => {
    // TODO: Get actual current location
    Alert.alert('Info', 'Current location feature coming soon');
  };
  
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-2">Cost Calculator</Text>
          <Text className="text-md text-muted-foreground">
            Estimate your ride cost before booking
          </Text>
        </View>
        
        {/* Input Form */}
        <View className="p-4 mb-4">
          <Text className="text-lg font-semibold text-foreground mb-4">Trip Details</Text>
          
          {/* Start Location */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Start Location</Text>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <TextInput
                  placeholder="Latitude"
                  value={startLat}
                  onChangeText={setStartLat}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <TextInput
                  placeholder="Longitude"
                  value={startLng}
                  onChangeText={setStartLng}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={useCurrentLocation}
              className="mt-2 flex-row items-center"
            >
              <Ionicons name="location" size={16} color="#3b82f6" />
              <Text className="text-sm text-blue-500 ml-1">Use current location</Text>
            </TouchableOpacity>
          </View>
          
          {/* End Location */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Destination</Text>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <TextInput
                  placeholder="Latitude"
                  value={endLat}
                  onChangeText={setEndLat}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <TextInput
                  placeholder="Longitude"
                  value={endLng}
                  onChangeText={setEndLng}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
          
          {/* Passengers */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Number of Passengers</Text>
            <TextInput
              placeholder="1"
              value={passengers}
              onChangeText={setPassengers}
              keyboardType="numeric"
            />
          </View>
          
          {/* Calculate Button */}
          <Button
            onPress={handleCalculate}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonText>Calculate Cost</ButtonText>
            )}
          </Button>
        </View>
        
        {/* Cost Estimate Results */}
        {estimate && (
          <>
            {/* Total Cost */}
            <View className="p-6 mb-4 bg-blue-50 dark:bg-blue-900/20">
              <View className="items-center">
                <Text className="text-sm text-muted-foreground mb-2">Estimated Cost</Text>
                <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {estimate.estimated_cost.toFixed(2)} MAD
                </Text>
                <Text className="text-sm text-muted-foreground mt-2">
                  Tier: {estimate.pricing_tier}
                </Text>
              </View>
            </View>
            
            {/* Cost Breakdown */}
            <View className="p-4 mb-4">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Cost Breakdown
              </Text>
              
              {estimate.cost_breakdown && (
                <View className="space-y-2">
                  <CostItem
                    label="Base Cost"
                    value={estimate.cost_breakdown.base_cost}
                  />
                  <CostItem
                    label="Distance Cost"
                    value={estimate.cost_breakdown.distance_cost}
                  />
                  <CostItem
                    label="Time Cost"
                    value={estimate.cost_breakdown.time_cost}
                  />
                  <CostItem
                    label="Fuel Cost"
                    value={estimate.cost_breakdown.fuel_cost}
                  />
                  <CostItem
                    label="Vehicle Wear"
                    value={estimate.cost_breakdown.vehicle_wear_cost}
                  />
                  
                  {estimate.cost_breakdown.demand_multiplier > 1 && (
                    <CostItem
                      label="Demand Multiplier"
                      value={`${estimate.cost_breakdown.demand_multiplier.toFixed(2)}x`}
                      isMultiplier
                    />
                  )}
                  
                  {estimate.cost_breakdown.seasonal_adjustment !== 0 && (
                    <CostItem
                      label="Seasonal Adjustment"
                      value={estimate.cost_breakdown.seasonal_adjustment}
                      isSigned
                    />
                  )}
                  
                  {estimate.cost_breakdown.weather_adjustment !== 0 && (
                    <CostItem
                      label="Weather Adjustment"
                      value={estimate.cost_breakdown.weather_adjustment}
                      isSigned
                    />
                  )}
                  
                  <View className="border-t border-border pt-2 mt-2">
                    <CostItem
                      label="Final Cost"
                      value={estimate.cost_breakdown.final_cost}
                      isTotal
                    />
                  </View>
                </View>
              )}
            </View>
            
            {/* Savings vs Alternatives */}
            {estimate.savings_vs_taxi > 0 && (
              <View className="p-4 mb-4 bg-green-50 dark:bg-green-900/20">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="trending-down" size={20} color="#10b981" />
                  <Text className="text-md font-semibold text-green-600 dark:text-green-400 ml-2">
                    You Save Money!
                  </Text>
                </View>
                <Text className="text-sm text-foreground">
                  Save {estimate.savings_vs_taxi.toFixed(2)} MAD compared to taxi
                </Text>
              </View>
            )}
            
            {/* Alternative Times */}
            {estimate.alternative_times && estimate.alternative_times.length > 0 && (
              <View className="p-4 mb-4">
                <Text className="text-lg font-semibold text-foreground mb-3">
                  Cheaper Times
                </Text>
                {estimate.alternative_times.map((alt, index) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-center py-2 border-b border-border last:border-b-0"
                  >
                    <View>
                      <Text className="text-sm font-medium text-foreground">
                        {new Date(alt.departure_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {alt.reason}
                      </Text>
                    </View>
                    <Text className="text-md font-semibold text-green-600 dark:text-green-400">
                      {alt.estimated_cost.toFixed(2)} MAD
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

/**
 * Cost item row component
 */
function CostItem({
  label,
  value,
  isTotal = false,
  isMultiplier = false,
  isSigned = false,
}: {
  label: string;
  value: number | string;
  isTotal?: boolean;
  isMultiplier?: boolean;
  isSigned?: boolean;
}) {
  const formatValue = () => {
    if (isMultiplier) return value;
    if (typeof value === 'string') return value;
    
    const numValue = value as number;
    if (isSigned) {
      return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)} MAD`;
    }
    return `${numValue.toFixed(2)} MAD`;
  };
  
  return (
    <View className="flex-row justify-between items-center py-1">
      <Text className={`text-sm ${isTotal ? 'font-bold' : ''} text-foreground`}>
        {label}
      </Text>
      <Text className={`text-sm ${isTotal ? 'font-bold' : ''} text-foreground`}>
        {formatValue()}
      </Text>
    </View>
  );
}
