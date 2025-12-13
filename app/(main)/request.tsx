// Request Ride Screen - For passengers to create ride requests
// Allows passengers to specify their journey needs and find matching drivers

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import LocationPickerModal from '@/components/modals/LocationPickerModal';
import { integratedRideService } from '@/services/integratedRideService';
import type { LocationSuggestion } from '@/types/geospatial';

export default function RequestRideScreen() {
  const { colors } = useAppTheme();
  const [startLocation, setStartLocation] = useState<LocationSuggestion | null>(null);
  const [endLocation, setEndLocation] = useState<LocationSuggestion | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [maxPricePerPerson, setMaxPricePerPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [flexibleTime, setFlexibleTime] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    // Validation
    if (!startLocation || !endLocation) {
      Alert.alert('Missing Information', 'Please select both pickup and destination locations.');
      return;
    }

    if (!departureDate || !departureTime) {
      Alert.alert('Missing Information', 'Please specify your preferred departure date and time.');
      return;
    }

    // Combine date and time into ISO string
    const departureDateTime = new Date(`${departureDate}T${departureTime}`);
    
    // Validate date is in the future
    if (departureDateTime < new Date()) {
      Alert.alert('Invalid Date', 'Departure time must be in the future.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await integratedRideService.api.createRideRequest({
        start_address: startLocation.address,
        start_latitude: startLocation.latitude,
        start_longitude: startLocation.longitude,
        end_address: endLocation.address,
        end_latitude: endLocation.latitude,
        end_longitude: endLocation.longitude,
        departure_time: departureDateTime.toISOString(),
        max_cost_per_person: maxPricePerPerson ? parseFloat(maxPricePerPerson) : 0,
        flexible_time_minutes: flexibleTime ? 30 : undefined,
        notes: notes.trim() || undefined
      });

      if (response.success) {
        Alert.alert(
          'Request Created!',
          'Your ride request has been created. Drivers will be notified and can offer you a ride.',
          [
            {
              text: 'View My Rides',
              onPress: () => router.replace('/rides')
            },
            {
              text: 'Find Available Rides',
              onPress: () => router.replace('/(main)')
            }
          ]
        );

        // Reset form
        setStartLocation(null);
        setEndLocation(null);
        setPassengerCount(1);
        setDepartureDate('');
        setDepartureTime('');
        setMaxPricePerPerson('');
        setNotes('');
        setFlexibleTime(false);
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to create ride request');
      }
    } catch (error) {
      console.error('Error creating ride request:', error);
      Alert.alert('Error', 'Failed to create ride request. Please try again.');
    }

    setIsSubmitting(false);
  };

  // Helper to generate date input (YYYY-MM-DD format)
  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Helper to generate default time (9:00 AM)
  const getDefaultTime = (): string => {
    return '09:00';
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: colors.surface.primary,
          borderBottomColor: colors.border.primary
        }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Request a Ride
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: colors.primary.light + '20' }]}>
            <Ionicons name="information-circle" size={20} color={colors.primary.dark} />
            <Text style={[styles.infoBannerText, { color: colors.primary.dark }]}>
              Create a request and drivers on your route will be notified. They can offer you a ride!
            </Text>
          </View>

          {/* Location Section */}
          <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Journey Details
            </Text>

            {/* Start Location */}
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
              Pickup Location *
            </Text>
            <TouchableOpacity
              style={[styles.locationSelector, { 
                backgroundColor: colors.background.tertiary,
                borderColor: colors.border.primary
              }]}
              onPress={() => setShowStartModal(true)}
            >
              <Ionicons name="location" size={20} color={colors.primary.dark} />
              <View style={styles.locationContent}>
                {startLocation ? (
                  <>
                    <Text style={[styles.locationName, { color: colors.text.primary }]} numberOfLines={1}>
                      {startLocation.display_name}
                    </Text>
                    <Text style={[styles.locationAddress, { color: colors.text.secondary }]} numberOfLines={1}>
                      {startLocation.address}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.locationPlaceholder, { color: colors.text.tertiary }]}>
                    Where do you want to be picked up?
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
            </TouchableOpacity>

            {/* End Location */}
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
              Destination *
            </Text>
            <TouchableOpacity
              style={[styles.locationSelector, { 
                backgroundColor: colors.background.tertiary,
                borderColor: colors.border.primary
              }]}
              onPress={() => setShowEndModal(true)}
            >
              <Ionicons name="flag" size={20} color={colors.primary.dark} />
              <View style={styles.locationContent}>
                {endLocation ? (
                  <>
                    <Text style={[styles.locationName, { color: colors.text.primary }]} numberOfLines={1}>
                      {endLocation.display_name}
                    </Text>
                    <Text style={[styles.locationAddress, { color: colors.text.secondary }]} numberOfLines={1}>
                      {endLocation.address}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.locationPlaceholder, { color: colors.text.tertiary }]}>
                    Where are you going?
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Time and Date Section */}
          <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              When do you want to travel?
            </Text>

            <View style={styles.row}>
              {/* Date Input */}
              <View style={styles.halfWidth}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                  Date *
                </Text>
                <TextInput
                  style={[styles.input, { 
                    color: colors.text.primary,
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.border.primary
                  }]}
                  value={departureDate}
                  onChangeText={setDepartureDate}
                  placeholder={getTomorrowDate()}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>

              {/* Time Input */}
              <View style={styles.halfWidth}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                  Time *
                </Text>
                <TextInput
                  style={[styles.input, { 
                    color: colors.text.primary,
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.border.primary
                  }]}
                  value={departureTime}
                  onChangeText={setDepartureTime}
                  placeholder={getDefaultTime()}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            </View>

            {/* Flexible Time Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleLabel, { color: colors.text.primary }]}>
                    Flexible Time
                  </Text>
                  <Text style={[styles.toggleDescription, { color: colors.text.secondary }]}>
                    Accept rides ±30 minutes
                  </Text>
                </View>
              </View>
              <Switch
                value={flexibleTime}
                onValueChange={setFlexibleTime}
                trackColor={{ false: colors.border.primary, true: colors.primary.light }}
                thumbColor={flexibleTime ? colors.primary.dark : colors.text.tertiary}
              />
            </View>
          </View>

          {/* Passengers and Budget Section */}
          <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Travel Details
            </Text>

            {/* Passenger Count */}
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
              Number of Passengers *
            </Text>
            <View style={styles.passengerControls}>
              <TouchableOpacity
                style={[styles.passengerButton, { 
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.border.primary,
                  opacity: passengerCount <= 1 ? 0.5 : 1
                }]}
                onPress={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                disabled={passengerCount <= 1}
              >
                <Ionicons name="remove" size={20} color={colors.text.primary} />
              </TouchableOpacity>

              <View style={styles.passengerCountContainer}>
                <Text style={[styles.passengerCount, { color: colors.text.primary }]}>
                  {passengerCount}
                </Text>
                <Text style={[styles.passengerLabel, { color: colors.text.secondary }]}>
                  {passengerCount === 1 ? 'passenger' : 'passengers'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.passengerButton, { 
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.border.primary,
                  opacity: passengerCount >= 4 ? 0.5 : 1
                }]}
                onPress={() => setPassengerCount(Math.min(4, passengerCount + 1))}
                disabled={passengerCount >= 4}
              >
                <Ionicons name="add" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Max Price */}
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
              Maximum Price per Person (Optional)
            </Text>
            <View style={[styles.priceInputContainer, { 
              backgroundColor: colors.background.tertiary,
              borderColor: colors.border.primary
            }]}>
              <TextInput
                style={[styles.priceInput, { color: colors.text.primary }]}
                value={maxPricePerPerson}
                onChangeText={setMaxPricePerPerson}
                placeholder="Enter max price"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
              />
              <Text style={[styles.currencyLabel, { color: colors.text.secondary }]}>
                MAD
              </Text>
            </View>
            <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
              Leave empty to see all available rides
            </Text>
          </View>

          {/* Notes Section */}
          <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Additional Notes (Optional)
            </Text>
            <TextInput
              style={[styles.notesInput, { 
                color: colors.text.primary,
                backgroundColor: colors.background.tertiary,
                borderColor: colors.border.primary
              }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special requirements or information for drivers..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { 
              backgroundColor: colors.primary.dark,
              opacity: (!startLocation || !endLocation || !departureDate || !departureTime || isSubmitting) ? 0.5 : 1
            }]}
            onPress={handleSubmitRequest}
            disabled={!startLocation || !endLocation || !departureDate || !departureTime || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Create Ride Request</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.text.tertiary }]}>
            By creating this request, drivers on similar routes will be notified. You'll receive
            notifications when drivers offer to pick you up.
          </Text>
        </ScrollView>
      </SafeAreaView>

      {/* Location Modals */}
      <LocationPickerModal
        visible={showStartModal}
        onClose={() => setShowStartModal(false)}
        onLocationSelect={(location) => {
          setStartLocation(location);
          setShowStartModal(false);
        }}
        title="Select Pickup Location"
        placeholder="Search for pickup location..."
        useCurrentLocation={true}
        showHistory={true}
      />

      <LocationPickerModal
        visible={showEndModal}
        onClose={() => setShowEndModal(false)}
        onLocationSelect={(location) => {
          setEndLocation(location);
          setShowEndModal(false);
        }}
        title="Select Destination"
        placeholder="Search for destination..."
        initialLocation={startLocation || undefined}
        useCurrentLocation={false}
        showHistory={true}
      />
    </>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  locationContent: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
  },
  locationPlaceholder: {
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
  },
  passengerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passengerButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerCountContainer: {
    alignItems: 'center',
  },
  passengerCount: {
    fontSize: 32,
    fontWeight: '600',
  },
  passengerLabel: {
    fontSize: 13,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
  },
  currencyLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
