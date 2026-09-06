import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUser } from '@/hooks/useUserProfile';
import type { PublicUserProfile } from '@/types/user';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const PublicProfile = () => {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { colors, isDarkMode } = useAppTheme();
  const { getPublicProfile, profile } = useUser();

  // No userId param means "preview my own profile as others see it" (the
  // screen's original purpose); a userId viewing someone else's profile.
  const isOwnProfile = !userId || Number(userId) === profile?.id;

  const [publicProfile, setPublicProfile] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedLanguages, setSavedLanguages] = useState({
    primary: 'English',
    secondary: [] as string[]
  });

  useEffect(() => {
    loadPublicProfile();
    if (isOwnProfile) {
      loadLanguagePreferences();
    }
  }, [userId]);

  const loadPublicProfile = async () => {
    const targetId = userId ? Number(userId) : profile?.id;
    if (!targetId) return;

    try {
      setIsLoading(true);
      const response = await getPublicProfile(targetId);
      if (response.success && response.data) {
        setPublicProfile(response.data);
      }
    } catch (error) {
      console.error('Failed to load public profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLanguagePreferences = async () => {
    try {
      const primaryLang = await AsyncStorage.getItem('primary_language');
      const secondaryLangs = await AsyncStorage.getItem('secondary_languages');
      
      setSavedLanguages({
        primary: getLanguageName(primaryLang || 'en'),
        secondary: secondaryLangs 
          ? JSON.parse(secondaryLangs).map(getLanguageName)
          : []
      });
    } catch (error) {
      console.error('Failed to load language preferences:', error);
    }
  };

  const getLanguageName = (code: string): string => {
    const languages: { [key: string]: string } = {
      'en': 'English',
      'fr': 'French',
      'ar': 'Arabic',
      'es': 'Spanish',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'zh': 'Chinese',
      'ja': 'Japanese'
    };
    return languages[code] || code;
  };

  const InfoCard = ({ 
    icon, 
    title, 
    value, 
    color = COLORS.primary.oceanBlue700 
  }: {
    icon: string;
    title: string;
    value: string | undefined;
    color?: string;
  }) => (
    <View style={{
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.primary,
      shadowColor: isDarkMode ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name={icon as any} size={20} color={color} />
          <Text style={{
            marginLeft: 12,
            fontSize: 14,
            fontWeight: '500',
            color: colors.text.secondary,
            textTransform: 'uppercase'
          }}>{title}</Text>
        </View>
        <Text style={{
          fontSize: 18,
          color: colors.text.primary,
          marginLeft: 32
        }}>{value || 'Not specified'}</Text>
      </View>
    </View>
  );

  const RatingStars = ({ rating }: { rating: number }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={20} color="#F59E0B" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={20} color="#F59E0B" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={20} color="#F59E0B" />
        );
      }
    }

    return <View className="flex-row">{stars}</View>;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.primary,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006389" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary
          }}>Public Profile</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{
            marginTop: 16,
            color: colors.text.secondary
          }}>Loading your public profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary,
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#006389" />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary
        }}>{isOwnProfile ? 'Public Profile' : 'Profile'}</Text>
        {isOwnProfile ? (
          <TouchableOpacity onPress={() => router.push('../profile/profile' as any)}>
            <Ionicons name="create-outline" size={24} color="#006389" />
          </TouchableOpacity>
        ) : (
          <View className="w-6" />
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {publicProfile && (
          <>
            {/* Profile Header */}
            <View style={{ backgroundColor: colors.background.secondary }}>
              <View className="items-center py-8">
                {/* Profile Photo */}
                <View className="relative">
                  {publicProfile.profile_photo_url ? (
                    <Image
                      source={{ uri: publicProfile.profile_photo_url }}
                      className="w-32 h-32 rounded-full"
                      defaultSource={require('@/assets/images/mix/user.jpg')}
                    />
                  ) : (
                    <View className="w-32 h-32 rounded-full bg-oceanBlue-100 items-center justify-center">
                      <Ionicons name="person" size={48} color="#006389" />
                    </View>
                  )}
                  
                  {/* Verification Badge */}
                  {profile?.is_verified && (
                    <View className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full items-center justify-center border-4 border-white">
                      <Ionicons name="checkmark" size={20} color="white" />
                    </View>
                  )}
                </View>

                {/* Name and Basic Info */}
                <View className="items-center mt-6">
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: colors.text.primary
                  }}>
                    {publicProfile.first_name} {publicProfile.last_name}
                  </Text>
                  
                  <Text style={{
                    fontSize: 18,
                    color: colors.text.secondary,
                    marginTop: 4
                  }}>
                    {publicProfile.role.charAt(0).toUpperCase() + publicProfile.role.slice(1)}
                  </Text>

                  {/* Rating */}
                  {publicProfile.rating_average > 0 && (
                    <View className="flex-row items-center mt-3">
                      <RatingStars rating={publicProfile.rating_average} />
                      <Text style={{
                        marginLeft: 8,
                        fontSize: 18,
                        fontWeight: '500',
                        color: colors.text.primary
                      }}>
                        {publicProfile.rating_average.toFixed(1)}
                      </Text>
                      {publicProfile.rating_count && (
                        <Text style={{
                          marginLeft: 4,
                          color: colors.text.secondary
                        }}>
                          ({publicProfile.rating_count} reviews)
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Bio Section */}
            {publicProfile.bio && (
              <View style={{
                backgroundColor: colors.background.secondary,
                marginHorizontal: 16,
                marginVertical: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border.primary,
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDarkMode ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <View className="p-4">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="document-text" size={20} color={COLORS.primary.oceanBlue700} />
                    <Text style={{
                      marginLeft: 12,
                      fontSize: 14,
                      fontWeight: '500',
                      color: colors.text.secondary,
                      textTransform: 'uppercase'
                    }}>About</Text>
                  </View>
                  <Text style={{
                    color: colors.text.primary,
                    lineHeight: 24
                  }}>{publicProfile.bio}</Text>
                </View>
              </View>
            )}

            {/* Contact Information — only shown for your own preview; the
                public API doesn't return another user's phone/email. */}
            <View className="mt-2">
              {isOwnProfile && (
                <>
                  <InfoCard
                    icon="call"
                    title="Phone Number"
                    value={profile?.phone || 'Not shared publicly'}
                    color="#10B981"
                  />

                  <InfoCard
                    icon="mail"
                    title="Email"
                    value={profile?.email || 'Not shared publicly'}
                    color="#3B82F6"
                  />
                </>
              )}

              <InfoCard
                icon="person"
                title="Role"
                value={publicProfile.role.charAt(0).toUpperCase() + publicProfile.role.slice(1)}
                color="#8B5CF6"
              />
            </View>

            {/* Languages — device-local preference, only meaningful for your own preview */}
            {isOwnProfile && (
            <View style={{
              backgroundColor: colors.background.secondary,
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border.primary,
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDarkMode ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <View className="p-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="language" size={20} color={COLORS.primary.oceanBlue700} />
                  <Text style={{
                    marginLeft: 12,
                    fontSize: 14,
                    fontWeight: '500',
                    color: colors.text.secondary,
                    textTransform: 'uppercase'
                  }}>Languages</Text>
                </View>
                
                <View>
                  <View className="flex-row items-center mb-2">
                    <Text style={{
                      fontWeight: '500',
                      color: colors.text.secondary,
                      marginRight: 8
                    }}>Primary:</Text>
                    <Text style={{color: colors.text.primary}}>{savedLanguages.primary}</Text>
                  </View>
                  
                  {savedLanguages.secondary.length > 0 && (
                    <View className="flex-row items-start">
                      <Text style={{
                        fontWeight: '500',
                        color: colors.text.secondary,
                        marginRight: 8
                      }}>Also speaks:</Text>
                      <View className="flex-1">
                        <Text style={{color: colors.text.primary}}>
                          {savedLanguages.secondary.join(', ')}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {savedLanguages.secondary.length === 0 && (
                    <Text style={{
                      color: colors.text.secondary,
                      fontSize: 14,
                      marginTop: 8
                    }}>
                      No additional languages specified
                    </Text>
                  )}
                </View>
              </View>
            </View>
            )}

            {/* Profile Stats */}
            {(publicProfile.rating_count || profile?.created_at) && (
              <View style={{
                backgroundColor: colors.background.secondary,
                marginHorizontal: 16,
                marginBottom: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border.primary,
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDarkMode ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <View className="p-4">
                  <View className="flex-row items-center mb-4">
                    <Ionicons name="analytics" size={20} color={COLORS.primary.oceanBlue700} />
                    <Text style={{
                      marginLeft: 12,
                      fontSize: 14,
                      fontWeight: '500',
                      color: colors.text.secondary,
                      textTransform: 'uppercase'
                    }}>Profile Stats</Text>
                  </View>
                  
                  <View className="space-y-3">
                    {publicProfile.rating_count > 0 && (
                      <View className="flex-row justify-between items-center">
                        <Text style={{color: colors.text.secondary}}>Reviews Received</Text>
                        <Text style={{
                          fontWeight: '600',
                          color: colors.text.primary
                        }}>{publicProfile.rating_count}</Text>
                      </View>
                    )}
                    
                    {publicProfile.rating_average > 0 && (
                      <View className="flex-row justify-between items-center">
                        <Text style={{color: colors.text.secondary}}>Average Rating</Text>
                        <Text style={{
                          fontWeight: '600',
                          color: colors.text.primary
                        }}>{publicProfile.rating_average.toFixed(1)} ⭐</Text>
                      </View>
                    )}
                    
                    {isOwnProfile && profile?.created_at && (
                      <View className="flex-row justify-between items-center">
                        <Text style={{color: colors.text.secondary}}>Member Since</Text>
                        <Text style={{
                          fontWeight: '600',
                          color: colors.text.primary
                        }}>
                          {new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Profile Completion Tip — only relevant when previewing your own profile */}
            {isOwnProfile && (
            <View className="mx-4 mb-6">
              <View style={{
                backgroundColor: isDarkMode ? colors.background.secondary : '#EFF6FF',
                borderWidth: 1,
                borderColor: isDarkMode ? colors.border.primary : '#BFDBFE',
                borderRadius: 12,
                padding: 16
              }}>
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#3B82F6" />
                  <View className="flex-1 ml-3">
                    <Text style={{
                      color: isDarkMode ? colors.text.primary : '#1E40AF',
                      fontWeight: '500'
                    }}>Public Profile Preview</Text>
                    <Text style={{
                      color: isDarkMode ? colors.text.secondary : '#1D4ED8',
                      fontSize: 14,
                      marginTop: 4
                    }}>
                      This is how other users see your profile. Complete your profile to build trust and connect with more riders.
                    </Text>
                    <TouchableOpacity 
                      className="mt-3"
                      onPress={() => router.push('../profile/profile' as any)}
                    >
                      <View style={{
                        backgroundColor: isDarkMode ? colors.background.tertiary : '#DBEAFE',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        alignSelf: 'flex-start'
                      }}>
                        <Text style={{
                          color: isDarkMode ? colors.text.secondary : '#1D4ED8',
                          fontWeight: '500',
                          fontSize: 14
                        }}>Edit Profile</Text>
                      </View>
                    </TouchableOpacity>
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

export default PublicProfile;