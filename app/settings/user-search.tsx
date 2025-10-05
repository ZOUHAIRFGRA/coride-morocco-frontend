import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '@/constants/theme';
import { useUser } from '@/hooks/useUserProfile';
import type { UserSearchResult, UserSearchParams, PublicUserProfile } from '@/types/user';
import * as Haptics from 'expo-haptics';

const UserSearch = () => {
  const router = useRouter();
  const { searchUsers, getPublicProfile } = useUser();

  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Search filters
  const [filters, setFilters] = useState<UserSearchParams>({
    q: '',
    role: undefined,
    min_rating: undefined,
    verified_only: false,
    limit: 20,
    offset: 0
  });

  const roles = [
    { value: undefined, label: 'All Users', icon: 'people' },
    { value: 'driver', label: 'Drivers', icon: 'car' },
    { value: 'rider', label: 'Riders', icon: 'person' }
  ];

  const ratings = [
    { value: undefined, label: 'Any Rating' },
    { value: 4, label: '4+ Stars' },
    { value: 4.5, label: '4.5+ Stars' }
  ];

  useEffect(() => {
    // Load popular users when component mounts
    performSearch({ ...filters, q: '' });
  }, []);

  const performSearch = async (searchParams: UserSearchParams = filters, reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setSearchResults([]);
      }

      const response = await searchUsers({
        ...searchParams,
        offset: reset ? 0 : searchResults.length
      });

      if (response.success && response.data) {
        if (reset) {
          setSearchResults(response.data);
        } else {
          setSearchResults(prev => [...prev, ...response.data!]);
        }
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Error', 'Failed to search users. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...filters, q: query };
    setFilters(newFilters);
    performSearch(newFilters, true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFilterChange = (key: keyof UserSearchParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    performSearch(newFilters, true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    performSearch(filters, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && searchResults.length >= (filters.limit || 20)) {
      performSearch(filters, false);
    }
  };

  const handleViewProfile = async (userId: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await getPublicProfile(userId);
      
      if (response.success && response.data) {
        const profile = response.data;
        Alert.alert(
          `${profile.first_name} ${profile.last_name}`,
          `Role: ${profile.role}\\nRating: ${profile.rating_average?.toFixed(1) || 'No rating'} (${profile.rating_count} reviews)\\n\\n${profile.bio || 'No bio available'}`,
          [
            { text: 'Close', style: 'cancel' },
            { text: 'Contact', onPress: () => {
              Alert.alert('Contact User', 'Messaging feature coming soon!');
            }}
          ]
        );
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load user profile. Please try again.');
    }
  };

  const UserCard = ({ user }: { user: UserSearchResult }) => {
    const getInitials = (firstName: string, lastName: string) => {
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getRoleIcon = (role: string) => {
      switch (role) {
        case 'driver': return 'car';
        case 'rider': return 'person';
        default: return 'people';
      }
    };

    return (
      <TouchableOpacity
        className="bg-white rounded-xl mx-4 mb-3 shadow-sm border border-gray-100"
        onPress={() => handleViewProfile(user.id)}
      >
        <View className="p-4">
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="w-12 h-12 rounded-full bg-primary-oceanBlue100 items-center justify-center mr-3">
              {user.profile_photo_url ? (
                <Image
                  source={{ uri: user.profile_photo_url }}
                  className="w-12 h-12 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-primary-oceanBlue700 font-bold text-lg">
                  {getInitials(user.first_name, user.last_name)}
                </Text>
              )}
            </View>

            {/* User Info */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-semiBold text-gray-900">
                  {user.first_name} {user.last_name}
                </Text>
                <View className="ml-2 flex-row items-center">
                  <Ionicons 
                    name={getRoleIcon(user.role) as any} 
                    size={14} 
                    color={COLORS.primary.oceanBlue700} 
                  />
                  <Text className="text-primary-oceanBlue600 text-xs font-medium ml-1 capitalize">
                    {user.role}
                  </Text>
                </View>
              </View>

              {/* Rating */}
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-gray-600 text-sm ml-1">
                  {user.rating_average?.toFixed(1) || '0.0'} ({user.rating_count} reviews)
                </Text>
              </View>

              {/* Bio preview */}
              {user.bio && (
                <Text className="text-gray-500 text-sm mt-2" numberOfLines={2}>
                  {user.bio}
                </Text>
              )}
            </View>

            {/* Arrow */}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterChip = ({ 
    label, 
    isActive, 
    onPress 
  }: { 
    label: string; 
    isActive: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full mr-2 border ${
        isActive 
          ? 'bg-primary-oceanBlue600 border-primary-oceanBlue600' 
          : 'bg-gray-100 border-gray-300'
      }`}
      onPress={onPress}
    >
      <Text className={`text-sm font-medium ${
        isActive ? 'text-white' : 'text-gray-700'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#006389" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Find Users</Text>
        <View className="w-6" />
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-white">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-md text-gray-900"
            placeholder="Search by name or email..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View className="bg-white px-4 pb-3">
        {/* Role Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {roles.map((role) => (
            <FilterChip
              key={role.label}
              label={role.label}
              isActive={filters.role === role.value}
              onPress={() => handleFilterChange('role', role.value)}
            />
          ))}
        </ScrollView>

        {/* Additional Filters Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ratings.map((rating) => (
            <FilterChip
              key={rating.label}
              label={rating.label}
              isActive={filters.min_rating === rating.value}
              onPress={() => handleFilterChange('min_rating', rating.value)}
            />
          ))}
          <FilterChip
            label="Verified Only"
            isActive={filters.verified_only || false}
            onPress={() => handleFilterChange('verified_only', !filters.verified_only)}
          />
        </ScrollView>
      </View>

      {/* Results */}
      {isLoading && searchResults.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text className="mt-4 text-gray-500">
            {hasSearched ? 'Searching users...' : 'Loading popular users...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <UserCard user={item} />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary.oceanBlue700}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            isLoading && searchResults.length > 0 ? (
              <View className="py-4">
                <ActivityIndicator size="small" color={COLORS.primary.oceanBlue700} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            hasSearched ? (
              <View className="flex-1 justify-center items-center py-20">
                <Ionicons name="search" size={60} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg font-medium mt-4">No users found</Text>
                <Text className="text-gray-400 text-center mt-2 px-8">
                  Try adjusting your search terms or filters
                </Text>
                <TouchableOpacity
                  className="mt-6 bg-primary-oceanBlue600 py-3 px-6 rounded-xl"
                  onPress={() => {
                    setSearchQuery('');
                    setFilters({ ...filters, q: '', role: undefined, min_rating: undefined, verified_only: false });
                    performSearch({ ...filters, q: '', role: undefined, min_rating: undefined, verified_only: false }, true);
                  }}
                >
                  <Text className="text-white font-semiBold">Show All Users</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

      {/* Info Banner */}
      <View className="px-4 pb-4">
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={16} color="#3B82F6" />
            <Text className="flex-1 ml-2 text-blue-800 text-sm">
              Tap on any user to view their public profile and contact them
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UserSearch;