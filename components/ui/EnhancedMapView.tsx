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
import { useAppTheme } from '@/hooks/useAppTheme';
import WebMapView from './WebMapView';

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
  /** Force fallback mode (useful for testing or Android without Google Play Services) */
  forceFallback?: boolean;
}

/**
 * Enhanced MapView component with multiple fallback strategies:
 * 1. React Native Maps (primary - works on iOS, Android with Google Play Services)
 * 2. WebView + OpenStreetMap/Leaflet (fallback - works everywhere, no API key needed)
 * 3. Static map image (final fallback - for extreme cases)
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
  forceFallback = false,
}) => {
  const { colors, isDarkMode } = useAppTheme();
  const [mapProvider, setMapProvider] = useState<'native' | 'web' | 'static'>('native');
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

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

  // Determine which map to use
  useEffect(() => {
    if (forceFallback) {
      setMapProvider('web');
      return;
    }

    // Try to use native maps first
    setMapProvider('native');
    
    // Set a timeout to detect if native maps fail to load
    const errorTimeout = setTimeout(() => {
      if (!isMapReady && mapProvider === 'native') {
        console.log('Native maps taking too long to load, falling back to web maps');
        handleMapError('Native maps failed to load within timeout');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(errorTimeout);
  }, [forceFallback, isMapReady, mapProvider]);

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

  // Handle native map errors and fallback
  const handleMapError = (error: any) => {
    console.error('Native map error:', error);
    setMapError('Native map failed to load');
    
    // Fallback to web map
    setTimeout(() => {
      setMapProvider('web');
      setMapError(null);
    }, 1000);
  };

  // Handle map press for location selection (native maps)
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

  // Handle web map location selection
  const handleWebLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
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
      
      // Animate to location based on map provider
      if (mapProvider === 'native' && mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

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

  // Convert markers format for web map
  const webMarkers = markers.map(marker => ({
    id: marker.id,
    latitude: marker.coordinate.latitude,
    longitude: marker.coordinate.longitude,
    title: marker.title,
    description: marker.description,
  }));

  // Render provider indicator
  const renderProviderIndicator = () => (
    <View style={{
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: colors.background.secondary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      <View style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: mapProvider === 'native' ? '#10B981' : '#F59E0B',
        marginRight: 6,
      }} />
      <Text style={{
        fontSize: 12,
        color: colors.text.secondary,
        fontFamily: FONTS.regular,
      }}>
        {mapProvider === 'native' ? 'Native Maps' : mapProvider === 'web' ? 'Web Maps' : 'Static Map'}
      </Text>
    </View>
  );

  // Render native map
  const renderNativeMap = () => (
    <>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT}
        mapType={mapType}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        onMapReady={() => setIsMapReady(true)}
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
      <View style={{ position: 'absolute', top: 12, right: 12 }}>
        {showCurrentLocationButton && (
          <TouchableOpacity
            style={{
              backgroundColor: colors.background.primary,
              borderRadius: 8,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
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
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: colors.border.primary,
          padding: 12
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons 
              name="location" 
              size={20} 
              color={COLORS.primary.oceanBlue700} 
              style={{ marginTop: 2, marginRight: 8 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.text.primary,
                fontFamily: FONTS.semiBold,
                fontWeight: '500'
              }}>
                Selected Location
              </Text>
              <Text style={{
                color: colors.text.secondary,
                fontSize: 14,
                marginTop: 4,
                fontFamily: FONTS.regular
              }} numberOfLines={2}>
                {selectedLocation.address || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}
              </Text>
            </View>
          </View>
        </View>
      )}
    </>
  );

  // Render web map
  const renderWebMap = () => (
    <WebMapView
      initialRegion={region}
      initialLocation={selectedLocation || undefined}
      interactive={interactive}
      onLocationSelect={handleWebLocationSelect}
      markers={webMarkers}
      height="100%"
      showCurrentLocationButton={showCurrentLocationButton}
      style={{ flex: 1 }}
    />
  );

  // Render error message with manual fallback option
  const renderMapError = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      padding: 20,
    }}>
      <Ionicons name="map-outline" size={60} color={colors.text.tertiary} />
      <Text style={{
        color: colors.text.primary,
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
      }}>
        Map Loading Issue
      </Text>
      <Text style={{
        color: colors.text.secondary,
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
      }}>
        {mapError}
      </Text>
      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: COLORS.primary.oceanBlue700,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 8,
        }}
        onPress={() => {
          setMapProvider('web');
          setMapError(null);
        }}
      >
        <Text style={{
          color: 'white',
          fontWeight: '600',
        }}>
          Try Alternative Map
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[{ height, borderRadius: 12, overflow: 'hidden' }, style]}>
      {mapError ? renderMapError() : (
        <>
          {mapProvider === 'native' && renderNativeMap()}
          {mapProvider === 'web' && renderWebMap()}
          {renderProviderIndicator()}
        </>
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