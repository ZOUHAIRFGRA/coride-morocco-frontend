// Tribes List Screen
// Browse and discover trajectory tribes

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { tribesApiService } from '@/services';
import type { Tribe, TribeSearchParams } from '@/types/tribe';
import * as Location from 'expo-location';

const TribesListScreen = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useAppTheme();

  // State
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [myTribes, setMyTribes] = useState<Tribe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'my-tribes'>('my-tribes');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Load user location
  useEffect(() => {
    loadUserLocation();
  }, []);

  // Load tribes on mount and tab change
  useEffect(() => {
    loadTribes();
  }, [activeTab, searchQuery]);

  const loadUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const loadTribes = async () => {
    try {
      setIsLoading(true);

      if (activeTab === 'my-tribes') {
        const response = await tribesApiService.getMyTribes(1, 20);
        if (response.success && response.data) {
          setMyTribes(response.data.tribes);
        }
      } else {
        const params: TribeSearchParams = {
          query: searchQuery || undefined,
          only_public: true,
          page: 1,
          page_size: 20,
        };

        // Add location-based search if available
        if (userLocation) {
          params.near_latitude = userLocation.latitude;
          params.near_longitude = userLocation.longitude;
          params.max_distance_km = 20; // 20km radius
        }

        const response = await tribesApiService.searchTribes(params);
        if (response.success && response.data) {
          setTribes(response.data.tribes);
        }
      }
    } catch (error: any) {
      console.error('Failed to load tribes:', error);
      Alert.alert('Error', 'Failed to load tribes. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadTribes();
  }, [activeTab, searchQuery]);

  const handleTribePress = (tribe: Tribe) => {
    router.push(`/tribes/${tribe.id}` as any);
  };

  const handleCreateTribe = () => {
    router.push('/tribes/create' as any);
  };

  const renderTribeCard = (tribe: Tribe) => (
    <TouchableOpacity
      key={tribe.id}
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
      {/* Tribe Header */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {tribe.name}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="location" size={14} color={colors.text.secondary} />
            <Text
              style={{
                fontSize: 12,
                color: colors.text.secondary,
                marginLeft: 4,
              }}
              numberOfLines={1}
            >
              {tribe.route_start_name} → {tribe.route_end_name}
            </Text>
          </View>
        </View>

        {/* Member Status Badge */}
        {tribe.user_is_member && (
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: COLORS.primary.oceanBlue100 }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: COLORS.primary.oceanBlue700 }}
            >
              {tribe.user_role?.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      {tribe.description && (
        <Text
          style={{
            fontSize: 14,
            color: colors.text.secondary,
            marginBottom: 12,
          }}
          numberOfLines={2}
        >
          {tribe.description}
        </Text>
      )}

      {/* Stats */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
        <View className="flex-row items-center">
          <Ionicons name="people" size={16} color={colors.text.secondary} />
          <Text
            style={{
              fontSize: 13,
              color: colors.text.secondary,
              marginLeft: 4,
            }}
          >
            {tribe.member_count} members
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="chatbubbles" size={16} color={colors.text.secondary} />
          <Text
            style={{
              fontSize: 13,
              color: colors.text.secondary,
              marginLeft: 4,
            }}
          >
            {tribe.message_count} messages
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons
            name={tribe.is_public ? 'globe' : 'lock-closed'}
            size={16}
            color={colors.text.secondary}
          />
          <Text
            style={{
              fontSize: 13,
              color: colors.text.secondary,
              marginLeft: 4,
            }}
          >
            {tribe.is_public ? 'Public' : 'Private'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const displayTribes = activeTab === 'my-tribes' ? myTribes : tribes;

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
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text.primary,
          }}
        >
          Trajectory Tribes
        </Text>

        <TouchableOpacity onPress={handleCreateTribe}>
          <Ionicons name="add-circle" size={28} color={COLORS.primary.oceanBlue700} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('my-tribes')}
          className="flex-1 mr-2"
          style={{
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor:
              activeTab === 'my-tribes'
                ? COLORS.primary.oceanBlue700
                : colors.background.secondary,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              color: activeTab === 'my-tribes' ? 'white' : colors.text.secondary,
            }}
          >
            My Tribes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('discover')}
          className="flex-1 ml-2"
          style={{
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor:
              activeTab === 'discover'
                ? COLORS.primary.oceanBlue700
                : colors.background.secondary,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              color: activeTab === 'discover' ? 'white' : colors.text.secondary,
            }}
          >
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar (Discover Tab Only) */}
      {activeTab === 'discover' && (
        <View className="px-4 pb-2">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.background.secondary,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: colors.border.secondary,
            }}
          >
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              placeholder="Search tribes by name or route..."
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 15,
                color: colors.text.primary,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary.oceanBlue700]}
          />
        }
      >
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
            <Text style={{ marginTop: 16, color: colors.text.secondary }}>
              Loading tribes...
            </Text>
          </View>
        ) : displayTribes.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="people-outline" size={64} color={colors.text.secondary} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text.primary,
                marginTop: 16,
              }}
            >
              {activeTab === 'my-tribes' ? 'No Tribes Yet' : 'No Tribes Found'}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.text.secondary,
                marginTop: 8,
                textAlign: 'center',
                paddingHorizontal: 32,
              }}
            >
              {activeTab === 'my-tribes'
                ? 'Join or create a tribe to start connecting with fellow commuters'
                : 'Try adjusting your search or create a new tribe'}
            </Text>
            <TouchableOpacity
              onPress={handleCreateTribe}
              className="mt-6 px-6 py-3 rounded-xl"
              style={{ backgroundColor: COLORS.primary.oceanBlue700 }}
            >
              <Text className="text-white font-semibold">Create Tribe</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="py-2">
            {displayTribes.map((tribe) => renderTribeCard(tribe))}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TribesListScreen;
