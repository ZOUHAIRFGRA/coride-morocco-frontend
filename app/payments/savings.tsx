// Savings Calculator Screen
// Phase 7: Show money saved vs alternatives

import React, { useState, useEffect } from 'react';
import { Text,View, ScrollView, ActivityIndicator } from 'react-native';
import { paymentApiService } from '@/services/paymentApi';
import { Ionicons } from '@expo/vector-icons';
import type { SavingsCalculation } from '@/types/payment';

export default function SavingsScreen() {
  const [savings, setSavings] = useState<SavingsCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSavings();
  }, []);
  
  /**
   * Fetch savings calculation
   */
  const fetchSavings = async () => {
    setLoading(true);
    try {
      const response = await paymentApiService.getYearToDateSavings();
      if (response.success && response.data) {
        setSavings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch savings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  if (!savings) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-md text-muted-foreground">No savings data available</Text>
      </View>
    );
  }
  
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-2">Your Savings</Text>
          <Text className="text-md text-muted-foreground">
            Year to Date ({new Date().getFullYear()})
          </Text>
        </View>
        
        {/* Total Savings */}
        <View className="p-6 mb-4 bg-green-50 dark:bg-green-900/20">
          <View className="items-center">
            <Ionicons name="trending-down" size={48} color="#10b981" />
            <Text className="text-sm text-muted-foreground mt-4 mb-2">Saved vs Taxi</Text>
            <Text className="text-5xl font-bold text-green-600 dark:text-green-400">
              {savings.savings_vs_taxi.toFixed(0)}
            </Text>
            <Text className="text-xl text-green-600 dark:text-green-400">MAD</Text>

            {savings.percentage_saved > 0 && (
              <Text className="text-md text-muted-foreground mt-4">
                {savings.percentage_saved.toFixed(1)}% savings rate
              </Text>
            )}
          </View>
        </View>

        {/* Comparison Views */}
        <View className="space-y-4">
          {/* vs Taxi */}
          <View className="p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="car" size={24} color="#f59e0b" />
              <Text className="text-lg font-semibold text-foreground ml-2">
                vs Regular Taxi
              </Text>
            </View>

            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Taxi Cost</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {savings.estimated_taxi_cost.toFixed(2)} MAD
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">CoRide Cost</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {savings.total_spent.toFixed(2)} MAD
                </Text>
              </View>
              <View className="border-t border-border pt-2 flex-row justify-between">
                <Text className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Saved
                </Text>
                <Text className="text-sm font-bold text-green-600 dark:text-green-400">
                  {savings.savings_vs_taxi.toFixed(2)} MAD
                </Text>
              </View>
            </View>
          </View>

          {/* vs Public Transport */}
          <View className="p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bus" size={24} color="#3b82f6" />
              <Text className="text-lg font-semibold text-foreground ml-2">
                vs Public Transport
              </Text>
            </View>

            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Public Transport Cost</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {savings.estimated_public_transport_cost.toFixed(2)} MAD
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">CoRide Cost</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {savings.total_spent.toFixed(2)} MAD
                </Text>
              </View>
              <View className="border-t border-border pt-2 flex-row justify-between">
                <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {savings.savings_vs_public_transport >= 0 ? 'Saved' : 'Additional Cost'}
                </Text>
                <Text className={`text-sm font-bold ${
                  savings.savings_vs_public_transport >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {Math.abs(savings.savings_vs_public_transport).toFixed(2)} MAD
                </Text>
              </View>
            </View>

            <View className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <Text className="text-xs text-blue-700 dark:text-blue-300">
                💡 Public transport is cheaper but less convenient. CoRide offers door-to-door service!
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-4 mt-4">
          <View className="flex-1 p-4">
            <Text className="text-sm text-muted-foreground mb-1">Total Rides</Text>
            <Text className="text-2xl font-bold text-foreground">
              {savings.total_rides}
            </Text>
          </View>

          <View className="flex-1 p-4">
            <Text className="text-sm text-muted-foreground mb-1">CO₂ Saved</Text>
            <Text className="text-2xl font-bold text-foreground">
              {savings.co2_savings_kg.toFixed(1)}
            </Text>
            <Text className="text-xs text-muted-foreground">kg</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
