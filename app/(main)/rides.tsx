// My Rides Screen - Complete ride management for Phase 4
// Shows offered rides and joined/requested rides with full status tracking

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { integratedRideService } from '@/services/integratedRideService';
import type { RideWithGeospatial } from '@/types/ride';
import type { RideStatus } from '@/types/ride';

type RideTab = 'offered' | 'joined';

export default function RidesScreen() {
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState<RideTab>('offered');
  const [offeredRides, setOfferedRides] = useState<RideWithGeospatial[]>([]);
  const [joinedRides, setJoinedRides] = useState<RideWithGeospatial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    setIsLoading(true);
    try {
      const [offersResponse, requestsResponse] = await Promise.all([
        integratedRideService.getMyRidesEnhanced('offers'),
        integratedRideService.getMyRidesEnhanced('requests')
      ]);

      if (offersResponse.success && offersResponse.data) {
        setOfferedRides(offersResponse.data);
      }

      if (requestsResponse.success && requestsResponse.data) {
        setJoinedRides(requestsResponse.data);
      }
    } catch (error) {
      console.error('Error loading rides:', error);
      Alert.alert('Error', 'Failed to load rides. Please try again.');
    }
    setIsLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadRides();
    setIsRefreshing(false);
  }, []);

  const handleRidePress = (ride: RideWithGeospatial) => {
    router.push(`/rides/${ride.id}`);
  };

  const handleCancelRide = async (rideId: number) => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await integratedRideService.api.cancelRide(rideId);
              if (response.success) {
                Alert.alert('Success', 'Ride cancelled successfully');
                loadRides();
              } else {
                Alert.alert('Error', response.error?.message || 'Failed to cancel ride');
              }
            } catch (error) {
              console.error('Error cancelling ride:', error);
              Alert.alert('Error', 'Failed to cancel ride');
            }
          }
        }
      ]
    );
  };

  const handleUpdateStatus = async (rideId: number, newStatus: RideStatus) => {
    try {
      const response = await integratedRideService.updateRideStatusWithTracking(rideId, newStatus);
      if (response.success) {
        Alert.alert('Success', `Ride status updated to ${newStatus}`);
        loadRides();
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update ride status');
    }
  };

  const getStatusColor = (status: RideStatus): string => {
    const statusColors: Record<RideStatus, string> = {
      offered: colors.success.light,
      requested: colors.primary.light,
      matched: colors.warning.light,
      in_progress: colors.primary.dark,
      completed: colors.success.dark,
      cancelled: colors.error.light
    };
    return statusColors[status] || colors.text.secondary;
  };

  const getStatusIcon = (status: RideStatus): keyof typeof Ionicons.glyphMap => {
    const statusIcons: Record<RideStatus, keyof typeof Ionicons.glyphMap> = {
      offered: 'checkmark-circle',
      requested: 'time',
      matched: 'people',
      in_progress: 'car',
      completed: 'checkmark-done',
      cancelled: 'close-circle'
    };
    return statusIcons[status] || 'help-circle';
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

  const renderRideCard = (ride: RideWithGeospatial, isOffered: boolean) => {
    const statusColor = getStatusColor(ride.status);
    const statusIcon = getStatusIcon(ride.status);
    const canCancel = isOffered && (ride.status === 'offered' || ride.status === 'matched');
    const canStart = isOffered && ride.status === 'matched';
    const canComplete = isOffered && ride.status === 'in_progress';

    return (
      <TouchableOpacity
        key={ride.id}
        style={[styles.rideCard, { 
          backgroundColor: colors.surface.primary,
          borderColor: colors.border.primary
        }]}
        onPress={() => handleRidePress(ride)}
        activeOpacity={0.7}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Ionicons name={statusIcon} size={14} color="#FFFFFF" />
          <Text style={styles.statusText}>
            {ride.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        {/* Route Information */}
        <View style={styles.routeSection}>
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: colors.primary.light }]} />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationLabel, { color: colors.text.secondary }]}>From</Text>
              <Text style={[styles.locationText, { color: colors.text.primary }]} numberOfLines={1}>
                {ride.start_address}
              </Text>
            </View>
          </View>

          <View style={[styles.routeLine, { backgroundColor: colors.border.primary }]} />

          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: colors.primary.dark }]} />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationLabel, { color: colors.text.secondary }]}>To</Text>
              <Text style={[styles.locationText, { color: colors.text.primary }]} numberOfLines={1}>
                {ride.end_address}
              </Text>
            </View>
          </View>
        </View>

        {/* Ride Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
            <Text style={[styles.detailText, { color: colors.text.secondary }]}>
              {formatDateTime(ride.departure_time)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color={colors.text.secondary} />
            <Text style={[styles.detailText, { color: colors.text.secondary }]}>
              {isOffered 
                ? `${ride.available_seats} seats available` 
                : `${ride.available_seats - ride.occupied_seats} seats left`}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color={colors.primary.dark} />
            <Text style={[styles.detailText, { color: colors.primary.dark, fontWeight: '600' }]}>
              {ride.cost_per_person} MAD/person
            </Text>
          </View>
        </View>

        {/* Route Info if available */}
        {ride.routeInfo && (
          <View style={[styles.routeInfo, { backgroundColor: colors.background.secondary }]}>
            <View style={styles.routeInfoItem}>
              <Ionicons name="navigate" size={14} color={colors.text.secondary} />
              <Text style={[styles.routeInfoText, { color: colors.text.secondary }]}>
                {ride.routeInfo.distance.toFixed(1)} km
              </Text>
            </View>
            <View style={styles.routeInfoItem}>
              <Ionicons name="time" size={14} color={colors.text.secondary} />
              <Text style={[styles.routeInfoText, { color: colors.text.secondary }]}>
                ~{ride.routeInfo.estimatedDuration} min
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {canStart && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary.dark }]}
              onPress={() => handleUpdateStatus(ride.id, 'in_progress')}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Start Ride</Text>
            </TouchableOpacity>
          )}

          {canComplete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.successButton, { backgroundColor: colors.success.dark }]}
              onPress={() => handleUpdateStatus(ride.id, 'completed')}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton, { 
                borderColor: colors.error.light,
                backgroundColor: colors.background.primary
              }]}
              onPress={() => handleCancelRide(ride.id)}
            >
              <Ionicons name="close" size={16} color={colors.error.light} />
              <Text style={[styles.actionButtonText, { color: colors.error.light }]}>Cancel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { 
              borderColor: colors.border.primary,
              backgroundColor: colors.background.tertiary
            }]}
            onPress={() => handleRidePress(ride)}
          >
            <Text style={[styles.actionButtonText, { color: colors.text.primary }]}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Rider/Driver Info */}
        {!isOffered && ride.driver && (
          <View style={[styles.userInfo, { borderTopColor: colors.border.primary }]}>
            <View style={[styles.avatar, { backgroundColor: colors.background.primary }]}>
              <Text style={[styles.avatarText, { color: colors.primary.dark }]}>
                {ride.driver.first_name.charAt(0)}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text.primary }]}>
                {ride.driver.first_name} {ride.driver.last_name}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.text.secondary }]}>
                  {ride.driver.rating_average?.toFixed(1) || '--'} ({ride.driver.rating_count || 0})
                </Text>
              </View>
            </View>
          </View>
        )}

        {isOffered && ride.rider && (
          <View style={[styles.userInfo, { borderTopColor: colors.border.primary }]}>
            <View style={[styles.avatar, { backgroundColor: colors.background.primary }]}>
              <Text style={[styles.avatarText, { color: colors.primary.dark }]}>
                {ride.rider.first_name.charAt(0)}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text.primary }]}>
                Passenger: {ride.rider.first_name} {ride.rider.last_name}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.text.secondary }]}>
                  {ride.rider.rating_average?.toFixed(1) || '--'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.background.secondary }]}>
        <Ionicons 
          name={activeTab === 'offered' ? 'car-outline' : 'search-outline'} 
          size={48} 
          color={colors.text.tertiary} 
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        {activeTab === 'offered' ? 'No offered rides' : 'No joined rides'}
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
        {activeTab === 'offered' 
          ? 'Start by offering a ride to help others get around'
          : 'Search for available rides and join one to get started'}
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary.dark }]}
        onPress={() => router.push(activeTab === 'offered' ? '/offer' : '/')}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>
          {activeTab === 'offered' ? 'Offer a Ride' : 'Find a Ride'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const rides = activeTab === 'offered' ? offeredRides : joinedRides;
  const dynamicStyles = createStyles(colors);

  return (
    <SafeAreaView style={[dynamicStyles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[dynamicStyles.header, { 
        backgroundColor: colors.surface.primary,
        borderBottomColor: colors.border.primary
      }]}>
        <View style={dynamicStyles.headerLeft}>
          <Ionicons name="car" size={28} color={colors.primary.dark} />
          <Text style={[dynamicStyles.headerTitle, { color: colors.text.primary }]}>
            My Rides
          </Text>
        </View>
        <TouchableOpacity
          style={[dynamicStyles.addButton, { backgroundColor: colors.primary.dark }]}
          onPress={() => router.push('/offer')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={[dynamicStyles.tabContainer, { backgroundColor: colors.surface.primary }]}>
        <TouchableOpacity
          style={[
            dynamicStyles.tab,
            activeTab === 'offered' && dynamicStyles.activeTab,
            activeTab === 'offered' && { backgroundColor: colors.primary.dark }
          ]}
          onPress={() => setActiveTab('offered')}
        >
          <Ionicons 
            name="car" 
            size={20} 
            color={activeTab === 'offered' ? '#FFFFFF' : colors.text.secondary} 
          />
          <Text style={[
            dynamicStyles.tabText,
            { color: activeTab === 'offered' ? '#FFFFFF' : colors.text.secondary }
          ]}>
            Offered ({offeredRides.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.tab,
            activeTab === 'joined' && dynamicStyles.activeTab,
            activeTab === 'joined' && { backgroundColor: colors.primary.dark }
          ]}
          onPress={() => setActiveTab('joined')}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={activeTab === 'joined' ? '#FFFFFF' : colors.text.secondary} 
          />
          <Text style={[
            dynamicStyles.tabText,
            { color: activeTab === 'joined' ? '#FFFFFF' : colors.text.secondary }
          ]}>
            Joined ({joinedRides.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.dark} />
          <Text style={[dynamicStyles.loadingText, { color: colors.text.secondary }]}>
            Loading rides...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={dynamicStyles.scrollView}
          contentContainerStyle={dynamicStyles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary.dark}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {rides.length === 0 ? (
            renderEmptyState()
          ) : (
            rides.map((ride) => renderRideCard(ride, activeTab === 'offered'))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
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
  },
  rideCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    gap: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  routeSection: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 16,
    marginLeft: 4,
    marginVertical: 4,
  },
  detailsSection: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 16,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeInfoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    flex: 1,
    minWidth: '48%',
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  successButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dangerButton: {
    borderWidth: 1,
  },
  secondaryButton: {
    borderWidth: 1,
    flex: 1,
    minWidth: '100%',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  rideCard: {},
  statusBadge: {},
  statusText: {},
  routeSection: {},
  locationRow: {},
  locationDot: {},
  locationInfo: {},
  locationLabel: {},
  locationText: {},
  routeLine: {},
  detailsSection: {},
  detailRow: {},
  detailText: {},
  routeInfo: {},
  routeInfoItem: {},
  routeInfoText: {},
  actionsSection: {},
  actionButton: {},
  primaryButton: {},
  successButton: {},
  dangerButton: {},
  secondaryButton: {},
  actionButtonText: {},
  userInfo: {},
  avatar: {},
  avatarText: {},
  userDetails: {},
  userName: {},
  ratingRow: {},
  ratingText: {},
  emptyState: {},
  emptyIcon: {},
  emptyTitle: {},
  emptyDescription: {},
  emptyButton: {},
  emptyButtonText: {},
});