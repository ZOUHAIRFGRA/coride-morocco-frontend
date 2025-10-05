import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '@/constants/theme';
import { useUser } from '@/hooks/useUserProfile';
import type { UserStats } from '@/types/user';
import * as Haptics from 'expo-haptics';

const Statistics = () => {
  const router = useRouter();
  const { getStats, profile } = useUser();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStats();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const StatCard = ({ 
    icon, 
    title, 
    value, 
    description, 
    color = COLORS.primary.oceanBlue700,
    backgroundColor = COLORS.primary.oceanBlue50 
  }: {
    icon: string;
    title: string;
    value: string | number;
    description?: string;
    color?: string;
    backgroundColor?: string;
  }) => (
    <View className="bg-white rounded-xl mx-4 mb-4 shadow-sm border border-gray-100">
      <View className="p-6">
        <View className="flex-row items-center mb-4">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor }}
          >
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semiBold text-gray-900">{title}</Text>
            {description && (
              <Text className="text-sm text-gray-500 mt-1">{description}</Text>
            )}
          </View>
        </View>
        <Text className="text-3xl font-bold text-gray-900">{value}</Text>
      </View>
    </View>
  );

  const ProgressCard = ({ 
    title, 
    percentage, 
    description,
    color = COLORS.primary.oceanBlue700 
  }: {
    title: string;
    percentage: number;
    description?: string;
    color?: string;
  }) => (
    <View className="bg-white rounded-xl mx-4 mb-4 shadow-sm border border-gray-100">
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semiBold text-gray-900">{title}</Text>
          <Text className="text-xl font-bold" style={{ color }}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
        
        {/* Progress Bar */}
        <View className="bg-gray-200 rounded-full h-3 mb-2">
          <View 
            className="h-3 rounded-full"
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: color 
            }} 
          />
        </View>
        
        {description && (
          <Text className="text-sm text-gray-500">{description}</Text>
        )}
      </View>
    </View>
  );

  const InfoRow = ({ 
    icon, 
    label, 
    value, 
    color = '#10B981' 
  }: {
    icon: string;
    label: string;
    value: string;
    color?: string;
  }) => (
    <View className="flex-row items-center py-3 px-6 border-b border-gray-50">
      <Ionicons name={icon as any} size={20} color={color} />
      <Text className="flex-1 ml-4 text-gray-700">{label}</Text>
      <Text className="font-semiBold text-gray-900">{value}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006389" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">My Statistics</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text className="mt-4 text-gray-500">Loading your statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#006389" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">My Statistics</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#006389" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary.oceanBlue700}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {stats && (
          <>
            {/* Profile Completion */}
            <View className="mt-4">
              <ProgressCard
                title="Profile Completion"
                percentage={stats.profile_completion}
                description="Complete your profile to increase trust and find better matches"
                color={stats.profile_completion >= 80 ? '#10B981' : '#F59E0B'}
              />
            </View>

            {/* Key Metrics */}
            <View className="mt-2">
              <StatCard
                icon="star"
                title="Average Rating"
                value={stats.rating_average?.toFixed(1) || '0.0'}
                description="Based on reviews from other users"
                color="#F59E0B"
                backgroundColor="#FEF3C7"
              />

              <StatCard
                icon="people"
                title="Total Reviews"
                value={stats.rating_count}
                description="Number of reviews received"
                color="#8B5CF6"
                backgroundColor="#EDE9FE"
              />

              <StatCard
                icon="location"
                title="Saved Locations"
                value={stats.saved_locations}
                description="Frequently visited places"
                color="#06B6D4"
                backgroundColor="#CFFAFE"
              />
            </View>

            {/* Account Information */}
            <View className="mt-2">
              <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-3">
                Account Information
              </Text>
              
              <View className="bg-white rounded-xl mx-4 mb-4 shadow-sm border border-gray-100">
                <InfoRow
                  icon="calendar"
                  label="Member Since"
                  value={new Date(stats.member_since).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  color="#6B7280"
                />
                
                <InfoRow
                  icon="time"
                  label="Last Login"
                  value={new Date(stats.last_login).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  color="#6B7280"
                />
                
                <InfoRow
                  icon="mail"
                  label="Email Verified"
                  value={stats.email_verified ? 'Verified' : 'Not Verified'}
                  color={stats.email_verified ? '#10B981' : '#EF4444'}
                />
                
                <InfoRow
                  icon="phone-portrait"
                  label="Phone Verified"
                  value={stats.phone_verified ? 'Verified' : 'Not Verified'}
                  color={stats.phone_verified ? '#10B981' : '#EF4444'}
                />
              </View>
            </View>

            {/* Profile Insights */}
            <View className="mt-2">
              <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-3">
                Profile Insights
              </Text>
              
              <View className="bg-white rounded-xl mx-4 mb-4 shadow-sm border border-gray-100 p-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="analytics" size={24} color={COLORS.primary.oceanBlue700} />
                  <Text className="ml-3 text-lg font-semiBold text-gray-900">Profile Strength</Text>
                </View>
                
                <View className="space-y-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600">Basic Information</Text>
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={profile ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={profile ? '#10B981' : '#EF4444'} 
                      />
                      <Text className="ml-1 text-sm font-medium text-gray-900">
                        {profile ? 'Complete' : 'Incomplete'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600">Profile Photo</Text>
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={profile?.profile_photo_url ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={profile?.profile_photo_url ? '#10B981' : '#EF4444'} 
                      />
                      <Text className="ml-1 text-sm font-medium text-gray-900">
                        {profile?.profile_photo_url ? 'Added' : 'Missing'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600">Bio Description</Text>
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={profile?.bio ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={profile?.bio ? '#10B981' : '#EF4444'} 
                      />
                      <Text className="ml-1 text-sm font-medium text-gray-900">
                        {profile?.bio ? 'Added' : 'Missing'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600">Saved Locations</Text>
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={stats.saved_locations > 0 ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={stats.saved_locations > 0 ? '#10B981' : '#EF4444'} 
                      />
                      <Text className="ml-1 text-sm font-medium text-gray-900">
                        {stats.saved_locations > 0 ? `${stats.saved_locations} saved` : 'None saved'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Tips for Improvement */}
            {stats.profile_completion < 90 && (
              <View className="mt-2 mx-4 mb-4">
                <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <View className="flex-row items-start">
                    <Ionicons name="bulb" size={20} color="#F59E0B" />
                    <View className="flex-1 ml-3">
                      <Text className="text-amber-800 font-medium">Improve Your Profile</Text>
                      <Text className="text-amber-700 text-sm mt-1">
                        Complete your profile to increase visibility and trust with other users:
                      </Text>
                      <View className="mt-2">
                        {!profile?.profile_photo_url && (
                          <Text className="text-amber-700 text-sm">• Add a profile photo</Text>
                        )}
                        {!profile?.bio && (
                          <Text className="text-amber-700 text-sm">• Write a bio description</Text>
                        )}
                        {stats.saved_locations === 0 && (
                          <Text className="text-amber-700 text-sm">• Save frequently visited locations</Text>
                        )}
                        {!stats.phone_verified && (
                          <Text className="text-amber-700 text-sm">• Verify your phone number</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Statistics;