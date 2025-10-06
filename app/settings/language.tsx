import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '@/constants/theme';
import { useUser } from '@/hooks/useUserProfile';
import type { UserProfile } from '@/types/user';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/hooks/useAppTheme';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇲🇦' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

interface LanguagePreference {
  primary_language: string;
  secondary_languages: string[];
  interface_language: string;
}

const LanguageSettings = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useAppTheme();
  const { profile, updateProfile } = useUser();

  const [preferences, setPreferences] = useState<LanguagePreference>({
    primary_language: 'en',
    secondary_languages: [],
    interface_language: 'en'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadLanguagePreferences();
  }, []);

  const loadLanguagePreferences = async () => {
    try {
      setIsLoading(true);
      
      // Load from user profile or local storage
      const localLang = await AsyncStorage.getItem('app_language');
      const defaultPreferences: LanguagePreference = {
        primary_language: localLang || 'en',
        secondary_languages: [],
        interface_language: localLang || 'en'
      };
      
      setPreferences(defaultPreferences);
    } catch (error) {
      console.error('Failed to load language preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrimaryLanguageChange = (languageCode: string) => {
    setPreferences(prev => ({
      ...prev,
      primary_language: languageCode
    }));
    setHasChanges(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSecondaryLanguageToggle = (languageCode: string) => {
    setPreferences(prev => {
      const isSelected = prev.secondary_languages.includes(languageCode);
      const newSecondaryLanguages = isSelected
        ? prev.secondary_languages.filter(code => code !== languageCode)
        : [...prev.secondary_languages, languageCode];

      return {
        ...prev,
        secondary_languages: newSecondaryLanguages
      };
    });
    setHasChanges(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleInterfaceLanguageChange = (languageCode: string) => {
    setPreferences(prev => ({
      ...prev,
      interface_language: languageCode
    }));
    setHasChanges(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const saveLanguagePreferences = async () => {
    try {
      setIsSaving(true);

      // Save interface language locally
      await AsyncStorage.setItem('app_language', preferences.interface_language);
      
      // For now, we'll just save locally since the API doesn't support language preferences yet
      await AsyncStorage.setItem('primary_language', preferences.primary_language);
      await AsyncStorage.setItem('secondary_languages', JSON.stringify(preferences.secondary_languages));

      const response = { success: true };

      if (response.success) {
        setHasChanges(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Alert.alert(
          'Success',
          'Language preferences have been updated successfully.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Failed to update language preferences');
      }
    } catch (error) {
      console.error('Failed to save language preferences:', error);
      Alert.alert(
        'Error',
        'Failed to save language preferences. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const LanguageOption = ({ 
    language, 
    isSelected, 
    onPress, 
    type = 'primary',
    disabled = false 
  }: {
    language: typeof SUPPORTED_LANGUAGES[0];
    isSelected: boolean;
    onPress: () => void;
    type?: 'primary' | 'secondary' | 'interface';
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary,
        backgroundColor: colors.background.secondary,
        opacity: disabled ? 0.5 : 1
      }}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 24, marginRight: 16 }}>{language.flag}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: colors.text.primary
        }}>{language.name}</Text>
        <Text style={{
          fontSize: 14,
          color: colors.text.secondary
        }}>{language.nativeName}</Text>
      </View>
      <View style={{ marginLeft: 16 }}>
        {type === 'primary' || type === 'interface' ? (
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isSelected ? colors.primary.dark : colors.border.secondary,
            backgroundColor: isSelected ? colors.primary.dark : 'transparent',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
        ) : (
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: isSelected ? colors.primary.dark : colors.border.secondary,
            backgroundColor: isSelected ? colors.primary.dark : 'transparent',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <View style={{
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.background.tertiary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.primary
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary
      }}>{title}</Text>
      <Text style={{
        fontSize: 14,
        color: colors.text.secondary,
        marginTop: 4
      }}>{description}</Text>
    </View>
  );

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
            <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary
          }}>Language Settings</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary.oceanBlue700} />
          <Text style={{
            marginTop: 16,
            color: colors.text.secondary
          }}>Loading language settings...</Text>
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
        borderBottomColor: colors.border.primary
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary
        }}>Language Settings</Text>
        {hasChanges ? (
          <TouchableOpacity 
            onPress={saveLanguagePreferences}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.primary.dark} />
            ) : (
              <Text style={{
                color: colors.primary.dark,
                fontWeight: '500'
              }}>Save</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      <ScrollView 
        style={{ flex: 1, backgroundColor: colors.background.primary }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Interface Language */}
        <SectionHeader
          title="Interface Language"
          description="Choose the language for app menus and interface"
        />
        <View style={{ backgroundColor: colors.background.secondary }}>
          {SUPPORTED_LANGUAGES.map((language) => (
            <LanguageOption
              key={`interface-${language.code}`}
              language={language}
              isSelected={preferences.interface_language === language.code}
              onPress={() => handleInterfaceLanguageChange(language.code)}
              type="interface"
            />
          ))}
        </View>

        {/* Primary Language */}
        <SectionHeader
          title="Primary Language"
          description="Your main language for communication with other users"
        />
        <View style={{ backgroundColor: colors.background.secondary }}>
          {SUPPORTED_LANGUAGES.map((language) => (
            <LanguageOption
              key={`primary-${language.code}`}
              language={language}
              isSelected={preferences.primary_language === language.code}
              onPress={() => handlePrimaryLanguageChange(language.code)}
              type="primary"
            />
          ))}
        </View>

        {/* Secondary Languages */}
        <SectionHeader
          title="Secondary Languages"
          description="Additional languages you can communicate in"
        />
        <View style={{ backgroundColor: colors.background.secondary }}>
          {SUPPORTED_LANGUAGES.map((language) => (
            <LanguageOption
              key={`secondary-${language.code}`}
              language={language}
              isSelected={preferences.secondary_languages.includes(language.code)}
              onPress={() => handleSecondaryLanguageToggle(language.code)}
              type="secondary"
              disabled={preferences.primary_language === language.code}
            />
          ))}
        </View>

        {/* Language Tips */}
        <View className="mx-4 my-6">
          <View style={{
            backgroundColor: colors.primary.oceanBlue50,
            borderWidth: 1,
            borderColor: colors.border.secondary,
            borderRadius: 12,
            padding: 16
          }}>
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <View className="flex-1 ml-3">
                <Text style={{
                  color: colors.primary.oceanBlue700,
                  fontWeight: '500'
                }}>Language Tips</Text>
                <View className="mt-2">
                  <Text style={{
                    color: colors.primary.oceanBlue600,
                    fontSize: 14
                  }}>
                    • Your primary language will be displayed in your profile
                  </Text>
                  <Text style={{
                    color: colors.primary.oceanBlue600,
                    fontSize: 14,
                    marginTop: 4
                  }}>
                    • Secondary languages help you connect with more users
                  </Text>
                  <Text style={{
                    color: colors.primary.oceanBlue600,
                    fontSize: 14,
                    marginTop: 4
                  }}>
                    • Interface language only affects the app's menus and buttons
                  </Text>
                  <Text style={{
                    color: colors.primary.oceanBlue600,
                    fontSize: 14,
                    marginTop: 4
                  }}>
                    • You can change these settings anytime
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Current Selection Summary */}
        <View className="mx-4 mb-6">
          <View style={{
            backgroundColor: colors.background.secondary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border.secondary,
            padding: 16
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: 16
            }}>Current Selection</Text>
            
            <View className="space-y-3">
              <View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: colors.text.secondary,
                  marginBottom: 4
                }}>Interface</Text>
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">
                    {SUPPORTED_LANGUAGES.find(l => l.code === preferences.interface_language)?.flag}
                  </Text>
                  <Text style={{ color: colors.text.primary }}>
                    {SUPPORTED_LANGUAGES.find(l => l.code === preferences.interface_language)?.name}
                  </Text>
                </View>
              </View>

              <View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: colors.text.secondary,
                  marginBottom: 4
                }}>Primary Language</Text>
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">
                    {SUPPORTED_LANGUAGES.find(l => l.code === preferences.primary_language)?.flag}
                  </Text>
                  <Text style={{ color: colors.text.primary }}>
                    {SUPPORTED_LANGUAGES.find(l => l.code === preferences.primary_language)?.name}
                  </Text>
                </View>
              </View>

              {preferences.secondary_languages.length > 0 && (
                <View>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: colors.text.secondary,
                    marginBottom: 4
                  }}>
                    Secondary Languages ({preferences.secondary_languages.length})
                  </Text>
                  <View className="flex-row flex-wrap">
                    {preferences.secondary_languages.map((code) => {
                      const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                      return lang ? (
                        <View key={code} className="flex-row items-center mr-4 mb-2">
                          <Text className="text-lg mr-2">{lang.flag}</Text>
                          <Text style={{
                            color: colors.text.primary,
                            fontSize: 14
                          }}>{lang.name}</Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageSettings;