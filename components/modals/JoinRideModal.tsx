// Join Ride Modal - Enhanced booking confirmation with pickup/dropoff selection
// Provides complete ride booking experience with location customization

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { integratedRideService } from '@/services/integratedRideService';
import LocationPickerModal from './LocationPickerModal';
import type { LocationSuggestion } from '@/types/geospatial';
import type { SmartRideMatch } from '@/types/ride';

interface JoinRideModalProps {
  visible: boolean;
  ride: SmartRideMatch | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const JoinRideModal: React.FC<JoinRideModalProps> = ({
  visible,
  ride,
  onClose,
  onSuccess
}) => {
  const { colors } = useAppTheme();
  const [message, setMessage] = useState('');
  const [pickupLocation, setPickupLocation] = useState<LocationSuggestion | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationSuggestion | null>(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDropoffModal, setShowDropoffModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRide = async () => {
    if (!ride) return;

    if (!pickupLocation || !dropoffLocation) {
      Alert.alert('Missing Information', 'Please select both pickup and dropoff locations');
      return;
    }

    setIsJoining(true);

    try {
      const response = await integratedRideService.joinRideWithOptimization(
        ride.id,
        pickupLocation,
        dropoffLocation,
        message.trim() || undefined
      );

      if (response.success) {
        Alert.alert(
          'Success!',
          'Your ride request has been sent to the driver. You will be notified when they respond.',
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess();
                handleClose();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to join ride');
      }
    } catch (error) {
      console.error('Error joining ride:', error);
      Alert.alert('Error', 'Failed to join ride. Please try again.');
    }

    setIsJoining(false);
  };

  const handleClose = () => {
    setMessage('');
    setPickupLocation(null);
    setDropoffLocation(null);
    onClose();
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!ride) return null;

  const driverName = ride.driver ? `${ride.driver.first_name} ${ride.driver.last_name}` : 'Driver';
  const driverInitial = ride.driver?.first_name?.charAt(0)?.toUpperCase() || 'D';

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
          {/* Header */}
          <View style={[styles.header, { 
            backgroundColor: colors.surface.primary,
            borderBottomColor: colors.border.primary
          }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              Join Ride
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Ride Summary */}
            <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Ride Summary
              </Text>

              {/* Driver Info */}
              <View style={styles.driverInfo}>
                <View style={[styles.driverAvatar, { backgroundColor: colors.background.primary }]}>
                  <Text style={[styles.driverInitial, { color: colors.primary.dark }]}>
                    {driverInitial}
                  </Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={[styles.driverName, { color: colors.text.primary }]}>
                    {driverName}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: colors.text.secondary }]}>
                      {ride.driver?.rating_average?.toFixed(1) || '--'} ({ride.driver?.rating_count || 0})
                    </Text>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.priceValue, { color: colors.primary.dark }]}>
                    {ride.cost_per_person} MAD
                  </Text>
                  <Text style={[styles.priceLabel, { color: colors.text.secondary }]}>
                    per seat
                  </Text>
                </View>
              </View>

              {/* Route */}
              <View style={styles.routeInfo}>
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: colors.primary.light }]} />
                  <Text style={[styles.routeText, { color: colors.text.primary }]} numberOfLines={2}>
                    {ride.start_address}
                  </Text>
                </View>
                <View style={[styles.routeLine, { backgroundColor: colors.border.primary }]} />
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: colors.primary.dark }]} />
                  <Text style={[styles.routeText, { color: colors.text.primary }]} numberOfLines={2}>
                    {ride.end_address}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
                  <Text style={[styles.detailText, { color: colors.text.secondary }]}>
                    {formatDateTime(ride.departure_time)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="people-outline" size={16} color={colors.text.secondary} />
                  <Text style={[styles.detailText, { color: colors.text.secondary }]}>
                    {ride.available_seats} seats left
                  </Text>
                </View>
              </View>

              {/* Match Score */}
              <View style={[styles.matchBadge, { backgroundColor: colors.background.secondary }]}>
                <Ionicons name="analytics" size={16} color={colors.primary.dark} />
                <Text style={[styles.matchText, { color: colors.primary.dark }]}>
                  {Math.round(ride.matchScore * 100)}% match with your route
                </Text>
              </View>
            </View>

            {/* Pickup Location */}
            <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Your Pickup Location
              </Text>
              <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
                Where should the driver pick you up?
              </Text>

              <TouchableOpacity
                style={[styles.locationSelector, { 
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.border.primary
                }]}
                onPress={() => setShowPickupModal(true)}
              >
                <Ionicons name="location" size={20} color={colors.primary.dark} />
                <View style={styles.locationContent}>
                  {pickupLocation ? (
                    <>
                      <Text style={[styles.locationName, { color: colors.text.primary }]} numberOfLines={1}>
                        {pickupLocation.display_name}
                      </Text>
                      <Text style={[styles.locationAddress, { color: colors.text.secondary }]} numberOfLines={1}>
                        {pickupLocation.address}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.locationPlaceholder, { color: colors.text.tertiary }]}>
                      Select pickup location
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Dropoff Location */}
            <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Your Dropoff Location
              </Text>
              <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
                Where do you want to be dropped off?
              </Text>

              <TouchableOpacity
                style={[styles.locationSelector, { 
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.border.primary
                }]}
                onPress={() => setShowDropoffModal(true)}
              >
                <Ionicons name="flag" size={20} color={colors.primary.dark} />
                <View style={styles.locationContent}>
                  {dropoffLocation ? (
                    <>
                      <Text style={[styles.locationName, { color: colors.text.primary }]} numberOfLines={1}>
                        {dropoffLocation.display_name}
                      </Text>
                      <Text style={[styles.locationAddress, { color: colors.text.secondary }]} numberOfLines={1}>
                        {dropoffLocation.address}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.locationPlaceholder, { color: colors.text.tertiary }]}>
                      Select dropoff location
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Message to Driver */}
            <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Message to Driver (Optional)
              </Text>
              <TextInput
                style={[styles.messageInput, { 
                  color: colors.text.primary,
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.border.primary
                }]}
                value={message}
                onChangeText={setMessage}
                placeholder="Hi! I'd like to join your ride..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Join Button */}
            <TouchableOpacity
              style={[styles.joinButton, { 
                backgroundColor: colors.primary.dark,
                opacity: (!pickupLocation || !dropoffLocation || isJoining) ? 0.5 : 1
              }]}
              onPress={handleJoinRide}
              disabled={!pickupLocation || !dropoffLocation || isJoining}
            >
              {isJoining ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.joinButtonText}>Send Request to Driver</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={[styles.disclaimer, { color: colors.text.tertiary }]}>
              Your request will be sent to the driver. They will review and either accept or decline.
              You'll be notified of their decision.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Location Selection Modals */}
      <LocationPickerModal
        visible={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        onLocationSelect={(location) => {
          setPickupLocation(location);
          setShowPickupModal(false);
        }}
        title="Select Pickup Location"
        placeholder="Where should the driver pick you up?"
        useCurrentLocation={true}
        showHistory={true}
      />

      <LocationPickerModal
        visible={showDropoffModal}
        onClose={() => setShowDropoffModal(false)}
        onLocationSelect={(location) => {
          setDropoffLocation(location);
          setShowDropoffModal(false);
        }}
        title="Select Dropoff Location"
        placeholder="Where do you want to be dropped off?"
        initialLocation={pickupLocation || undefined}
        useCurrentLocation={false}
        showHistory={true}
      />
    </>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 20,
    fontWeight: '600',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceLabel: {
    fontSize: 10,
  },
  routeInfo: {
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 16,
    marginLeft: 3,
    marginVertical: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '600',
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
  messageInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
  },
  joinButton: {
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
  joinButtonText: {
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

export default JoinRideModal;
