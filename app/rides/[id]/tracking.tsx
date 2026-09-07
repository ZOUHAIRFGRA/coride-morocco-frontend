// Live Tracking Map Screen for Active Rides
// Phase 8: Real-time GPS tracking with driver location

import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Text, Linking } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { liveTrackingApiService } from '@/services/liveTrackingApi';
import { integratedRideService } from '@/services/integratedRideService';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import type { RideTracking, LiveLocation, RideTrackingStatus } from '@/types/liveTracking';
import type { Ride } from '@/types/ride';

export default function LiveTrackingScreen() {
  const { id } = useLocalSearchParams();
  const rideId = parseInt(id as string);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [ride, setRide] = useState<Ride | null>(null);
  const [tracking, setTracking] = useState<RideTracking | null>(null);
  const [driverLocation, setDriverLocation] = useState<LiveLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRide();
    fetchTrackingData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTrackingData, 5000);

    return () => clearInterval(interval);
  }, [rideId]);

  const fetchRide = async () => {
    try {
      const response = await integratedRideService.api.getRideDetails(rideId);
      if (response.success && response.data) {
        setRide(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch ride:', error);
    }
  };

  /**
   * Fetch tracking data
   */
  const fetchTrackingData = async () => {
    try {
      const trackingResponse = await liveTrackingApiService.getRideTracking(rideId);

      if (trackingResponse.success && trackingResponse.data) {
        setTracking(trackingResponse.data);
      }

      // Driver's dedicated live-location feed, when a driver id is known from the ride
      if (ride?.driver_id) {
        const locationResponse = await liveTrackingApiService.getLatestLocation(ride.driver_id);
        if (locationResponse.success && locationResponse.data) {
          setDriverLocation(locationResponse.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Driver's current position — prefer the dedicated live-location feed, fall
  // back to the ride-tracking record's own current_latitude/longitude.
  const driverPosition = driverLocation
    ? { latitude: driverLocation.latitude, longitude: driverLocation.longitude }
    : tracking?.current_latitude != null && tracking?.current_longitude != null
    ? { latitude: tracking.current_latitude, longitude: tracking.current_longitude }
    : null;

  const pickupPosition = ride ? { latitude: ride.start_latitude, longitude: ride.start_longitude } : null;
  const destinationPosition = ride ? { latitude: ride.end_latitude, longitude: ride.end_longitude } : null;
  
  /**
   * Trigger emergency alert
   */
  const handleEmergency = async () => {
    Alert.alert(
      'Emergency Alert',
      'This will notify your emergency contacts and authorities. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            try {
              if (driverPosition) {
                const response = await liveTrackingApiService.triggerPanicButton(
                  driverPosition.latitude,
                  driverPosition.longitude,
                  rideId,
                  'Emergency alert from live tracking'
                );

                if (response.success) {
                  Alert.alert('Alert Sent', 'Emergency services and contacts have been notified');
                }
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to send emergency alert');
            }
          },
        },
      ]
    );
  };
  
  /**
   * Center map on driver location
   */
  const centerOnDriver = () => {
    if (driverLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };
  
  /**
   * Get status color
   */
  const getStatusColor = (status: RideTrackingStatus): string => {
    switch (status) {
      case 'waiting':
        return '#f59e0b';
      case 'en_route_pickup':
        return '#3b82f6';
      case 'picked_up':
        return '#10b981';
      case 'in_transit':
        return '#10b981';
      case 'near_destination':
        return '#8b5cf6';
      case 'arrived':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };
  
  /**
   * Get status text
   */
  const getStatusText = (status: RideTrackingStatus): string => {
    switch (status) {
      case 'waiting':
        return 'Waiting for driver';
      case 'en_route_pickup':
        return 'Driver is on the way';
      case 'picked_up':
        return 'Picked up';
      case 'in_transit':
        return 'On the way to destination';
      case 'near_destination':
        return 'Almost there!';
      case 'arrived':
        return 'Arrived at destination';
      case 'completed':
        return 'Ride completed';
      default:
        return status;
    }
  };
  
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-md text-muted-foreground mt-4">Loading tracking...</Text>
      </View>
    );
  }
  
  if (!tracking) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Ionicons name="map-outline" size={64} color="#9ca3af" />
        <Text className="text-md text-muted-foreground mt-4">Tracking not available</Text>
      </View>
    );
  }
  
  return (
    <View className="flex-1">
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: driverPosition?.latitude ?? pickupPosition?.latitude ?? 33.5731,
          longitude: driverPosition?.longitude ?? pickupPosition?.longitude ?? -7.5898,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Driver Location */}
        {driverPosition && (
          <Marker coordinate={driverPosition} title="Driver">
            <View className="bg-blue-500 p-2 rounded-full">
              <Ionicons name="car" size={24} color="white" />
            </View>
          </Marker>
        )}

        {/* Pickup Location */}
        {pickupPosition && (
          <Marker coordinate={pickupPosition} pinColor="green" title="Pickup" />
        )}

        {/* Destination */}
        {destinationPosition && (
          <Marker coordinate={destinationPosition} pinColor="red" title="Destination" />
        )}

        {/* Route Polyline */}
        {driverPosition && destinationPosition && (
          <Polyline
            coordinates={[driverPosition, destinationPosition]}
            strokeColor="#3b82f6"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 bg-black/40 p-2 rounded-full z-10"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      {/* Status Card */}
      <View className="absolute top-16 left-4 right-4">
        <View className="p-4" style={{ backgroundColor: getStatusColor(tracking.tracking_status) }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">
                {getStatusText(tracking.tracking_status)}
              </Text>
              {tracking.estimated_arrival_time && (
                <Text className="text-sm text-white/90 mt-1">
                  ETA: {new Date(tracking.estimated_arrival_time).toLocaleTimeString()}
                </Text>
              )}
            </View>
            {tracking.distance_to_destination_km !== null && (
              <View className="items-end">
                <Text className="text-xl font-bold text-white">
                  {tracking.distance_to_destination_km.toFixed(1)}
                </Text>
                <Text className="text-xs text-white/90">km away</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {/* Driver Info */}
      {driverLocation && (
        <View className="absolute bottom-24 left-4 right-4">
          <View className="p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-md font-semibold text-foreground">Driver Location</Text>
                <Text className="text-sm text-muted-foreground">
                  Speed: {driverLocation.speed_kmh?.toFixed(0) || 0} km/h
                </Text>
                {driverLocation.battery_level !== null && (
                  <Text className="text-sm text-muted-foreground">
                    Battery: {driverLocation.battery_level}%
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={centerOnDriver}
                className="bg-blue-500 p-3 rounded-full"
              >
                <Ionicons name="locate" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {/* Action Buttons */}
      <View className="absolute bottom-4 left-4 right-4">
        <View className="flex-row gap-2">
          <Button
            onPress={handleEmergency}
            variant="outline"
            className="flex-1 bg-red-500 border-red-500"
          >
            <Ionicons name="warning" size={20} color="white" />
            <ButtonText className="text-white ml-2">Emergency</ButtonText>
          </Button>
          
          {ride?.driver?.phone_number && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${ride.driver?.phone_number}`)}
              className="bg-green-500 p-3 rounded-lg items-center justify-center"
            >
              <Ionicons name="call" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
