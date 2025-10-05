import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { 
  Marker, 
  Region, 
  LatLng, 
  MapPressEvent,
  PROVIDER_DEFAULT 
} from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, FONTS } from '@/constants/theme';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapViewComponentProps {
  /** Initial region to display */
  initialRegion?: Region;
  /** Initial location marker */
  initialLocation?: MapLocation;
  /** Whether the map is interactive (can be touched to select location) */
  interactive?: boolean;
  /** Callback when a location is selected */
  onLocationSelect?: (location: MapLocation) => void;
  /** Custom markers to display */
  markers?: Array<{
    id: string;
    coordinate: LatLng;
    title?: string;
    description?: string;
    pinColor?: string;
  }>;
  /** Map height */
  height?: number | string;
  /** Whether to show current location button */
  showCurrentLocationButton?: boolean;
  /** Custom style */
  style?: any;
  /** Map type */
  mapType?: 'standard' | 'satellite' | 'hybrid';
}

/**
 * Reusable MapView component for CoRide Morocco
 * Supports location selection, markers, and current location
 */
export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  initialRegion,
  initialLocation,
  interactive = true,
  onLocationSelect,
  markers = [],
  height = 300,
  showCurrentLocationButton = true,
  style,
  mapType = 'standard',
}) => {
  // Default region (Casablanca, Morocco)
  const defaultRegion: Region = {
    latitude: 33.5731,
    longitude: -7.5898,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const [region, setRegion] = useState<Region>(initialRegion || defaultRegion);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    initialLocation || null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Check location permissions on mount
  useEffect(() => {
    checkLocationPermissions();
  }, []);

  const checkLocationPermissions = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(foregroundStatus === 'granted');
    } catch (error) {
      console.error('Error checking location permissions:', error);
    }
  };

  // Handle map press for location selection
  const handleMapPress = async (event: MapPressEvent) => {
    if (!interactive) return;

    const coordinate = event.nativeEvent.coordinate;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newLocation: MapLocation = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      address: await reverseGeocode(coordinate.latitude, coordinate.longitude),
    };

    setSelectedLocation(newLocation);
    onLocationSelect?.(newLocation);
  };

  // Get current location
  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert(
        'Location Permission',
        'Please enable location permissions to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Settings', 
            onPress: () => {
              // Open app settings - this would need platform-specific implementation
              Alert.alert('Please enable location in device settings');
            }
          }
        ]
      );
      return;
    }

    try {
      setIsLoadingLocation(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const newRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);

      if (interactive) {
        const currentLocation: MapLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: await reverseGeocode(location.coords.latitude, location.coords.longitude),
        };

        setSelectedLocation(currentLocation);
        onLocationSelect?.(currentLocation);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error getting current location:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Location Error',
        'Could not get your current location. Please try again or select a location on the map.'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result && result.length > 0) {
        const address = result[0];
        return [
          address.name,
          address.street,
          address.district,
          address.city,
          address.region,
          address.country
        ]
          .filter(Boolean)
          .join(', ');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  };

  // Animate to specific location
  const animateToLocation = (location: LatLng, zoom?: number) => {
    const newRegion: Region = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: zoom || 0.005,
      longitudeDelta: zoom || 0.005,
    };
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  return (
    <View style={[{ height, borderRadius: 12, overflow: 'hidden' }, style]}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT}
        mapType={mapType}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={Platform.OS === 'android'}
        loadingEnabled
        loadingIndicatorColor={COLORS.primary.oceanBlue700}
        moveOnMarkerPress={false}
      >
        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Selected Location"
            description={selectedLocation.address}
            pinColor={COLORS.primary.oceanBlue700}
          />
        )}

        {/* Custom markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={marker.pinColor || COLORS.primary.oceanBlue700}
          />
        ))}
      </MapView>

      {/* Controls overlay */}
      <View className="absolute top-2 right-2 bg-white rounded-lg shadow-md">
        {/* Current location button */}
        {showCurrentLocationButton && (
          <TouchableOpacity
            className="p-3"
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={COLORS.primary.oceanBlue700} />
            ) : (
              <Ionicons 
                name="locate" 
                size={20} 
                color={COLORS.primary.oceanBlue700} 
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Location info overlay */}
      {interactive && selectedLocation && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
          <View className="flex-row items-start">
            <Ionicons 
              name="location" 
              size={20} 
              color={COLORS.primary.oceanBlue700} 
              style={{ marginTop: 2, marginRight: 8 }}
            />
            <View className="flex-1">
              <Text 
                className="text-gray-900 font-medium"
                style={{ fontFamily: FONTS.semiBold }}
              >
                Selected Location
              </Text>
              <Text 
                className="text-gray-600 text-sm mt-1"
                style={{ fontFamily: FONTS.regular }}
                numberOfLines={2}
              >
                {selectedLocation.address || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// Export utility functions for external use
export const mapUtils = {
  // Calculate distance between two points (Haversine formula)
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Format coordinates for display
  formatCoordinates: (latitude: number, longitude: number): string => {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  },

  // Check if coordinates are valid
  isValidCoordinate: (latitude: number, longitude: number): boolean => {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  },

  // Morocco bounds for validation
  isInMorocco: (latitude: number, longitude: number): boolean => {
    return (
      latitude >= 21.0 && // Southern boundary
      latitude <= 36.0 && // Northern boundary
      longitude >= -17.0 && // Western boundary
      longitude <= -1.0 // Eastern boundary
    );
  },
};

export default MapViewComponent;