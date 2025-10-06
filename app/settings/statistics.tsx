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
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUser } from '@/hooks/useUserProfile';
import type { UserStats } from '@/types/user';
import * as Haptics from 'expo-haptics';

const Statistics = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useAppTheme();
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
    <View style={{
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      shadowColor: isDarkMode ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border.primary
    }}>
      <View className="p-6">
        <View className="flex-row items-center mb-4">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor }}
          >
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          <View className="flex-1">
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text.primary
            }}>{title}</Text>
            {description && (
              <Text style={{
                fontSize: 14,
                color: colors.text.secondary,
                marginTop: 4
              }}>{description}</Text>
            )}
          </View>
        </View>
        <Text style={{
          fontSize: 30,
          fontWeight: 'bold',
          color: colors.text.primary
        }}>{value}</Text>
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
    <View style={{
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      shadowColor: isDarkMode ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border.primary
    }}>
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary
          }}>{title}</Text>
          <Text className="text-xl font-bold" style={{ color }}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
        
        {/* Progress Bar */}
        <View style={{
          backgroundColor: colors.border.secondary,
          borderRadius: 6,
          height: 12,
          marginBottom: 8
        }}>
          <View 
            className="h-3 rounded-full"
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: color 
            }} 
          />
        </View>
        
        {description && (
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary
          }}>{description}</Text>
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
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary
    }}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={{
        flex: 1,
        marginLeft: 16,
        color: colors.text.secondary
      }}>{label}</Text>
      <Text style={{
        fontWeight: '600',
        color: colors.text.primary
      }}>{value}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: colors.background.primary
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.primary
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary
          }}>My Statistics</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{
            marginTop: 16,
            color: colors.text.secondary
          }}>Loading your statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: colors.background.primary
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary
        }}>My Statistics</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={colors.primary.dark} />
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
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.secondary,
                textTransform: 'uppercase',
                paddingHorizontal: 16,
                marginBottom: 12
              }}>
                Account Information
              </Text>
              
              <View style={{
                backgroundColor: colors.background.secondary,
                borderRadius: 12,
                marginHorizontal: 16,
                marginBottom: 16,
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDarkMode ? 0.3 : 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: colors.border.primary
              }}>
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
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text.secondary,
                textTransform: 'uppercase',
                paddingHorizontal: 16,
                marginBottom: 12
              }}>
                Profile Insights
              </Text>
              
              <View style={{
                backgroundColor: colors.background.secondary,
                borderRadius: 12,
                marginHorizontal: 16,
                marginBottom: 16,
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDarkMode ? 0.3 : 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: colors.border.primary,
                padding: 24
              }}>
                <View className="flex-row items-center mb-4">
                  <Ionicons name="analytics" size={24} color={COLORS.primary.oceanBlue700} />
                  <Text style={{
                    marginLeft: 12,
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.text.primary
                  }}>Profile Strength</Text>
                </View>
                
                <View className="space-y-3">
                  <View className="flex-row items-center justify-between">
                    <Text style={{color: colors.text.secondary}}>Basic Information</Text>
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={profile ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={profile ? '#10B981' : '#EF4444'} 
                      />
                      <Text style={{
                        marginLeft: 4,
                        fontSize: 14,
                        fontWeight: '500',
                        color: colors.text.primary
                      }}>
                        {profile ? '100%' : '0%'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <Text style={{color: colors.text.secondary}}>Profile Photo</Text>
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={profile?.profile_photo_url ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={profile?.profile_photo_url ? '#10B981' : '#EF4444'} 
                      />
                      <Text style={{
                        marginLeft: 4,
                        fontSize: 14,
                        fontWeight: '500',
                        color: colors.text.primary
                      }}>
                        {profile?.profile_photo_url ? '100%' : '0%'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <Text style={{color: colors.text.secondary}}>Bio Description</Text>
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={profile?.bio ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={profile?.bio ? '#10B981' : '#EF4444'} 
                      />
                      <Text style={{
                        marginLeft: 4,
                        fontSize: 14,
                        fontWeight: '500',
                        color: colors.text.primary
                      }}>
                        {profile?.bio ? '100%' : '0%'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <Text style={{color: colors.text.secondary}}>Saved Locations</Text>
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={stats.saved_locations > 0 ? 'checkmark-circle' : 'close-circle'} 
                        size={16} 
                        color={stats.saved_locations > 0 ? '#10B981' : '#EF4444'} 
                      />
                                            <Text style={{
                        marginLeft: 4,
                        fontSize: 14,
                        fontWeight: '500',
                        color: colors.text.primary
                      }}>
                        {stats?.saved_locations > 0 ? '100%' : '0%'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Tips for Improvement */}
            {stats.profile_completion < 90 && (
              <View className="mt-2 mx-4 mb-4">
                <View style={{
                  backgroundColor: isDarkMode ? colors.background.secondary : '#FFFBEB',
                  borderWidth: 1,
                  borderColor: isDarkMode ? colors.border.primary : '#FED7AA',
                  borderRadius: 12,
                  padding: 16
                }}>
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