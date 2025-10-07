// LocationSearchModal.tsx - Smart location search with autocomplete
// Part of CoRide Morocco Phase 3 Geospatial Features

import React, { useState, useCallback, useEffect } from 'react';
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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { geospatialService } from '../../services/geospatialService';
import type { LocationSuggestion } from '../../types/geospatial';

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationSuggestion) => void;
  title?: string;
  placeholder?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  showHistory?: boolean;
  showNearbyPlaces?: boolean;
}

const { width, height } = Dimensions.get('window');

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
  title = 'Search Location',
  placeholder = 'Enter location...',
  currentLocation,
  showHistory = true,
  showNearbyPlaces = true
}) => {
  const { colors } = useAppTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationSuggestion[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'nearby'>('search');

  // Load initial data when modal opens
  useEffect(() => {
    if (visible) {
      loadInitialData();
    } else {
      // Reset state when modal closes
      setSearchQuery('');
      setSearchResults([]);
      setActiveTab('search');
    }
  }, [visible]);

  const loadInitialData = async () => {
    // Load location history if enabled
    if (showHistory) {
      setIsLoadingHistory(true);
      try {
        const historyResponse = await geospatialService.getLocationHistory(10);
        if (historyResponse.success && historyResponse.data) {
          // Convert history items to location suggestions
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
      setIsLoadingHistory(false);
    }

    // Load nearby places if enabled and current location is available
    if (showNearbyPlaces && currentLocation) {
      setIsLoadingNearby(true);
      try {
        const nearbyResponse = await geospatialService.getNearbyPlaces(
          currentLocation.latitude,
          currentLocation.longitude,
          { radius_km: 5, limit: 10 }
        );
        
        if (nearbyResponse.success && nearbyResponse.data) {
          // Convert nearby places to location suggestions
          const nearbySuggestions: LocationSuggestion[] = nearbyResponse.data.map(place => ({
            display_name: place.name,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            relevance_score: 0.8,
            distance_km: place.distance_km,
            country: 'Morocco'
          }));
          setNearbyPlaces(nearbySuggestions);
        }
      } catch (error) {
        console.log('Failed to load nearby places:', error);
      }
      setIsLoadingNearby(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await geospatialService.searchLocations(query, {
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        limit: 10
      });

      setSearchResults(result.suggestions);
      
      if (result.fallbackUsed) {
        console.log('Using fallback search results');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search locations. Please try again.');
    }
    setIsLoading(false);
  }, [currentLocation]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleLocationPress = (location: LocationSuggestion) => {
    onLocationSelect(location);
    onClose();
  };

  const renderLocationItem = (location: LocationSuggestion, showDistance: boolean = false) => (
    <TouchableOpacity
      key={`${location.latitude}_${location.longitude}`}
      style={[styles.locationItem, { 
        backgroundColor: colors.surface.primary,
        borderBottomColor: colors.border.primary
      }]}
      onPress={() => handleLocationPress(location)}
      activeOpacity={0.7}
    >
      <View style={styles.locationIcon}>
        <Ionicons 
          name="location-outline" 
          size={20} 
          color={colors.text.primary} 
        />
      </View>
      
      <View style={styles.locationInfo}>
        <Text style={[styles.locationName, { color: colors.text.primary }]} numberOfLines={1}>
          {location.display_name}
        </Text>
        <Text style={[styles.locationAddress, { color: colors.text.secondary }]} numberOfLines={1}>
          {location.address}
        </Text>
        {showDistance && location.distance_km > 0 && (
          <Text style={[styles.locationDistance, { color: colors.text.tertiary }]}>
            {location.distance_km < 1 
              ? `${Math.round(location.distance_km * 1000)}m away`
              : `${location.distance_km.toFixed(1)}km away`
            }
          </Text>
        )}
      </View>

      <View style={styles.locationChevron}>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={colors.text.tertiary} 
        />
      </View>
    </TouchableOpacity>
  );

  const renderSearchTab = () => (
    <View style={styles.tabContent}>
      {searchQuery === '' ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
          <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
            Start typing to search for locations
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Searching locations...
          </Text>
        </View>
      ) : searchResults.length > 0 ? (
        <ScrollView 
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {searchResults.map(location => renderLocationItem(location))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={48} color={colors.text.tertiary} />
          <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
            No locations found for "{searchQuery}"
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.text.tertiary  }]}>
            Try searching for a city, landmark, or address in Morocco
          </Text>
        </View>
      )}
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      {isLoadingHistory ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Loading history...
          </Text>
        </View>
      ) : locationHistory.length > 0 ? (
        <ScrollView 
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        >
          {locationHistory.map(location => renderLocationItem(location))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={colors.text.tertiary} />
          <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
            No recent locations
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.text.tertiary }]}>
            Your recent searches will appear here
          </Text>
        </View>
      )}
    </View>
  );

  const renderNearbyTab = () => (
    <View style={styles.tabContent}>
      {isLoadingNearby ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Finding nearby places...
          </Text>
        </View>
      ) : nearbyPlaces.length > 0 ? (
        <ScrollView 
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        >
          {nearbyPlaces.map(location => renderLocationItem(location, true))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="navigate-outline" size={48} color={colors.text.tertiary} />
          <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
            No nearby places found
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.text.tertiary }]}>
            {currentLocation ? 'Try adjusting your location or search radius' : 'Enable location to see nearby places'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: colors.surface.primary,
          borderBottomColor: colors.border.primary
        }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            {title}
          </Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Input */}
        <View style={[styles.searchSection, { backgroundColor: colors.surface.primary }]}>
          <View style={[styles.searchContainer, { 
            backgroundColor: colors.background.primary,
            borderColor: colors.border.primary
          }]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={colors.text.secondary} 
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder={placeholder}
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              returnKeyType="search"
              autoCapitalize="words"
              autoCorrect={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabBar, { 
          backgroundColor: colors.surface.primary,
          borderBottomColor: colors.border.primary
        }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'search' && { borderBottomColor: colors.text.primary }
            ]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'search' ? colors.text.primary : colors.text.secondary }
            ]}>
              Search
            </Text>
          </TouchableOpacity>

          {showHistory && (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'history' && { borderBottomColor: colors.text.primary }
              ]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'history' ? colors.text.primary : colors.text.secondary }
              ]}>
                Recent
              </Text>
            </TouchableOpacity>
          )}

          {showNearbyPlaces && currentLocation && (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'nearby' && { borderBottomColor: colors.text.primary }
              ]}
              onPress={() => setActiveTab('nearby')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'nearby' ? colors.text.primary : colors.text.secondary }
              ]}>
                Nearby
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'search' && renderSearchTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'nearby' && renderNearbyTab()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = {
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 12
  },
  closeButton: {
    padding: 4
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginHorizontal: 16
  },
  headerSpacer: {
    width: 32
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0
  },
  clearButton: {
    padding: 4
  },
  tabBar: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center' as const,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const
  },
  content: {
    flex: 1
  },
  tabContent: {
    flex: 1
  },
  resultsList: {
    flex: 1
  },
  locationItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  locationIcon: {
    width: 40,
    alignItems: 'center' as const,
    marginRight: 12
  },
  locationInfo: {
    flex: 1
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 2
  },
  locationAddress: {
    fontSize: 14,
    marginBottom: 2
  },
  locationDistance: {
    fontSize: 12
  },
  locationChevron: {
    marginLeft: 8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 40
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
    paddingVertical: 40
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20
  }
};

export default LocationSearchModal;