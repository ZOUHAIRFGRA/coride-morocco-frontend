// AI Recommendations Screen - Phase 6
// Personalized recommendations for rides, tribes, users, and routes

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { recommendationsApiService } from '@/services/recommendationsApi';
import { useLocation } from '@/contexts/AppStateContext';
import type {
  RecommendationsResponse,
  RideRecommendation,
  TribeRecommendation,
  UserRecommendation,
  RecommendationType,
} from '@/types/recommendation';

export default function RecommendationsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { cachedLocation } = useLocation();

  // State
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | RecommendationType>('all');

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);

      const request: any = {
        recommendation_types: ['ride', 'tribe', 'user', 'route'],
        limit: 10,
        include_reasons: true,
      };

      // Add current location if available
      if (cachedLocation) {
        request.current_location = {
          latitude: cachedLocation.latitude,
          longitude: cachedLocation.longitude,
        };
      }

      const response = await recommendationsApiService.getRecommendations(request);
      
      if (response.success && response.data) {
        setRecommendations(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load recommendations:', error);
      Alert.alert('Error', 'Failed to load recommendations. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadRecommendations();
  }, []);

  const handleRidePress = async (ride: RideRecommendation) => {
    // Mark as clicked
    await recommendationsApiService.markRecommendationClicked('ride', ride.ride_id);
    
    router.push(`/rides/${ride.ride_id}` as any);
  };

  const handleTribePress = async (tribe: TribeRecommendation) => {
    // Mark as clicked
    await recommendationsApiService.markRecommendationClicked('tribe', tribe.tribe_id);
    
    router.push(`/tribes/${tribe.tribe_id}` as any);
  };

  const handleUserPress = async (user: UserRecommendation) => {
    // Mark as clicked
    await recommendationsApiService.markRecommendationClicked('user', user.user_id);
    
    router.push(`/profile/${user.user_id}` as any);
  };

  // Render ride recommendation card
  const renderRideCard = (ride: RideRecommendation) => (
    <TouchableOpacity
      key={ride.ride_id}
      onPress={() => handleRidePress(ride)}
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border.secondary,
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Confidence Badge */}
      <View
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: COLORS.primary.oceanBlue100,
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons name="sparkles" size={12} color={COLORS.primary.oceanBlue700} />
        <Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: COLORS.primary.oceanBlue700,
            marginLeft: 4,
          }}
        >
          {Math.round(ride.confidence_level * 100)}% match
        </Text>
      </View>

      {/* Driver Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.primary.oceanBlue100,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="person" size={20} color={COLORS.primary.oceanBlue700} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
            {ride.ride.driver.full_name}
          </Text>
          {ride.ride.driver.average_rating && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="star" size={14} color={COLORS.warning.warning500} />
              <Text style={{ fontSize: 13, color: colors.text.secondary, marginLeft: 4 }}>
                {ride.ride.driver.average_rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Route Info */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Ionicons name="location" size={16} color={COLORS.success.success500} />
          <Text
            style={{ fontSize: 14, color: colors.text.primary, marginLeft: 8, flex: 1 }}
            numberOfLines={1}
          >
            {ride.ride.start_location.address}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location" size={16} color={COLORS.danger.danger500} />
          <Text
            style={{ fontSize: 14, color: colors.text.primary, marginLeft: 8, flex: 1 }}
            numberOfLines={1}
          >
            {ride.ride.end_location.address}
          </Text>
        </View>
      </View>

      {/* Ride Details */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border.secondary,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
          <Text style={{ fontSize: 13, color: colors.text.secondary, marginLeft: 4 }}>
            {new Date(ride.ride.departure_time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="people-outline" size={16} color={colors.text.secondary} />
          <Text style={{ fontSize: 13, color: colors.text.secondary, marginLeft: 4 }}>
            {ride.ride.available_seats} seats
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="cash-outline" size={16} color={colors.text.secondary} />
          <Text style={{ fontSize: 13, color: colors.text.secondary, marginLeft: 4 }}>
            {ride.ride.price_per_seat} MAD
          </Text>
        </View>
      </View>

      {/* Recommendation Reasons */}
      {ride.reasons && ride.reasons.length > 0 && (
        <View
          style={{
            backgroundColor: COLORS.primary.oceanBlue50,
            borderRadius: 8,
            padding: 10,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: COLORS.primary.oceanBlue700,
              marginBottom: 6,
            }}
          >
            Why this ride:
          </Text>
          {ride.reasons.slice(0, 2).map((reason, idx) => (
            <Text
              key={idx}
              style={{ fontSize: 11, color: colors.text.secondary, marginBottom: 2 }}
            >
              • {reason}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  // Render tribe recommendation card
  const renderTribeCard = (tribe: TribeRecommendation) => (
    <TouchableOpacity
      key={tribe.tribe_id}
      onPress={() => handleTribePress(tribe)}
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border.secondary,
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Confidence Badge */}
      <View
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: COLORS.accent.purple100,
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons name="sparkles" size={12} color={COLORS.accent.purple700} />
        <Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: COLORS.accent.purple700,
            marginLeft: 4,
          }}
        >
          {Math.round(tribe.confidence_level * 100)}% match
        </Text>
      </View>

      {/* Tribe Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.accent.purple100,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="people" size={20} color={COLORS.accent.purple700} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
            {tribe.tribe.name}
          </Text>
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>
            {tribe.tribe.member_count} members • {tribe.tribe.message_count} messages
          </Text>
        </View>
      </View>

      {/* Route */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="location" size={14} color={COLORS.success.success500} />
          <Text
            style={{ fontSize: 13, color: colors.text.primary, marginLeft: 6, flex: 1 }}
            numberOfLines={1}
          >
            {tribe.tribe.start_location.address}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location" size={14} color={COLORS.danger.danger500} />
          <Text
            style={{ fontSize: 13, color: colors.text.primary, marginLeft: 6, flex: 1 }}
            numberOfLines={1}
          >
            {tribe.tribe.end_location.address}
          </Text>
        </View>
      </View>

      {/* Description */}
      {tribe.tribe.description && (
        <Text
          style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 12 }}
          numberOfLines={2}
        >
          {tribe.tribe.description}
        </Text>
      )}

      {/* Recommendation Reasons */}
      {tribe.reasons && tribe.reasons.length > 0 && (
        <View
          style={{
            backgroundColor: COLORS.accent.purple50,
            borderRadius: 8,
            padding: 10,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: COLORS.accent.purple700,
              marginBottom: 6,
            }}
          >
            Why this tribe:
          </Text>
          {tribe.reasons.slice(0, 2).map((reason, idx) => (
            <Text
              key={idx}
              style={{ fontSize: 11, color: colors.text.secondary, marginBottom: 2 }}
            >
              • {reason}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  // Render user recommendation card
  const renderUserCard = (user: UserRecommendation) => (
    <TouchableOpacity
      key={user.user_id}
      onPress={() => handleUserPress(user)}
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border.secondary,
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Confidence Badge */}
      <View
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: COLORS.success.success100,
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons name="sparkles" size={12} color={COLORS.success.success700} />
        <Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: COLORS.success.success700,
            marginLeft: 4,
          }}
        >
          {Math.round(user.similarity_score * 100)}% similar
        </Text>
      </View>

      {/* User Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: COLORS.success.success100,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="person" size={24} color={COLORS.success.success700} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
            {user.user.full_name}
          </Text>
          {user.user.average_rating && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Ionicons name="star" size={14} color={COLORS.warning.warning500} />
              <Text style={{ fontSize: 13, color: colors.text.secondary, marginLeft: 4 }}>
                {user.user.average_rating.toFixed(1)} • {user.user.completed_rides_count} rides
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Compatibility Stats */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border.secondary,
          marginBottom: 12,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.primary.oceanBlue700 }}>
            {user.common_tribes_count}
          </Text>
          <Text style={{ fontSize: 11, color: colors.text.secondary }}>Common Tribes</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.accent.purple700 }}>
            {user.common_routes_count}
          </Text>
          <Text style={{ fontSize: 11, color: colors.text.secondary }}>Common Routes</Text>
        </View>
      </View>

      {/* Recommendation Reasons */}
      {user.reasons && user.reasons.length > 0 && (
        <View
          style={{
            backgroundColor: COLORS.success.success50,
            borderRadius: 8,
            padding: 10,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: COLORS.success.success700,
              marginBottom: 6,
            }}
          >
            Compatible because:
          </Text>
          {user.reasons.slice(0, 2).map((reason, idx) => (
            <Text
              key={idx}
              style={{ fontSize: 11, color: colors.text.secondary, marginBottom: 2 }}
            >
              • {reason}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{ marginTop: 16, color: colors.text.secondary }}>
            Loading personalized recommendations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.primary,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="sparkles" size={24} color={COLORS.primary.oceanBlue700} />
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: colors.text.primary,
              marginLeft: 8,
            }}
          >
            For You
          </Text>
        </View>

        {recommendations && (
          <View
            style={{
              backgroundColor: COLORS.primary.oceanBlue100,
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{ fontSize: 11, fontWeight: '600', color: COLORS.primary.oceanBlue700 }}
            >
              {Math.round(recommendations.personalization_confidence * 100)}% confidence
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 16, paddingVertical: 12 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {[
          { key: 'all', label: 'All', icon: 'apps' },
          { key: 'ride', label: 'Rides', icon: 'car' },
          { key: 'tribe', label: 'Tribes', icon: 'people' },
          { key: 'user', label: 'Users', icon: 'person' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                activeTab === tab.key
                  ? COLORS.primary.oceanBlue700
                  : colors.background.secondary,
              borderWidth: 1,
              borderColor:
                activeTab === tab.key
                  ? COLORS.primary.oceanBlue700
                  : colors.border.secondary,
            }}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? 'white' : colors.text.secondary}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === tab.key ? 'white' : colors.text.secondary,
                marginLeft: 6,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary.oceanBlue700]}
          />
        }
      >
        {/* Rides Section */}
        {(activeTab === 'all' || activeTab === 'ride') &&
          recommendations?.rides &&
          recommendations.rides.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 12,
                }}
              >
                Recommended Rides
              </Text>
              {recommendations.rides.map((ride) => renderRideCard(ride))}
            </View>
          )}

        {/* Tribes Section */}
        {(activeTab === 'all' || activeTab === 'tribe') &&
          recommendations?.tribes &&
          recommendations.tribes.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 12,
                }}
              >
                Recommended Tribes
              </Text>
              {recommendations.tribes.map((tribe) => renderTribeCard(tribe))}
            </View>
          )}

        {/* Users Section */}
        {(activeTab === 'all' || activeTab === 'user') &&
          recommendations?.users &&
          recommendations.users.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 12,
                }}
              >
                Compatible Users
              </Text>
              {recommendations.users.map((user) => renderUserCard(user))}
            </View>
          )}

        {/* Empty State */}
        {!recommendations ||
        ((!recommendations.rides || recommendations.rides.length === 0) &&
          (!recommendations.tribes || recommendations.tribes.length === 0) &&
          (!recommendations.users || recommendations.users.length === 0)) ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="sparkles-outline" size={64} color={colors.text.secondary} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text.primary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              No Recommendations Yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.text.secondary,
                marginTop: 8,
                textAlign: 'center',
                paddingHorizontal: 40,
              }}
            >
              Use the app more to get personalized recommendations based on your behavior and
              preferences!
            </Text>
          </View>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
