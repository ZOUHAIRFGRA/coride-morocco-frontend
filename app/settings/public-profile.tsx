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
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '@/constants/theme';
import { useUser } from '@/hooks/useUserProfile';
import type { PublicUserProfile } from '@/types/user';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const PublicProfile = () => {
  const router = useRouter();
  const { getPublicProfile, profile } = useUser();

  const [publicProfile, setPublicProfile] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedLanguages, setSavedLanguages] = useState({
    primary: 'English',
    secondary: [] as string[]
  });

  useEffect(() => {
    loadPublicProfile();
    loadLanguagePreferences();
  }, []);

  const loadPublicProfile = async () => {
    if (!profile?.id) return;
    
    try {
      setIsLoading(true);
      const response = await getPublicProfile(profile.id);
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
    <View className="bg-white rounded-xl mx-4 mb-4 shadow-sm border border-gray-100">
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name={icon as any} size={20} color={color} />
          <Text className="ml-3 text-sm font-medium text-gray-500 uppercase">{title}</Text>
        </View>
        <Text className="text-lg text-gray-900 ml-8">{value || 'Not specified'}</Text>
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
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006389" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Public Profile</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text className="mt-4 text-gray-500">Loading your public profile...</Text>
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
        <Text className="text-lg font-semibold text-gray-900">Public Profile</Text>
        <TouchableOpacity onPress={() => router.push('/settings/edit-profile' as any)}>
          <Ionicons name="create-outline" size={24} color="#006389" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {publicProfile && (
          <>
            {/* Profile Header */}
            <View className="bg-white">
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
                  <Text className="text-2xl font-bold text-gray-900">
                    {publicProfile.first_name} {publicProfile.last_name}
                  </Text>
                  
                  <Text className="text-lg text-gray-600 mt-1">
                    {publicProfile.role.charAt(0).toUpperCase() + publicProfile.role.slice(1)}
                  </Text>

                  {/* Rating */}
                  {publicProfile.rating_average > 0 && (
                    <View className="flex-row items-center mt-3">
                      <RatingStars rating={publicProfile.rating_average} />
                      <Text className="ml-2 text-lg font-medium text-gray-700">
                        {publicProfile.rating_average.toFixed(1)}
                      </Text>
                      {publicProfile.rating_count && (
                        <Text className="ml-1 text-gray-500">
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
              <View className="bg-white mx-4 my-4 rounded-xl shadow-sm border border-gray-100">
                <View className="p-4">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="document-text" size={20} color={COLORS.primary.oceanBlue700} />
                    <Text className="ml-3 text-sm font-medium text-gray-500 uppercase">About</Text>
                  </View>
                  <Text className="text-gray-900 leading-6">{publicProfile.bio}</Text>
                </View>
              </View>
            )}

            {/* Contact Information */}
            <View className="mt-2">
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

              <InfoCard
                icon="person"
                title="Role"
                value={publicProfile.role.charAt(0).toUpperCase() + publicProfile.role.slice(1)}
                color="#8B5CF6"
              />
            </View>

            {/* Languages */}
            <View className="bg-white mx-4 mb-4 rounded-xl shadow-sm border border-gray-100">
              <View className="p-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="language" size={20} color={COLORS.primary.oceanBlue700} />
                  <Text className="ml-3 text-sm font-medium text-gray-500 uppercase">Languages</Text>
                </View>
                
                <View>
                  <View className="flex-row items-center mb-2">
                    <Text className="font-medium text-gray-700 mr-2">Primary:</Text>
                    <Text className="text-gray-900">{savedLanguages.primary}</Text>
                  </View>
                  
                  {savedLanguages.secondary.length > 0 && (
                    <View className="flex-row items-start">
                      <Text className="font-medium text-gray-700 mr-2">Also speaks:</Text>
                      <View className="flex-1">
                        <Text className="text-gray-900">
                          {savedLanguages.secondary.join(', ')}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {savedLanguages.secondary.length === 0 && (
                    <Text className="text-gray-500 text-sm mt-2">
                      No additional languages specified
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Profile Stats */}
            {(publicProfile.rating_count || profile?.created_at) && (
              <View className="bg-white mx-4 mb-4 rounded-xl shadow-sm border border-gray-100">
                <View className="p-4">
                  <View className="flex-row items-center mb-4">
                    <Ionicons name="analytics" size={20} color={COLORS.primary.oceanBlue700} />
                    <Text className="ml-3 text-sm font-medium text-gray-500 uppercase">Profile Stats</Text>
                  </View>
                  
                  <View className="space-y-3">
                    {publicProfile.rating_count > 0 && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-600">Reviews Received</Text>
                        <Text className="font-semiBold text-gray-900">{publicProfile.rating_count}</Text>
                      </View>
                    )}
                    
                    {publicProfile.rating_average > 0 && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-600">Average Rating</Text>
                        <Text className="font-semiBold text-gray-900">{publicProfile.rating_average.toFixed(1)} ⭐</Text>
                      </View>
                    )}
                    
                    {profile?.created_at && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-600">Member Since</Text>
                        <Text className="font-semiBold text-gray-900">
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

            {/* Profile Completion Tip */}
            <View className="mx-4 mb-6">
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#3B82F6" />
                  <View className="flex-1 ml-3">
                    <Text className="text-blue-800 font-medium">Public Profile Preview</Text>
                    <Text className="text-blue-700 text-sm mt-1">
                      This is how other users see your profile. Complete your profile to build trust and connect with more riders.
                    </Text>
                    <TouchableOpacity 
                      className="mt-3"
                      onPress={() => router.push('/settings/edit-profile' as any)}
                    >
                      <View className="bg-blue-100 rounded-lg px-3 py-2 self-start">
                        <Text className="text-blue-700 font-medium text-sm">Edit Profile</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PublicProfile;