// LocationPickerModal.tsx - Interactive location picker with map and search
// Combines map selection with search autocomplete for better UX

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocation } from '@/contexts/AppStateContext';
import { MapViewComponent, type MapLocation } from '@/components/ui/EnhancedMapView';
import { geospatialService } from '@/services/geospatialService';
import type { LocationSuggestion } from '@/types/geospatial';
import type { Region } from 'react-native-maps';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationSuggestion) => void;
  title?: string;
  placeholder?: string;
  initialLocation?: LocationSuggestion;
  useCurrentLocation?: boolean; // If true, loads user's current location on open
  showHistory?: boolean;
}

const { width, height } = Dimensions.get('window');

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
  title = 'Select Location',
  placeholder = 'Search for a location...',
  initialLocation,
  useCurrentLocation = false,
  showHistory = true
}) => {
  const { colors } = useAppTheme();
  const { cachedLocation, refreshLocation, isLoading: isLoadingCachedLocation, isCacheStale } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(initialLocation || null);
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);
  const [hasLoadedInitialLocation, setHasLoadedInitialLocation] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationSuggestion[]>([]);
  
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Log selected location changes
  useEffect(() => {
    console.log('[LocationPicker] Selected location changed:', selectedLocation?.display_name);
  }, [selectedLocation]);

  // Default region (Morocco center) - zoomed in for city-level view
  const defaultRegion: Region = {
    latitude: 31.7917,
    longitude: -7.0926,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  // Load user's current location on modal open - use cached location for instant display
  useEffect(() => {
    if (visible && !hasLoadedInitialLocation) {
      if (initialLocation) {
        // Use provided initial location if available
        setSelectedLocation(initialLocation);
        setMapLocation({
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          address: initialLocation.address
        });
        setMapRegion({
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } else if (cachedLocation) {
        // Use cached location from context for instant display - NO LOADING NEEDED!
        console.log('Using cached location:', cachedLocation.address);
        const locationData: LocationSuggestion = {
          display_name: cachedLocation.address,
          address: cachedLocation.address,
          latitude: cachedLocation.latitude,
          longitude: cachedLocation.longitude,
          relevance_score: 1.0,
          distance_km: 0,
          country: 'Morocco'
        };
        
        if (useCurrentLocation) {
          setSelectedLocation(locationData);
        }
        
        setMapLocation({
          latitude: cachedLocation.latitude,
          longitude: cachedLocation.longitude,
          address: cachedLocation.address
        });
        
        setMapRegion({
          latitude: cachedLocation.latitude,
          longitude: cachedLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        
        // Optionally refresh location if cache is stale (but don't block UI)
        if (isCacheStale()) {
          console.log('Cache is stale, refreshing in background...');
          refreshLocation();
        }
      } else if (useCurrentLocation) {
        // Fallback: fetch fresh location only if no cache exists
        console.log('No cached location, fetching fresh...');
        loadCurrentLocation();
      }
      setHasLoadedInitialLocation(true);
    }
    
    if (visible && showHistory) {
      loadLocationHistory();
    }
    
    // Reset state when modal closes
    if (!visible) {
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
      setHasLoadedInitialLocation(false);
    }
  }, [visible, cachedLocation, initialLocation, useCurrentLocation]);

  const loadCurrentLocation = async () => {
    setIsLoadingCurrentLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        setIsLoadingCurrentLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get address
      const reverseResponse = await geospatialService.reverseGeocode(latitude, longitude);
      
      if (reverseResponse.success && reverseResponse.data) {
        const data = reverseResponse.data;
        const locationData: LocationSuggestion = {
          display_name: data.formatted_address || data.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          address: data.address || data.formatted_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          latitude,
          longitude,
          relevance_score: 1.0,
          distance_km: 0,
          country: data.country || 'Morocco'
        };
        
        setSelectedLocation(locationData);
        setMapLocation({ latitude, longitude, address: locationData.address });
        
        // Update map region to zoom into user's location (city-level view: ~5-10km radius)
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } else {
        // If reverse geocoding fails, still set the coordinates and zoom
        const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setMapLocation({ latitude, longitude, address: fallbackAddress });
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
    setIsLoadingCurrentLocation(false);
  };

  // Manual refresh location button handler
  const handleRefreshLocation = async () => {
    console.log('Manually refreshing location...');
    setIsLoadingCurrentLocation(true);
    const result = await refreshLocation();
    
    if (result.success && result.data) {
      const locationData: LocationSuggestion = {
        display_name: result.data.address,
        address: result.data.address,
        latitude: result.data.latitude,
        longitude: result.data.longitude,
        relevance_score: 1.0,
        distance_km: 0,
        country: 'Morocco'
      };
      
      setSelectedLocation(locationData);
      setMapLocation({
        latitude: result.data.latitude,
        longitude: result.data.longitude,
        address: result.data.address
      });
      
      setMapRegion({
        latitude: result.data.latitude,
        longitude: result.data.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
    
    setIsLoadingCurrentLocation(false);
  };

  const loadLocationHistory = async () => {
    try {
      const historyResponse = await geospatialService.getLocationHistory(5);
      if (historyResponse.success && historyResponse.data) {
        const historySuggestions: LocationSuggestion[] = historyResponse.data.map(item => ({
          display_name: item.address,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          relevance_score: 0.9,
          distance_km: 0,
          country: 'Morocco'
        }));
        setLocationHistory(historySuggestions);
      }
    } catch (error) {
      console.log('Failed to load location history:', error);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) return;

    setIsLoading(true);
    setShowSearchResults(true);

    try {
      const response = await geospatialService.searchLocation(
        query,
        mapLocation ? { latitude: mapLocation.latitude, longitude: mapLocation.longitude } : undefined,
        10
      );

      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }

    setIsLoading(false);
  };

  const handleLocationSelectFromSearch = (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setMapLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address
    });
    setSearchQuery(location.display_name);
    setShowSearchResults(false);
    
    // Zoom into selected location
    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const handleMapLocationSelect = async (location: MapLocation) => {
    console.log('[LocationPicker] Map location tapped:', location.latitude, location.longitude);
    
    // Immediately update the marker position for instant visual feedback
    const immediateLocation: LocationSuggestion = {
      display_name: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
      address: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
      latitude: location.latitude,
      longitude: location.longitude,
      relevance_score: 1.0,
      distance_km: 0,
      country: 'Morocco'
    };
    
    console.log('[LocationPicker] Setting immediate location for instant feedback');
    setSelectedLocation(immediateLocation);
    setMapLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      address: immediateLocation.address
    });

    // Then reverse geocode to get proper address in background
    try {
      console.log('[LocationPicker] Starting reverse geocode in background...');
      const reverseResponse = await geospatialService.reverseGeocode(
        location.latitude,
        location.longitude
      );

      if (reverseResponse.success && reverseResponse.data) {
        const data = reverseResponse.data;
        const locationData: LocationSuggestion = {
          display_name: data.formatted_address || data.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
          address: data.address || data.formatted_address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
          latitude: location.latitude,
          longitude: location.longitude,
          relevance_score: 1.0,
          distance_km: 0,
          country: data.country || 'Morocco'
        };
        console.log('[LocationPicker] Updating with proper address:', locationData.display_name);
        setSelectedLocation(locationData);
        setSearchQuery(locationData.display_name);
      } else {
        console.log('[LocationPicker] Reverse geocode returned no data, keeping coordinates');
        setSearchQuery(immediateLocation.display_name);
      }
    } catch (error) {
      console.error('[LocationPicker] Reverse geocoding error:', error);
      console.log('[LocationPicker] Keeping coordinate-based location');
      setSearchQuery(immediateLocation.display_name);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: colors.surface.primary,
          borderBottomColor: colors.border.primary
        }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            {title}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface.primary }]}>
          <View style={[styles.searchBar, { 
            backgroundColor: colors.background.tertiary,
            borderColor: colors.border.primary
          }]}>
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={placeholder}
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}>
                <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Current Location Button */}
          <TouchableOpacity
            style={[styles.currentLocationButton, { backgroundColor: colors.primary.light }]}
            onPress={handleRefreshLocation}
            disabled={isLoadingCurrentLocation}
          >
            {isLoadingCurrentLocation ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="locate" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          {mapRegion ? (
            <MapViewComponent
              key={selectedLocation ? `map-${selectedLocation.latitude}-${selectedLocation.longitude}` : 'map-default'}
              initialRegion={mapRegion}
              initialLocation={mapLocation || undefined}
              interactive={true}
              onLocationSelect={handleMapLocationSelect}
              height="100%"
              showCurrentLocationButton={false}
              markers={(() => {
                const markers = selectedLocation
                  ? [
                      {
                        id: `selected-${selectedLocation.latitude}-${selectedLocation.longitude}`,
                        coordinate: {
                          latitude: selectedLocation.latitude,
                          longitude: selectedLocation.longitude,
                        },
                        title: selectedLocation.display_name,
                        description: selectedLocation.address,
                        pinColor: colors.primary.dark,
                      },
                    ]
                  : [];
                console.log('[LocationPicker] Rendering markers:', markers.length, markers[0]?.id);
                return markers;
              })()}
            />
          ) : (
            <View style={[styles.loadingMapContainer, { backgroundColor: colors.background.secondary }]}>
              <ActivityIndicator size="large" color={colors.primary.dark} />
              <Text style={[styles.loadingMapText, { color: colors.text.secondary }]}>
                Loading map...
              </Text>
            </View>
          )}
          
          {/* Map Instruction Overlay */}
          <View style={[styles.mapInstruction, { backgroundColor: colors.surface.primary + 'DD' }]}>
            <Ionicons name="information-circle" size={16} color={colors.primary.dark} />
            <Text style={[styles.mapInstructionText, { color: colors.text.primary }]}>
              Tap on the map to select a location
            </Text>
          </View>
          
          {/* Cache Status Indicator - shown if using stale cache */}
          {cachedLocation && isCacheStale() && (
            <View style={[styles.cacheStatusBadge, { backgroundColor: colors.warning.light + 'DD' }]}>
              <Ionicons name="time-outline" size={14} color="#FFFFFF" />
              <Text style={styles.cacheStatusText}>
                Using cached location • Tap refresh to update
              </Text>
            </View>
          )}
        </View>

        {/* Search Results or History */}
        {showSearchResults ? (
          <View style={[styles.resultsContainer, { backgroundColor: colors.surface.primary }]}>
            <ScrollView
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary.dark} />
                  <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                    Searching...
                  </Text>
                </View>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={`${result.latitude}-${result.longitude}-${index}`}
                    style={[styles.resultItem, { borderBottomColor: colors.border.primary }]}
                    onPress={() => handleLocationSelectFromSearch(result)}
                  >
                    <Ionicons name="location" size={20} color={colors.primary.dark} />
                    <View style={styles.resultTextContainer}>
                      <Text style={[styles.resultName, { color: colors.text.primary }]} numberOfLines={1}>
                        {result.display_name}
                      </Text>
                      <Text style={[styles.resultAddress, { color: colors.text.secondary }]} numberOfLines={1}>
                        {result.address}
                      </Text>
                    </View>
                    {result.distance_km > 0 && (
                      <Text style={[styles.resultDistance, { color: colors.text.tertiary }]}>
                        {result.distance_km.toFixed(1)}km
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
                  <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                    No locations found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        ) : showHistory && locationHistory.length > 0 ? (
          <View style={[styles.resultsContainer, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Recent Locations</Text>
            <ScrollView
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {locationHistory.map((item, index) => (
                <TouchableOpacity
                  key={`history-${index}`}
                  style={[styles.resultItem, { borderBottomColor: colors.border.primary }]}
                  onPress={() => handleLocationSelectFromSearch(item)}
                >
                  <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                  <View style={styles.resultTextContainer}>
                    <Text style={[styles.resultName, { color: colors.text.primary }]} numberOfLines={1}>
                      {item.display_name}
                    </Text>
                    <Text style={[styles.resultAddress, { color: colors.text.secondary }]} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Selected Location Info */}
        {selectedLocation && !showSearchResults && (
          <View style={[styles.selectedLocationContainer, { backgroundColor: colors.surface.primary }]}>
            <View style={styles.selectedLocationInfo}>
              <Ionicons name="location" size={24} color={colors.primary.dark} />
              <View style={styles.selectedLocationText}>
                <Text style={[styles.selectedLocationName, { color: colors.text.primary }]} numberOfLines={1}>
                  {selectedLocation.display_name}
                </Text>
                <Text style={[styles.selectedLocationAddress, { color: colors.text.secondary }]} numberOfLines={2}>
                  {selectedLocation.address}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Confirm Button */}
        <View style={[styles.footer, { backgroundColor: colors.surface.primary }]}>
          <TouchableOpacity
            style={[styles.confirmButton, { 
              backgroundColor: colors.primary.dark,
              opacity: selectedLocation ? 1 : 0.5
            }]}
            onPress={handleConfirm}
            disabled={!selectedLocation}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  currentLocationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMapText: {
    marginTop: 12,
    fontSize: 14,
  },
  mapInstruction: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  mapInstructionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cacheStatusBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 6,
  },
  cacheStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  resultsContainer: {
    maxHeight: height * 0.35,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    gap: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 13,
  },
  resultDistance: {
    fontSize: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  selectedLocationContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  selectedLocationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  selectedLocationText: {
    flex: 1,
  },
  selectedLocationName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedLocationAddress: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationPickerModal;
