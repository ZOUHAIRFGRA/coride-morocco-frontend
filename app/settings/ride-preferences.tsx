import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '@/constants/theme';
import { useUser } from '@/hooks/useUserProfile';
import type { UserPreferences, UpdatePreferencesRequest } from '@/types/user';
import * as Haptics from 'expo-haptics';

const RidePreferences = () => {
  const router = useRouter();
  const { getPreferences, updatePreferences, profile } = useUser();

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Local state for preferences
  const [localPreferences, setLocalPreferences] = useState<UpdatePreferencesRequest>({
    music_preference: 'any',
    conversation_preference: 'any',
    smoking_allowed: false,
    pets_allowed: false,
    air_conditioning: true,
    max_detour_minutes: 15
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      
      // Try to get preferences from API first
      const response = await getPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
        setLocalPreferences(response.data);
      } else {
        // Fallback to profile data if available
        if (profile) {
          const fallbackPrefs: UserPreferences = {
            music_preference: profile.music_preference || 'any',
            conversation_preference: profile.conversation_preference || 'any',
            smoking_allowed: profile.smoking_allowed || false,
            pets_allowed: profile.pets_allowed || false,
            air_conditioning: profile.air_conditioning ?? true,
            max_detour_minutes: profile.max_detour_minutes || 15
          };
          setPreferences(fallbackPrefs);
          setLocalPreferences(fallbackPrefs);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      Alert.alert('Error', 'Failed to load preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof UpdatePreferencesRequest, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const response = await updatePreferences(localPreferences);
      if (response.success) {
        setPreferences(response.data!);
        setHasUnsavedChanges(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Your ride preferences have been updated!');
      } else {
        throw new Error(response.error || 'Failed to update preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetPreferences = () => {
    if (preferences) {
      setLocalPreferences(preferences);
      setHasUnsavedChanges(false);
    }
  };

  const PreferenceSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mt-6">
      <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-3">
        {title}
      </Text>
      <View className="bg-white rounded-xl mx-4 shadow-sm">
        {children}
      </View>
    </View>
  );

  const SelectOption = ({ 
    title, 
    subtitle, 
    options, 
    value, 
    onSelect,
    icon 
  }: {
    title: string;
    subtitle: string;
    options: { label: string; value: string; description: string }[];
    value: string;
    onSelect: (value: string) => void;
    icon: string;
  }) => (
    <View className="p-4 border-b border-gray-50">
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-primary-oceanBlue50 items-center justify-center mr-3">
          <Ionicons name={icon as any} size={16} color={COLORS.primary.oceanBlue700} />
        </View>
        <View className="flex-1">
          <Text className="text-md font-semiBold text-gray-900">{title}</Text>
          <Text className="text-sm text-gray-500">{subtitle}</Text>
        </View>
      </View>
      <View className="flex-row justify-between">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`flex-1 mx-1 p-3 rounded-lg border-2 ${
              value === option.value
                ? 'border-primary-oceanBlue500 bg-primary-oceanBlue50'
                : 'border-gray-200 bg-gray-50'
            }`}
            onPress={() => onSelect(option.value)}
          >
            <Text className={`text-center text-sm font-medium ${
              value === option.value ? 'text-primary-oceanBlue700' : 'text-gray-600'
            }`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ToggleOption = ({ 
    title, 
    subtitle, 
    value, 
    onToggle, 
    icon 
  }: {
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    icon: string;
  }) => (
    <View className="flex-row items-center p-4 border-b border-gray-50">
      <View className="w-8 h-8 rounded-full bg-primary-oceanBlue50 items-center justify-center mr-3">
        <Ionicons name={icon as any} size={16} color={COLORS.primary.oceanBlue700} />
      </View>
      <View className="flex-1">
        <Text className="text-md font-semiBold text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500">{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: COLORS.primary.oceanBlue100 }}
        thumbColor={value ? COLORS.primary.oceanBlue700 : '#9CA3AF'}
      />
    </View>
  );

  const SliderOption = ({ 
    title, 
    subtitle, 
    value, 
    onSelect,
    icon,
    min = 0,
    max = 60,
    unit = 'minutes'
  }: {
    title: string;
    subtitle: string;
    value: number;
    onSelect: (value: number) => void;
    icon: string;
    min?: number;
    max?: number;
    unit?: string;
  }) => {
    const options = [5, 10, 15, 30, 45, 60];
    
    return (
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 rounded-full bg-primary-oceanBlue50 items-center justify-center mr-3">
            <Ionicons name={icon as any} size={16} color={COLORS.primary.oceanBlue700} />
          </View>
          <View className="flex-1">
            <Text className="text-md font-semiBold text-gray-900">{title}</Text>
            <Text className="text-sm text-gray-500">{subtitle}</Text>
          </View>
        </View>
        <View className="flex-row flex-wrap justify-between">
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              className={`m-1 px-4 py-2 rounded-lg border-2 ${
                value === option
                  ? 'border-primary-oceanBlue500 bg-primary-oceanBlue50'
                  : 'border-gray-200 bg-gray-50'
              }`}
              onPress={() => onSelect(option)}
            >
              <Text className={`text-center text-sm font-medium ${
                value === option ? 'text-primary-oceanBlue700' : 'text-gray-600'
              }`}>
                {option} {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006389" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Ride Preferences</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text className="mt-4 text-gray-500">Loading your preferences...</Text>
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
        <Text className="text-lg font-semibold text-gray-900">Ride Preferences</Text>
        <TouchableOpacity onPress={savePreferences} disabled={!hasUnsavedChanges || isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#006389" />
          ) : (
            <Ionicons 
              name="checkmark" 
              size={24} 
              color={hasUnsavedChanges ? "#00C853" : "#9CA3AF"} 
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Music Preferences */}
        <PreferenceSection title="Music Preferences">
          <SelectOption
            title="Music During Rides"
            subtitle="How do you prefer music during rides?"
            icon="musical-notes"
            value={localPreferences.music_preference || 'any'}
            onSelect={(value) => handlePreferenceChange('music_preference', value)}
            options={[
              { label: 'Quiet', value: 'quiet', description: 'No music' },
              { label: 'Background', value: 'background', description: 'Low volume' },
              { label: 'Any', value: 'any', description: 'No preference' }
            ]}
          />
        </PreferenceSection>

        {/* Conversation Preferences */}
        <PreferenceSection title="Conversation Preferences">
          <SelectOption
            title="Conversation Level"
            subtitle="How chatty do you like to be during rides?"
            icon="chatbubbles"
            value={localPreferences.conversation_preference || 'any'}
            onSelect={(value) => handlePreferenceChange('conversation_preference', value)}
            options={[
              { label: 'Chatty', value: 'chatty', description: 'Love to chat' },
              { label: 'Quiet', value: 'quiet', description: 'Prefer silence' },
              { label: 'Any', value: 'any', description: 'No preference' }
            ]}
          />
        </PreferenceSection>

        {/* Comfort Preferences */}
        <PreferenceSection title="Comfort & Environment">
          <ToggleOption
            title="Air Conditioning"
            subtitle="Do you prefer air conditioning during rides?"
            icon="snow"
            value={localPreferences.air_conditioning ?? true}
            onToggle={(value) => handlePreferenceChange('air_conditioning', value)}
          />
          <ToggleOption
            title="Pets Allowed"
            subtitle="Are you comfortable with pets in the car?"
            icon="paw"
            value={localPreferences.pets_allowed ?? false}
            onToggle={(value) => handlePreferenceChange('pets_allowed', value)}
          />
          <ToggleOption
            title="Smoking Allowed"
            subtitle="Are you okay with smoking during rides?"
            icon="ban"
            value={localPreferences.smoking_allowed ?? false}
            onToggle={(value) => handlePreferenceChange('smoking_allowed', value)}
          />
        </PreferenceSection>

        {/* Route Preferences */}
        <PreferenceSection title="Route Flexibility">
          <SliderOption
            title="Maximum Detour"
            subtitle="How much extra time are you willing to add for pickups/dropoffs?"
            icon="time"
            value={localPreferences.max_detour_minutes || 15}
            onSelect={(value) => handlePreferenceChange('max_detour_minutes', value)}
            min={0}
            max={60}
            unit="min"
          />
        </PreferenceSection>

        {/* Save/Reset Actions */}
        {hasUnsavedChanges && (
          <View className="mt-6 mx-4 mb-8">
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center">
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <Text className="ml-2 text-amber-800 font-medium">You have unsaved changes</Text>
              </View>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-4 rounded-xl mr-2"
                onPress={resetPreferences}
              >
                <Text className="text-center text-gray-700 font-semiBold">Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-primary-oceanBlue600 py-4 rounded-xl ml-2"
                onPress={savePreferences}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center text-white font-semiBold">Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RidePreferences;