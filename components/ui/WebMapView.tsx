import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Import shared MapLocation type for consistency
import type { MapLocation } from './MapView';

export type WebMapLocation = MapLocation;

interface WebMapViewProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  initialLocation?: WebMapLocation;
  interactive?: boolean;
  onLocationSelect?: (location: WebMapLocation) => void;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
  }>;
  height?: number | string;
  showCurrentLocationButton?: boolean;
  style?: any;
}

/**
 * WebView-based map using OpenStreetMap and Leaflet
 * Free alternative that works without API keys or credit cards
 */
export const WebMapView: React.FC<WebMapViewProps> = ({
  initialRegion,
  initialLocation,
  interactive = true,
  onLocationSelect,
  markers = [],
  height = 300,
  showCurrentLocationButton = true,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const { colors, isDarkMode } = useAppTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WebMapLocation | null>(
    initialLocation || null
  );

  // Default region (Casablanca, Morocco)
  const defaultRegion = initialRegion || {
    latitude: 33.5731,
    longitude: -7.5898,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    checkLocationPermissions();
  }, []);

  const checkLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking location permissions:', error);
    }
  };

  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert(
        'Location Permission',
        'Please enable location permissions to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Alert.alert('Please enable location in device settings') }
        ]
      );
      return;
    }

    try {
      setIsLoadingLocation(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Center map on current location
      webViewRef.current?.postMessage(JSON.stringify({
        type: 'setCenter',
        data: currentLocation
      }));

      if (interactive) {
        const locationWithAddress: WebMapLocation = {
          ...currentLocation,
          address: await reverseGeocode(currentLocation.latitude, currentLocation.longitude),
        };

        setSelectedLocation(locationWithAddress);
        onLocationSelect?.(locationWithAddress);

        // Add marker for current location
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'setMarker',
          data: locationWithAddress
        }));
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error getting current location:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Location Error', 'Could not get your current location.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

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

  const handleWebViewMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'mapClick' && interactive) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        const location: WebMapLocation = {
          latitude: message.data.latitude,
          longitude: message.data.longitude,
          address: await reverseGeocode(message.data.latitude, message.data.longitude),
        };

        setSelectedLocation(location);
        onLocationSelect?.(location);
      }
      
      if (message.type === 'mapLoaded') {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  // Generate HTML for the map
  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>CoRide Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          #map { height: 100vh; width: 100vw; }
          .leaflet-control-attribution { display: none; }
          .custom-marker { 
            background: #2563EB; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            width: 20px; 
            height: 20px; 
          }
          .location-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-top: 1px solid #e5e7eb;
            padding: 12px;
            font-size: 14px;
            z-index: 1000;
            display: ${selectedLocation ? 'block' : 'none'};
          }
          .dark .location-info {
            background: #1f2937;
            border-top-color: #374151;
            color: #f9fafb;
          }
        </style>
      </head>
      <body class="${isDarkMode ? 'dark' : ''}">
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          let map, marker;
          
          // Initialize map
          const initMap = () => {
            map = L.map('map', {
              zoomControl: true,
              attributionControl: false
            }).setView([${defaultRegion.latitude}, ${defaultRegion.longitude}], 12);

            // Use OpenStreetMap tiles (free)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 18,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Add click handler
            map.on('click', function(e) {
              if (${interactive}) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'mapClick',
                  data: { latitude: e.latlng.lat, longitude: e.latlng.lng }
                }));
                
                // Update marker
                if (marker) {
                  marker.setLatLng(e.latlng);
                } else {
                  marker = L.marker(e.latlng).addTo(map);
                }
              }
            });

            // Add initial marker if provided
            ${initialLocation ? `
              marker = L.marker([${initialLocation.latitude}, ${initialLocation.longitude}]).addTo(map);
            ` : ''}

            // Add custom markers
            ${markers.map(m => `
              L.marker([${m.latitude}, ${m.longitude}])
                .addTo(map)
                ${m.title || m.description ? `.bindPopup('${(m.title || '') + (m.description ? '<br>' + m.description : '')}')` : ''};
            `).join('\n')}

            // Notify that map is loaded
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));
          };

          // Handle messages from React Native
          window.addEventListener('message', function(event) {
            const message = JSON.parse(event.data);
            
            if (message.type === 'setCenter') {
              map.setView([message.data.latitude, message.data.longitude], 15);
            }
            
            if (message.type === 'setMarker') {
              if (marker) {
                marker.setLatLng([message.data.latitude, message.data.longitude]);
              } else {
                marker = L.marker([message.data.latitude, message.data.longitude]).addTo(map);
              }
            }
          });

          // Initialize when DOM is ready
          document.addEventListener('DOMContentLoaded', initMap);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[{ height, borderRadius: 12, overflow: 'hidden' }, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={{ flex: 1 }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />

      {/* Loading overlay */}
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background.primary,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{
            marginTop: 12,
            color: colors.text.secondary,
            fontFamily: FONTS.regular
          }}>Loading map...</Text>
        </View>
      )}

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
    </View>
  );
};

export default WebMapView;