// Offer Ride Screen - Create ride offers using Phase 4 APIs
// Integrated with Phase 3 geospatial services for intelligent route optimization

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocation } from '@/contexts/AppStateContext';
import { useRideDraft } from '@/contexts/RideDraftContext';
import LocationPickerModal from '@/components/modals/LocationPickerModal';
import { SimpleDatePicker } from '@/components/ui/SimpleDatePicker';
import { SimpleTimePicker } from '@/components/ui/SimpleTimePicker';
import { integratedRideService } from '@/services/integratedRideService';
import { MAX_COST_PER_PERSON } from '@/types/ride';
import type { LocationSuggestion } from '@/types/geospatial';

export default function OfferRideScreen() {
  const { colors } = useAppTheme();

  // Location state (shared draft — persists across Home/Request/Offer)
  const { pickup: startLocation, destination: endLocation, setPickup: setStartLocation, setDestination: setEndLocation, clearDraft } = useRideDraft();
  const { cachedLocation, refreshLocation } = useLocation();
  const [showStartLocationModal, setShowStartLocationModal] = useState(false);
  const [showEndLocationModal, setShowEndLocationModal] = useState(false);
  
  // Ride details state
  const initialDeparture = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
  const [departureDate, setDepartureDate] = useState(() => {
    const y = initialDeparture.getFullYear();
    const m = String(initialDeparture.getMonth() + 1).padStart(2, '0');
    const d = String(initialDeparture.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [departureTimeStr, setDepartureTimeStr] = useState(() => {
    const h = String(initialDeparture.getHours()).padStart(2, '0');
    const min = String(initialDeparture.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
  });
  const [availableSeats, setAvailableSeats] = useState(3);
  const [costPerPerson, setCostPerPerson] = useState(50);
  const [hasManualPrice, setHasManualPrice] = useState(false);
  const [notes, setNotes] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  
  // Preferences state
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [musicPreference, setMusicPreference] = useState('any');
  const [isRecurring, setIsRecurring] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [routeInsights, setRouteInsights] = useState<any>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const todayString = (() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  })();
  const isDepartureDateToday = departureDate === todayString;

  // Get route insights when both locations are selected
  useEffect(() => {
    if (startLocation && endLocation) {
      loadRouteInsights();
    }
  }, [startLocation, endLocation]);

  // Default pickup to the user's current location, like Uber/InDrive, unless
  // something has already been picked (persisted via the shared ride draft).
  useEffect(() => {
    if (startLocation) return;
    if (cachedLocation) {
      setStartLocation({
        display_name: cachedLocation.address,
        address: cachedLocation.address,
        latitude: cachedLocation.latitude,
        longitude: cachedLocation.longitude,
        relevance_score: 1.0,
        distance_km: 0,
        country: 'Morocco',
      });
    } else {
      refreshLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedLocation]);

  const loadRouteInsights = async () => {
    if (!startLocation || !endLocation) return;

    try {
      const insights = await integratedRideService.getRouteInsights(startLocation, endLocation);
      setRouteInsights(insights);

      // Suggest optimal cost based on insights — but never clobber a price
      // the driver has already typed in themselves.
      if (!hasManualPrice) {
        setCostPerPerson(insights.costSuggestion.recommended);
      }
    } catch (error) {
      console.error('Error loading route insights:', error);
    }
  };

  const handleCreateRideOffer = async () => {
    if (!startLocation || !endLocation) {
      Alert.alert('Missing Information', 'Please select both pickup and destination locations.');
      return;
    }

    if (!departureDate || !departureTimeStr) {
      Alert.alert('Missing Information', 'Please specify your departure date and time.');
      return;
    }

    if (availableSeats < 1 || availableSeats > 8) {
      Alert.alert('Invalid Seats', 'Available seats must be between 1 and 8.');
      return;
    }

    if (costPerPerson <= 0) {
      Alert.alert('Invalid Price', 'Cost per person must be greater than 0.');
      return;
    }

    const departureTime = new Date(`${departureDate}T${departureTimeStr}`);
    if (departureTime < new Date()) {
      Alert.alert('Invalid Date', 'Departure time must be in the future.');
      return;
    }

    setIsLoading(true);

    try {
      const rideResponse = await integratedRideService.createSmartRideOffer({
        startLocation,
        endLocation,
        departureTime,
        availableSeats,
        costPerPerson,
        preferences: {
          smokingAllowed,
          petsAllowed,
          musicPreference: musicPreference !== 'any' ? musicPreference : undefined
        },
        notes: notes.trim() || undefined,
        vehicleInfo: vehicleInfo.trim() || undefined,
        isRecurring
      });

      if (rideResponse.success && rideResponse.data) {
        // Reset form — unconditionally, so a stale pickup/destination doesn't
        // leak into Home's rider search or Request Ride regardless of which
        // button below is tapped.
        clearDraft();
        setNotes('');
        setVehicleInfo('');
        setHasManualPrice(false);

        Alert.alert(
          'Ride Offer Created!',
          'Your ride offer has been created successfully. Riders can now find and join your ride.',
          [
            {
              text: 'View My Rides',
              onPress: () => router.push('/rides')
            },
            {
              text: 'Create Another',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          rideResponse.error?.message || 'Failed to create ride offer. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error creating ride offer:', error);
      Alert.alert('Error', 'Failed to create ride offer. Please check your connection and try again.');
    }

    setIsLoading(false);
  };

  const handleSwapLocations = () => {
    if (!startLocation && !endLocation) return;
    const prevStart = startLocation;
    setStartLocation(endLocation);
    setEndLocation(prevStart);
  };

  const renderLocationSelector = (
    location: LocationSuggestion | null,
    placeholder: string,
    onPress: () => void,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <TouchableOpacity
      style={[styles.locationSelector, { 
        backgroundColor: colors.background.tertiary,
        borderColor: colors.border.primary
      }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={colors.primary.dark} />
      <View style={styles.locationContent}>
        {location ? (
          <>
            <Text style={[styles.locationName, { color: colors.text.primary }]} numberOfLines={1}>
              {location.display_name}
            </Text>
            <Text style={[styles.locationAddress, { color: colors.text.secondary }]} numberOfLines={1}>
              {location.address}
            </Text>
          </>
        ) : (
          <Text style={[styles.locationPlaceholder, { color: colors.text.tertiary }]}>
            {placeholder}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.surface.primary,
        borderBottomColor: colors.border.primary
      }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Offer a Ride
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Route Section */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Route Details
          </Text>
          
          {renderLocationSelector(
            startLocation,
            'Select pickup location',
            () => setShowStartLocationModal(true),
            'location-outline'
          )}
          
          <View style={styles.routeSeparator}>
            <View style={[styles.separatorLine, { backgroundColor: colors.border.primary }]} />
            <TouchableOpacity
              style={[styles.swapButton, { backgroundColor: colors.background.primary }]}
              onPress={handleSwapLocations}
            >
              <Ionicons name="swap-vertical" size={16} color={colors.primary.dark} />
            </TouchableOpacity>
          </View>
          
          {renderLocationSelector(
            endLocation,
            'Select destination',
            () => setShowEndLocationModal(true),
            'flag-outline'
          )}

          {/* Route Insights */}
          {routeInsights && (
            <View style={[styles.routeInsights, { backgroundColor: colors.background.secondary }]}>
              <View style={styles.insightRow}>
                <Ionicons name="navigate" size={16} color={colors.primary.dark} />
                <Text style={[styles.insightText, { color: colors.text.secondary }]}>
                  {routeInsights.totalDistance}km • {routeInsights.estimatedDuration} min
                </Text>
              </View>
              <View style={styles.insightRow}>
                <Ionicons name="trending-up" size={16} color={colors.primary.dark} />
                <Text style={[styles.insightText, { color: colors.text.secondary }]}>
                  Suggested: {routeInsights.costSuggestion.recommended} MAD per person
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Timing Section */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Departure Time
          </Text>

          <Text style={[styles.detailLabel, { color: colors.text.secondary, marginBottom: 8 }]}>
            Date *
          </Text>
          <SimpleDatePicker
            value={departureDate}
            onChange={setDepartureDate}
            placeholder="Select departure date"
            minimumDate={new Date()}
          />

          <Text style={[styles.detailLabel, { color: colors.text.secondary, marginTop: 16, marginBottom: 8 }]}>
            Time *
          </Text>
          <SimpleTimePicker
            value={departureTimeStr}
            onChange={setDepartureTimeStr}
            placeholder="Select departure time"
            selectedDate={departureDate ? new Date(`${departureDate}T00:00:00`) : new Date()}
            minimumDateTime={isDepartureDateToday ? new Date() : undefined}
          />
        </View>

        {/* Ride Details Section */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Ride Details
          </Text>
          
          {/* Available Seats */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Available Seats</Text>
            <View style={styles.seatControls}>
              <TouchableOpacity
                style={[styles.seatButton, { 
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border.primary,
                  opacity: availableSeats <= 1 ? 0.5 : 1
                }]}
                onPress={() => setAvailableSeats(Math.max(1, availableSeats - 1))}
                disabled={availableSeats <= 1}
              >
                <Ionicons name="remove" size={16} color={colors.text.primary} />
              </TouchableOpacity>
              
              <Text style={[styles.seatCount, { color: colors.text.primary }]}>
                {availableSeats}
              </Text>
              
              <TouchableOpacity
                style={[styles.seatButton, { 
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border.primary,
                  opacity: availableSeats >= 8 ? 0.5 : 1
                }]}
                onPress={() => setAvailableSeats(Math.min(8, availableSeats + 1))}
                disabled={availableSeats >= 8}
              >
                <Ionicons name="add" size={16} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cost Per Person */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Cost per Person</Text>
            <View style={styles.priceContainer}>
              <TextInput
                style={[styles.priceInput, { 
                  color: colors.text.primary,
                  borderColor: colors.border.primary
                }]}
                value={costPerPerson.toString()}
                onChangeText={(text) => {
                  const price = parseInt(text) || 0;
                  setHasManualPrice(true);
                  setCostPerPerson(Math.min(Math.max(0, price), MAX_COST_PER_PERSON));
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text.tertiary}
              />
              <Text style={[styles.currency, { color: colors.text.secondary }]}>MAD</Text>
            </View>
          </View>

          {/* Total Estimated Cost */}
          <View style={[styles.totalCost, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.totalLabel, { color: colors.text.secondary }]}>
              Total Estimated Revenue
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary.dark }]}>
              {costPerPerson * availableSeats} MAD
            </Text>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Preferences & Notes
            </Text>
            <Ionicons 
              name={showAdvancedOptions ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>

          {showAdvancedOptions && (
            <>
              {/* Preferences Switches */}
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceInfo}>
                  <Text style={[styles.preferenceLabel, { color: colors.text.primary }]}>
                    Smoking Allowed
                  </Text>
                  <Text style={[styles.preferenceDesc, { color: colors.text.secondary }]}>
                    Allow passengers to smoke during the ride
                  </Text>
                </View>
                <Switch
                  value={smokingAllowed}
                  onValueChange={setSmokingAllowed}
                  trackColor={{ false: colors.background.tertiary, true: colors.primary.light }}
                />
              </View>

              <View style={styles.preferenceRow}>
                <View style={styles.preferenceInfo}>
                  <Text style={[styles.preferenceLabel, { color: colors.text.primary }]}>
                    Pets Allowed
                  </Text>
                  <Text style={[styles.preferenceDesc, { color: colors.text.secondary }]}>
                    Allow passengers to bring pets
                  </Text>
                </View>
                <Switch
                  value={petsAllowed}
                  onValueChange={setPetsAllowed}
                  trackColor={{ false: colors.background.tertiary, true: colors.primary.light }}
                />
              </View>

              <View style={styles.preferenceRow}>
                <View style={styles.preferenceInfo}>
                  <Text style={[styles.preferenceLabel, { color: colors.text.primary }]}>
                    Recurring Ride
                  </Text>
                  <Text style={[styles.preferenceDesc, { color: colors.text.secondary }]}>
                    Repeat this ride regularly
                  </Text>
                </View>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: colors.background.tertiary, true: colors.primary.light }}
                />
              </View>

              {/* Music Preference */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                  Music Preference
                </Text>
                <View style={styles.musicChipRow}>
                  {(['any', 'pop', 'rock', 'quiet'] as const).map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.musicChip,
                        {
                          backgroundColor: musicPreference === option ? colors.primary.dark : colors.background.tertiary,
                          borderColor: colors.border.primary,
                        }
                      ]}
                      onPress={() => setMusicPreference(option)}
                    >
                      <Text style={{
                        color: musicPreference === option ? '#FFFFFF' : colors.text.secondary,
                        fontSize: 13,
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                  Additional Notes
                </Text>
                <TextInput
                  style={[styles.textArea, { 
                    color: colors.text.primary,
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.border.primary
                  }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any additional information for passengers..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Vehicle Info Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                  Vehicle Information
                </Text>
                <TextInput
                  style={[styles.textInput, { 
                    color: colors.text.primary,
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.border.primary
                  }]}
                  value={vehicleInfo}
                  onChangeText={setVehicleInfo}
                  placeholder="e.g., Toyota Corolla 2020 - White"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            </>
          )}
        </View>

        {/* Create Offer Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.createButton, { 
              backgroundColor: colors.primary.dark,
              opacity: (!startLocation || !endLocation || isLoading) ? 0.5 : 1
            }]}
            onPress={handleCreateRideOffer}
            disabled={!startLocation || !endLocation || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.createButtonText}>
              {isLoading ? 'Creating Offer...' : 'Create Ride Offer'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Location Selection Modals */}
      <LocationPickerModal
        visible={showStartLocationModal}
        onClose={() => setShowStartLocationModal(false)}
        onLocationSelect={setStartLocation}
        title="Select Pickup Location"
        placeholder="Where will you start your journey?"
        initialLocation={startLocation || undefined}
        useCurrentLocation={true}
        showHistory={true}
      />

      <LocationPickerModal
        visible={showEndLocationModal}
        onClose={() => setShowEndLocationModal(false)}
        onLocationSelect={setEndLocation}
        title="Select Destination"
        placeholder="Where are you going?"
        initialLocation={endLocation || undefined}
        useCurrentLocation={false}
        showHistory={true}
      />
    </SafeAreaView>
  );
}

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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  locationContent: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
  },
  locationPlaceholder: {
    fontSize: 16,
  },
  routeSeparator: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  separatorLine: {
    position: 'absolute',
    left: 32,
    right: 32,
    height: 1,
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInsights: {
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  seatControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatCount: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 80,
  },
  currency: {
    fontSize: 16,
    marginLeft: 8,
  },
  totalCost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  preferenceDesc: {
    fontSize: 14,
    marginTop: 2,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  musicChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  musicChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  buttonContainer: {
    padding: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});