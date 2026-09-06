// Ride Detail Screen - Complete ride information and management
// Shows full ride details, driver/rider info, route map, and action buttons

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/contexts/AppStateContext';
import { integratedRideService } from '@/services/integratedRideService';
import { getStatusColor, getStatusIcon, getStatusLabel } from '@/utils/rideStatus';
import type { Ride, RideStatus } from '@/types/ride';

export default function RideDetailScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadRideDetails();
    }
  }, [id]);

  const loadRideDetails = async () => {
    setIsLoading(true);
    try {
      const response = await integratedRideService.api.getRideDetails(parseInt(id));
      if (response.success && response.data) {
        setRide(response.data);
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to load ride details');
        router.back();
      }
    } catch (error) {
      console.error('Error loading ride details:', error);
      Alert.alert('Error', 'Failed to load ride details');
      router.back();
    }
    setIsLoading(false);
  };

  const handleUpdateStatus = async (newStatus: RideStatus) => {
    if (!ride) return;

    const statusMessages: Record<RideStatus, string> = {
      offered: 'Are you sure you want to mark this ride as offered?',
      requested: 'Are you sure you want to mark this ride as requested?',
      matched: 'Are you sure you want to mark this ride as matched?',
      in_progress: 'Start this ride now?',
      completed: 'Mark this ride as completed?',
      cancelled: 'Cancel this ride? This action cannot be undone.'
    };

    Alert.alert(
      'Update Ride Status',
      statusMessages[newStatus],
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            setIsUpdating(true);
            try {
              const response = await integratedRideService.updateRideStatusWithTracking(ride.id, newStatus);
              if (response.success) {
                Alert.alert('Success', `Ride status updated to ${newStatus}`);
                loadRideDetails();
              } else {
                Alert.alert('Error', response.error?.message || 'Failed to update status');
              }
            } catch (error) {
              console.error('Error updating status:', error);
              Alert.alert('Error', 'Failed to update ride status');
            }
            setIsUpdating(false);
          }
        }
      ]
    );
  };

  const handleCancelRide = async () => {
    if (!ride) return;

    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsUpdating(true);
            try {
              const response = await integratedRideService.api.cancelRide(ride.id);
              if (response.success) {
                Alert.alert('Success', 'Ride cancelled successfully', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              } else {
                Alert.alert('Error', response.error?.message || 'Failed to cancel ride');
              }
            } catch (error) {
              console.error('Error cancelling ride:', error);
              Alert.alert('Error', 'Failed to cancel ride');
            }
            setIsUpdating(false);
          }
        }
      ]
    );
  };

  const handleContactUser = (phoneNumber?: string) => {
    if (!phoneNumber) {
      Alert.alert('Contact Info', 'Phone number not available');
      return;
    }
    
    Alert.alert(
      'Contact',
      'How would you like to contact?',
      [
        {
          text: 'Call',
          onPress: () => Linking.openURL(`tel:${phoneNumber}`)
        },
        {
          text: 'WhatsApp',
          onPress: () => Linking.openURL(`whatsapp://send?phone=${phoneNumber}`)
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const formatDateTime = (dateString: string): { date: string; time: string } => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.dark} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Loading ride details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ride) {
    return null;
  }

  const statusColor = getStatusColor(ride.status, colors);
  const statusIcon = getStatusIcon(ride.status);

  const minLat = Math.min(ride.start_latitude, ride.end_latitude);
  const maxLat = Math.max(ride.start_latitude, ride.end_latitude);
  const minLng = Math.min(ride.start_longitude, ride.end_longitude);
  const maxLng = Math.max(ride.start_longitude, ride.end_longitude);
  const mapRegion = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.8, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.8, 0.02),
  };

  const departureDateTime = formatDateTime(ride.departure_time);
  const arrivalDateTime = ride.arrival_time_estimated ? formatDateTime(ride.arrival_time_estimated) : null;

  const canStart = ride.status === 'matched';
  const canComplete = ride.status === 'in_progress';
  const canCancel = ride.status === 'offered' || ride.status === 'matched';

  return (
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
          Ride Details
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Route Map */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={StyleSheet.absoluteFill}
            initialRegion={mapRegion}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker
              coordinate={{ latitude: ride.start_latitude, longitude: ride.start_longitude }}
              title="Pickup"
              description={ride.start_address}
              pinColor={colors.primary.light}
            />
            <Marker
              coordinate={{ latitude: ride.end_latitude, longitude: ride.end_longitude }}
              title="Destination"
              description={ride.end_address}
              pinColor={colors.primary.dark}
            />
            <Polyline
              coordinates={[
                { latitude: ride.start_latitude, longitude: ride.start_longitude },
                { latitude: ride.end_latitude, longitude: ride.end_longitude },
              ]}
              strokeColor={colors.primary.dark}
              strokeWidth={3}
            />
          </MapView>

          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={16} color="#FFFFFF" />
            <Text style={styles.statusText}>
              {getStatusLabel(ride.status)}
            </Text>
          </View>
        </View>

        {/* Route Information */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Route
          </Text>

          <View style={styles.routeContainer}>
            <View style={styles.locationItem}>
              <View style={[styles.locationIconContainer, { backgroundColor: colors.primary.light }]}>
                <Ionicons name="location" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.locationContent}>
                <Text style={[styles.locationLabel, { color: colors.text.secondary }]}>
                  Pickup Location
                </Text>
                <Text style={[styles.locationAddress, { color: colors.text.primary }]}>
                  {ride.start_address}
                </Text>
              </View>
            </View>

            <View style={[styles.routeConnector, { backgroundColor: colors.border.primary }]} />

            <View style={styles.locationItem}>
              <View style={[styles.locationIconContainer, { backgroundColor: colors.primary.dark }]}>
                <Ionicons name="flag" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.locationContent}>
                <Text style={[styles.locationLabel, { color: colors.text.secondary }]}>
                  Destination
                </Text>
                <Text style={[styles.locationAddress, { color: colors.text.primary }]}>
                  {ride.end_address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timing Information */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Timing
          </Text>

          <View style={styles.timingContainer}>
            <View style={styles.timeCard}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary.dark} />
              <View style={styles.timeInfo}>
                <Text style={[styles.timeLabel, { color: colors.text.secondary }]}>
                  Departure
                </Text>
                <Text style={[styles.timeValue, { color: colors.text.primary }]}>
                  {departureDateTime.date}
                </Text>
                <Text style={[styles.timeSubValue, { color: colors.primary.dark }]}>
                  {departureDateTime.time}
                </Text>
              </View>
            </View>

            {arrivalDateTime && (
              <View style={styles.timeCard}>
                <Ionicons name="time-outline" size={20} color={colors.primary.dark} />
                <View style={styles.timeInfo}>
                  <Text style={[styles.timeLabel, { color: colors.text.secondary }]}>
                    Estimated Arrival
                  </Text>
                  <Text style={[styles.timeValue, { color: colors.text.primary }]}>
                    {arrivalDateTime.date}
                  </Text>
                  <Text style={[styles.timeSubValue, { color: colors.primary.dark }]}>
                    {arrivalDateTime.time}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Ride Details */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Details
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: colors.background.secondary }]}>
                <Ionicons name="people" size={20} color={colors.primary.dark} />
              </View>
              <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                Seats
              </Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                {ride.available_seats} available
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: colors.background.secondary }]}>
                <Ionicons name="cash" size={20} color={colors.primary.dark} />
              </View>
              <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                Price
              </Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                {ride.cost_per_person} MAD
              </Text>
            </View>

            {ride.distance_km && (
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: colors.background.secondary }]}>
                  <Ionicons name="navigate" size={20} color={colors.primary.dark} />
                </View>
                <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                  Distance
                </Text>
                <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                  {ride.distance_km.toFixed(1)} km
                </Text>
              </View>
            )}

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: colors.background.secondary }]}>
                <Ionicons name="repeat" size={20} color={colors.primary.dark} />
              </View>
              <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                Type
              </Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                {ride.is_recurring ? 'Recurring' : 'One-time'}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Preferences
          </Text>

          <View style={styles.preferencesContainer}>
            <View style={styles.preferenceItem}>
              <Ionicons 
                name={ride.smoking_allowed ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={ride.smoking_allowed ? colors.success.light : colors.error.light} 
              />
              <Text style={[styles.preferenceText, { color: colors.text.primary }]}>
                Smoking {ride.smoking_allowed ? 'Allowed' : 'Not Allowed'}
              </Text>
            </View>

            <View style={styles.preferenceItem}>
              <Ionicons 
                name={ride.pets_allowed ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={ride.pets_allowed ? colors.success.light : colors.error.light} 
              />
              <Text style={[styles.preferenceText, { color: colors.text.primary }]}>
                Pets {ride.pets_allowed ? 'Allowed' : 'Not Allowed'}
              </Text>
            </View>

            {ride.music_preferences && (
              <View style={styles.preferenceItem}>
                <Ionicons name="musical-notes" size={20} color={colors.primary.dark} />
                <Text style={[styles.preferenceText, { color: colors.text.primary }]}>
                  Music: {ride.music_preferences}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Vehicle Info */}
        {ride.vehicle_info && (
          <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Vehicle
            </Text>
            <View style={[styles.infoBox, { backgroundColor: colors.background.secondary }]}>
              <Ionicons name="car" size={20} color={colors.primary.dark} />
              <Text style={[styles.infoText, { color: colors.text.primary }]}>
                {ride.vehicle_info}
              </Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {ride.notes && (
          <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Additional Notes
            </Text>
            <Text style={[styles.notesText, { color: colors.text.secondary }]}>
              {ride.notes}
            </Text>
          </View>
        )}

        {/* Driver/Rider Information */}
        {ride.driver && ride.driver.id !== user?.id && (
          <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Driver
            </Text>
            <View style={styles.userCard}>
              <View style={[styles.userAvatar, { backgroundColor: colors.background.primary }]}>
                <Text style={[styles.userAvatarText, { color: colors.primary.dark }]}>
                  {ride.driver.first_name.charAt(0)}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text.primary }]}>
                  {ride.driver.first_name} {ride.driver.last_name}
                </Text>
                <View style={styles.userRating}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: colors.text.secondary }]}>
                    {ride.driver.rating_average?.toFixed(1) || '--'} ({ride.driver.rating_count || 0} rides)
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.primary.dark }]}
                onPress={() => handleContactUser(ride.driver?.phone_number)}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {ride.rider && ride.rider.id !== user?.id && (
          <View style={[styles.section, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Passenger
            </Text>
            <View style={styles.userCard}>
              <View style={[styles.userAvatar, { backgroundColor: colors.background.primary }]}>
                <Text style={[styles.userAvatarText, { color: colors.primary.dark }]}>
                  {ride.rider.first_name.charAt(0)}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text.primary }]}>
                  {ride.rider.first_name} {ride.rider.last_name}
                </Text>
                <View style={styles.userRating}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: colors.text.secondary }]}>
                    {ride.rider.rating_average?.toFixed(1) || '--'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.primary.dark }]}
                onPress={() => handleContactUser(ride.rider?.phone_number)}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {canStart && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction, { backgroundColor: colors.primary.dark, shadowColor: colors.shadow }]}
              onPress={() => handleUpdateStatus('in_progress')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="play" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Start Ride</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {canComplete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.successAction, { backgroundColor: colors.success.dark, shadowColor: colors.shadow }]}
              onPress={() => handleUpdateStatus('completed')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Complete Ride</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerAction, {
                backgroundColor: colors.background.primary,
                borderColor: colors.error.light,
                borderWidth: 2,
                shadowColor: colors.shadow
              }]}
              onPress={handleCancelRide}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color={colors.error.light} />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color={colors.error.light} />
                  <Text style={[styles.actionButtonText, { color: colors.error.light }]}>
                    Cancel Ride
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  mapContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  routeContainer: {
    gap: 0,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  routeConnector: {
    width: 2,
    height: 24,
    marginLeft: 19,
    marginVertical: 8,
  },
  timingContainer: {
    gap: 12,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  timeSubValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  preferencesContainer: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preferenceText: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
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
  },
  primaryAction: {},
  successAction: {},
  dangerAction: {},
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
