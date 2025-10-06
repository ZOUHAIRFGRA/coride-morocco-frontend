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
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUser } from '@/hooks/useUserProfile';
import type { UserPreferences, UpdatePreferencesRequest } from '@/types/user';
import * as Haptics from 'expo-haptics';

const RidePreferences = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useAppTheme();
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
      <Text style={{
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.secondary,
        textTransform: 'uppercase',
        paddingHorizontal: 16,
        marginBottom: 12
      }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        marginHorizontal: 16,
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border.primary
      }}>
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
    <View style={{
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.primary,
      backgroundColor: colors.background.secondary,
    }}>
      <View className="flex-row items-center mb-3">
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: COLORS.primary.oceanBlue50,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12
        }}>
          <Ionicons name={icon as any} size={16} color={COLORS.primary.oceanBlue700} />
        </View>
        <View className="flex-1">
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text.primary
          }}>{title}</Text>
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary
          }}>{subtitle}</Text>
        </View>
      </View>
      <View className="flex-row justify-between">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={{
              flex: 1,
              marginHorizontal: 4,
              padding: 12,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: value === option.value ? COLORS.primary.oceanBlue700 : colors.border.primary,
              backgroundColor: value === option.value ? COLORS.primary.oceanBlue50 : colors.background.secondary,
            }}
            onPress={() => onSelect(option.value)}
          >
            <Text style={{
              textAlign: 'center',
              fontSize: 14,
              fontWeight: '500',
              color: value === option.value ? colors.primary.dark : colors.text.secondary
            }}>
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
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.primary
    }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary.oceanBlue50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
      }}>
        <Ionicons name={icon as any} size={16} color={COLORS.primary.oceanBlue700} />
      </View>
      <View className="flex-1">
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text.primary
        }}>{title}</Text>
        <Text style={{
          fontSize: 14,
          color: colors.text.secondary
        }}>{subtitle}</Text>
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
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: COLORS.primary.oceanBlue50,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <Ionicons name={icon as any} size={16} color={COLORS.primary.oceanBlue700} />
          </View>
          <View className="flex-1">
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary
            }}>{title}</Text>
            <Text style={{
              fontSize: 14,
              color: colors.text.secondary
            }}>{subtitle}</Text>
          </View>
        </View>
        <View className="flex-row flex-wrap justify-between">
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={{
                margin: 4,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: value === option ? COLORS.primary.oceanBlue700 : colors.border.primary,
                backgroundColor: value === option ? COLORS.primary.oceanBlue50 : colors.background.secondary,
              }}
              onPress={() => onSelect(option)}
            >
              <Text style={{
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '500',
                color: value === option ? colors.primary.dark : colors.text.secondary
              }}>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
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
            <Ionicons name="arrow-back" size={24} color="#006389" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary
          }}>Ride Preferences</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{
            marginTop: 16,
            color: colors.text.secondary
          }}>Loading your preferences...</Text>
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
        }}>Ride Preferences</Text>
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

      <ScrollView style={{ flex: 1, backgroundColor: colors.background.primary }} showsVerticalScrollIndicator={false}>
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
            <View style={{
              backgroundColor: isDarkMode ? '#FEF3C7' : '#FEF3C7',
              borderWidth: 1,
              borderColor: '#F3E8FF',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <View className="flex-row items-center">
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <Text style={{
                  marginLeft: 8,
                  color: isDarkMode ? '#92400E' : '#92400E',
                  fontWeight: '500'
                }}>You have unsaved changes</Text>
              </View>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                style={{
                  flex: 1,
                  backgroundColor: colors.background.secondary,
                  paddingVertical: 16,
                  borderRadius: 12,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: colors.border.primary,
                }}
                onPress={resetPreferences}
              >
                <Text style={{
                  textAlign: 'center',
                  color: colors.text.secondary,
                  fontWeight: '600'
                }}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{
                  flex: 1,
                  backgroundColor: COLORS.primary.oceanBlue600,
                  paddingVertical: 16,
                  borderRadius: 12,
                  marginLeft: 8,
                }}
                onPress={savePreferences}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{
                    textAlign: 'center',
                    color: '#FFFFFF',
                    fontWeight: '600'
                  }}>Save Changes</Text>
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