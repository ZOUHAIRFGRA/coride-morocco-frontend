import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AppStateContext';
import { useUser } from '@/hooks/useUserProfile';
import CoRideSidebar from '@/components/CoRideSidebar';
import { useAppTheme } from '@/hooks/useAppTheme';
import { GRADIENTS } from '@/constants/theme';
import LocationSearchModal from '@/components/modals/LocationSearchModal';
import JoinRideModal from '@/components/modals/JoinRideModal';
import { LocationSelectorRow } from '@/components/ui/LocationSelectorRow';
import { PassengerStepper } from '@/components/ui/PassengerStepper';
import { integratedRideService } from '@/services/integratedRideService';
import type { LocationSuggestion } from '@/types/geospatial';
import type { SmartRideMatch } from '@/types/ride';

const ROLE_ILLUSTRATIONS = {
  RIDER: require('@assets/images/features/find_ride.png'),
  DRIVER: require('@assets/images/features/offer_ride.png'),
};

export default function MainScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [startLocation, setStartLocation] = useState<LocationSuggestion | null>(null);
  const [endLocation, setEndLocation] = useState<LocationSuggestion | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [routes, setRoutes] = useState<SmartRideMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartLocationModal, setShowStartLocationModal] = useState(false);
  const [showEndLocationModal, setShowEndLocationModal] = useState(false);
  const [showJoinRideModal, setShowJoinRideModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState<SmartRideMatch | null>(null);
  const { user } = useAuth();
  const { profile } = useUser();
  const { colors } = useAppTheme();

  // Use profile data or fallback to auth user
  const userData = profile || user;
  const userRole = userData?.role || 'RIDER'; // Default to rider if no role

  const getWelcomeMessage = () => {
    const firstName = userData?.first_name;
    const hour = new Date().getHours();
    
    let greeting = "Hello";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    return firstName ? `${greeting}, ${firstName}!` : `${greeting}!`;
  };

  const getSubtitleMessage = () => {
    switch (userRole) {
      case 'DRIVER':
        return 'Offer rides and earn money';
      case 'RIDER':
        return 'Find affordable rides near you';
      default:
        return 'Ready to share a ride?';
    }
  };

  // Auto-search when both locations are set
  useEffect(() => {
    if (startLocation && endLocation) {
      handleSearchRoutes();
    }
  }, [startLocation, endLocation, passengerCount]);

  const handleSearchRoutes = async () => {
    if (!startLocation || !endLocation) {
      Alert.alert('Missing Information', 'Please select both pickup and destination locations.');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare departure time (1 hour from now)
      const now = new Date();
      const searchDepartureTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      const routeResponse = await integratedRideService.findBestMatches(
        startLocation,
        endLocation,
        searchDepartureTime,
        passengerCount
      );

      if (routeResponse.success && routeResponse.data && routeResponse.data.length > 0) {
        setRoutes(routeResponse.data);
      } else {
        setRoutes([]);
        Alert.alert(
          'No Routes Found',
          'No drivers are currently offering rides for this route. Would you like to request a ride? You\'ll be the first to initiate this trip!',
          [
            {
              text: 'Request a Ride',
              onPress: () => router.push('/request')
            },
            {
              text: 'Maybe Later',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Route search error:', error);
      Alert.alert('Search Error', 'Failed to search for routes. Please try again.');
      setRoutes([]);
    }

    setIsLoading(false);
  };

  const handleRouteSelect = (route: SmartRideMatch) => {
    setSelectedRide(route);
    setShowJoinRideModal(true);
  };

  const handleJoinSuccess = () => {
    // Refresh the routes list to reflect updated data
    handleSearchRoutes();
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const dynamicStyles = createStyles(colors);

  return (
    <>
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        {/* Gradient hero band */}
        <LinearGradient
          colors={colors.primary.gradient}
          start={GRADIENTS.vertical.start}
          end={GRADIENTS.vertical.end}
          style={dynamicStyles.heroBand}
        >
          <View style={dynamicStyles.heroTopRow}>
            <View style={[
              dynamicStyles.roleIndicator,
              { backgroundColor: 'rgba(255,255,255,0.2)' }
            ]}>
              <Ionicons name={userRole === 'DRIVER' ? 'car' : 'person'} size={16} color="#FFFFFF" />
              <Text style={[dynamicStyles.roleText, { color: '#FFFFFF' }]}>
                {userRole === 'DRIVER' ? 'Driver' : 'Rider'}
              </Text>
            </View>

            <TouchableOpacity
              style={[dynamicStyles.menuButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => setSidebarVisible(true)}
            >
              <Ionicons name="menu" size={wp(7)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.heroTextRow}>
            <View style={dynamicStyles.heroTextColumn}>
              <Text style={dynamicStyles.welcomeText}>{getWelcomeMessage()}</Text>
              <Text style={dynamicStyles.subtitle}>{getSubtitleMessage()}</Text>
            </View>
            <Image
              source={ROLE_ILLUSTRATIONS[userRole === 'DRIVER' ? 'DRIVER' : 'RIDER']}
              style={dynamicStyles.heroIllustration}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        {/* Main Content */}
        <ScrollView
          style={dynamicStyles.contentScroll}
          contentContainerStyle={dynamicStyles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Location Selection Section - Only for Riders */}
          {userRole === 'RIDER' && (
            <View style={dynamicStyles.searchSection}>
              <LocationSelectorRow
                icon="location"
                value={startLocation}
                placeholder="From where?"
                onPress={() => setShowStartLocationModal(true)}
              />

              <LocationSelectorRow
                icon="flag"
                value={endLocation}
                placeholder="Where to?"
                onPress={() => setShowEndLocationModal(true)}
              />

              {/* Passenger Selection */}
              <View style={dynamicStyles.passengerSection}>
                <PassengerStepper
                  label="Passengers"
                  value={passengerCount}
                  onChange={setPassengerCount}
                />
              </View>

            {startLocation && endLocation && (
              <TouchableOpacity 
                style={dynamicStyles.searchButton}
                onPress={handleSearchRoutes}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="search" size={20} color="#FFFFFF" />
                )}
                <Text style={dynamicStyles.searchButtonText}>
                  {isLoading ? 'Searching...' : 'Find Available Rides'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          )}

          {/* Empty state - Driver, no active offers to show here */}
          {userRole === 'DRIVER' && (
            <View style={dynamicStyles.driverEmptyState}>
              <Image
                source={require('@assets/images/features/route_map.png')}
                style={dynamicStyles.driverEmptyIllustration}
                resizeMode="contain"
              />
              <Text style={dynamicStyles.driverEmptyTitle}>Ready to offer a ride?</Text>
              <Text style={dynamicStyles.driverEmptyText}>
                Post your route and available seats — riders on your way will find you.
              </Text>
              <TouchableOpacity
                style={dynamicStyles.driverEmptyButton}
                onPress={() => router.push('/offer')}
              >
                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                <Text style={dynamicStyles.driverEmptyButtonText}>Offer a Ride</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions - Role-based */}
          <View style={dynamicStyles.quickActions}>
            {userRole === 'RIDER' ? (
              // Rider Interface
              <>
                <TouchableOpacity 
                  style={[dynamicStyles.actionButton, dynamicStyles.primaryButton]}
                  onPress={() => router.push('/request')}
                >
                  <Ionicons name="megaphone" size={wp(6)} color="#FFFFFF" />
                  <Text style={[dynamicStyles.actionText, dynamicStyles.primaryText]}>Request a Ride</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[dynamicStyles.actionButton, dynamicStyles.tertiaryButton]}
                  onPress={() => router.push('/rides')}
                >
                  <Ionicons name="time" size={wp(6)} color={colors.text.secondary} />
                  <Text style={[dynamicStyles.actionText, dynamicStyles.tertiaryText]}>My Rides</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Driver Interface
              <>
                <TouchableOpacity 
                  style={[dynamicStyles.actionButton, dynamicStyles.primaryButton]}
                  onPress={() => router.push('/offer')}
                >
                  <Ionicons name="add-circle" size={wp(6)} color="#FFFFFF" />
                  <Text style={[dynamicStyles.actionText, dynamicStyles.primaryText]}>Offer a Ride</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[dynamicStyles.actionButton, dynamicStyles.tertiaryButton]}
                  onPress={() => router.push('/rides')}
                >
                  <Ionicons name="time" size={wp(6)} color={colors.text.secondary} />
                  <Text style={[dynamicStyles.actionText, dynamicStyles.tertiaryText]}>My Rides</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Routes Results - Only for Riders */}
          {userRole === 'RIDER' && startLocation && endLocation && routes.length > 0 && (
            <View style={dynamicStyles.routesSection}>
              <Text style={[dynamicStyles.sectionTitle, { color: colors.text.primary }]}>
                Available Rides ({routes.length})
              </Text>
              
              <ScrollView 
                style={dynamicStyles.routesList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {routes.slice(0, 3).map((route) => {
                  const driverName = route.driver ? `${route.driver.first_name} ${route.driver.last_name}` : 'Driver';
                  const driverInitial = route.driver?.first_name?.charAt(0)?.toUpperCase() || 'D';
                  const driverRating = route.driver?.rating_average || 0;
                  
                  return (
                    <TouchableOpacity
                      key={route.id}
                      style={[dynamicStyles.routeCard, { 
                        backgroundColor: colors.surface.primary,
                        borderColor: colors.border.primary
                      }]}
                      onPress={() => handleRouteSelect(route)}
                    >
                      <View style={dynamicStyles.routeHeader}>
                        <View style={dynamicStyles.driverInfo}>
                          <View style={[dynamicStyles.driverAvatar, { backgroundColor: colors.background.primary }]}>
                            <Text style={[dynamicStyles.driverInitial, { color: colors.primary.dark }]}>
                              {driverInitial}
                            </Text>
                          </View>
                          
                          <View style={dynamicStyles.driverDetails}>
                            <Text style={[dynamicStyles.driverName, { color: colors.text.primary }]}>
                              {driverName}
                            </Text>
                            <View style={dynamicStyles.ratingContainer}>
                              <Ionicons name="star" size={14} color="#FFD700" />
                              <Text style={[dynamicStyles.rating, { color: colors.text.secondary }]}>
                                {driverRating.toFixed(1)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        <View style={dynamicStyles.priceContainer}>
                          <Text style={[dynamicStyles.priceValue, { color: colors.primary.dark }]}>
                            {route.cost_per_person} MAD
                          </Text>
                          <Text style={[dynamicStyles.priceLabel, { color: colors.text.secondary }]}>
                            per seat
                          </Text>
                        </View>
                      </View>

                      <View style={dynamicStyles.routeDetails}>
                        <View style={dynamicStyles.timeInfo}>
                          <Text style={[dynamicStyles.timeLabel, { color: colors.text.secondary }]}>Departure</Text>
                          <Text style={[dynamicStyles.timeValue, { color: colors.text.primary }]}>
                            {formatTime(route.departure_time)}
                          </Text>
                        </View>
                        
                        <View style={dynamicStyles.routeVisualization}>
                          <View style={[dynamicStyles.routePoint, { backgroundColor: colors.primary.light }]} />
                          <View style={[dynamicStyles.routeLine, { backgroundColor: colors.border.primary }]} />
                          <View style={[dynamicStyles.routePoint, { backgroundColor: colors.primary.dark }]} />
                        </View>
                        
                        <View style={dynamicStyles.timeInfo}>
                          <Text style={[dynamicStyles.timeLabel, { color: colors.text.secondary }]}>Arrival</Text>
                          <Text style={[dynamicStyles.timeValue, { color: colors.text.primary }]}>
                            {route.arrival_time_estimated ? formatTime(route.arrival_time_estimated) : '--:--'}
                          </Text>
                        </View>
                      </View>

                      <View style={dynamicStyles.routeMetrics}>
                        <View style={dynamicStyles.metric}>
                          <Ionicons name="navigate-outline" size={14} color={colors.text.secondary} />
                          <Text style={[dynamicStyles.metricText, { color: colors.text.secondary }]}>
                            {route.distanceFromUser.toFixed(1)}km pickup
                          </Text>
                        </View>
                        
                        <View style={dynamicStyles.metric}>
                          <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
                          <Text style={[dynamicStyles.metricText, { color: colors.text.secondary }]}>
                            {route.available_seats} seats left
                          </Text>
                        </View>
                      </View>

                      {/* Match Score Indicator */}
                      <View style={[dynamicStyles.matchScore, { backgroundColor: colors.background.secondary }]}>
                        <Ionicons name="analytics" size={12} color={colors.primary.dark} />
                        <Text style={[dynamicStyles.matchScoreText, { color: colors.primary.dark }]}>
                          {Math.round(route.matchScore * 100)}% match
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                
                {routes.length > 3 && (
                  <TouchableOpacity 
                    style={[dynamicStyles.viewMoreButton, { borderColor: colors.border.primary }]}
                    onPress={() => router.push('/rides')}
                  >
                    <Text style={[dynamicStyles.viewMoreText, { color: colors.primary.dark }]}>
                      View All {routes.length} Rides
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary.dark} />
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}

          {/* User Stats */}
          <View style={dynamicStyles.statsContainer}>
            <View style={dynamicStyles.statItem}>
              <Ionicons name="car-outline" size={16} color={colors.primary.dark} />
              <Text style={dynamicStyles.statText}>
                {userData?.rating_count || 0} rides
              </Text>
            </View>
            <View style={dynamicStyles.statDivider} />
            <View style={dynamicStyles.statItem}>
              <Ionicons name="star" size={16} color={colors.primary.dark} />
              <Text style={dynamicStyles.statText}>
                {userData?.rating_average?.toFixed(1) || '--'} rating
              </Text>
            </View>
            <View style={dynamicStyles.statDivider} />
            <View style={dynamicStyles.statItem}>
              <Ionicons 
                name={userData?.is_verified ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={userData?.is_verified ? colors.success.light : colors.error.light} 
              />
              <Text style={dynamicStyles.statText}>
                {userData?.is_verified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Sidebar */}
      <CoRideSidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      {/* Location Selection Modals */}
      <LocationSearchModal
        visible={showStartLocationModal}
        onClose={() => setShowStartLocationModal(false)}
        onLocationSelect={setStartLocation}
        title="Select Pickup Location"
        placeholder="Where should the driver pick you up?"
        showHistory={true}
        showNearbyPlaces={true}
      />

      <LocationSearchModal
        visible={showEndLocationModal}
        onClose={() => setShowEndLocationModal(false)}
        onLocationSelect={setEndLocation}
        title="Select Destination"
        placeholder="Where do you want to go?"
        currentLocation={startLocation ? {
          latitude: startLocation.latitude,
          longitude: startLocation.longitude
        } : undefined}
        showHistory={true}
        showNearbyPlaces={false}
      />

      {/* Join Ride Modal */}
      <JoinRideModal
        visible={showJoinRideModal}
        ride={selectedRide}
        onClose={() => {
          setShowJoinRideModal(false);
          setSelectedRide(null);
        }}
        onSuccess={handleJoinSuccess}
      />
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  heroBand: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  heroTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  heroTextColumn: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  heroIllustration: {
    width: wp(26),
    height: wp(26),
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  driverEmptyState: {
    width: '100%',
    backgroundColor: colors.surface.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  driverEmptyIllustration: {
    width: wp(40),
    height: wp(30),
    marginBottom: 16,
  },
  driverEmptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  driverEmptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  driverEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.dark,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  driverEmptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  searchSection: {
    width: '100%',
    backgroundColor: colors.surface.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.dark,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: colors.primary.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.dark,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: colors.primary.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: colors.primary.dark,
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.primary.dark,
  },
  tertiaryButton: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: colors.primary.dark,
  },
  tertiaryText: {
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border.primary,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary.dark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  passengerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  routesSection: {
    width: '100%',
    backgroundColor: colors.surface.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  routesList: {
    maxHeight: 400,
  },
  routeCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 14,
    fontWeight: '600',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceLabel: {
    fontSize: 10,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeInfo: {
    alignItems: 'center',
    width: 60,
  },
  timeLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeVisualization: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  routePoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  routeLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 8,
  },
  routeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricText: {
    fontSize: 12,
    marginLeft: 4,
  },
  viewMoreButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});