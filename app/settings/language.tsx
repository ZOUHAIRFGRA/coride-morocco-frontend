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
      className={`flex-row items-center p-4 border-b border-gray-100 ${
        disabled ? 'opacity-50' : ''
      }`}
      activeOpacity={0.7}
    >
      <Text className="text-2xl mr-4">{language.flag}</Text>
      <View className="flex-1">
        <Text className="text-lg font-medium text-gray-900">{language.name}</Text>
        <Text className="text-sm text-gray-500">{language.nativeName}</Text>
      </View>
      <View className="ml-4">
        {type === 'primary' || type === 'interface' ? (
          <View className={`w-6 h-6 rounded-full border-2 ${
            isSelected 
              ? 'border-oceanBlue-600 bg-oceanBlue-600' 
              : 'border-gray-300'
          } items-center justify-center`}>
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
        ) : (
          <View className={`w-6 h-6 rounded border-2 ${
            isSelected 
              ? 'border-oceanBlue-600 bg-oceanBlue-600' 
              : 'border-gray-300'
          } items-center justify-center`}>
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <View className="px-4 py-4 bg-gray-50 border-b border-gray-100">
      <Text className="text-lg font-semiBold text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-600 mt-1">{description}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006389" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Language Settings</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text className="mt-4 text-gray-500">Loading language settings...</Text>
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
        <Text className="text-lg font-semibold text-gray-900">Language Settings</Text>
        {hasChanges ? (
          <TouchableOpacity 
            onPress={saveLanguagePreferences}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#006389" />
            ) : (
              <Text className="text-oceanBlue-600 font-medium">Save</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View className="w-12" />
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Interface Language */}
        <SectionHeader
          title="Interface Language"
          description="Choose the language for app menus and interface"
        />
        <View className="bg-white">
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
        <View className="bg-white">
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
        <View className="bg-white">
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
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <View className="flex-1 ml-3">
                <Text className="text-blue-800 font-medium">Language Tips</Text>
                <View className="mt-2">
                  <Text className="text-blue-700 text-sm">
                    • Your primary language will be displayed in your profile
                  </Text>
                  <Text className="text-blue-700 text-sm mt-1">
                    • Secondary languages help you connect with more users
                  </Text>
                  <Text className="text-blue-700 text-sm mt-1">
                    • Interface language only affects the app's menus and buttons
                  </Text>
                  <Text className="text-blue-700 text-sm mt-1">
                    • You can change these settings anytime
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Current Selection Summary */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-xl border border-gray-100 p-4">
            <Text className="text-lg font-semiBold text-gray-900 mb-4">Current Selection</Text>
            
            <View className="space-y-3">
              <View>
                <Text className="text-sm font-medium text-gray-500 mb-1">Interface</Text>
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">
                    {SUPPORTED_LANGUAGES.find(l => l.code === preferences.interface_language)?.flag}
                  </Text>
                  <Text className="text-gray-900">
                    {SUPPORTED_LANGUAGES.find(l => l.code === preferences.interface_language)?.name}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-500 mb-1">Primary Language</Text>
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">
                    {SUPPORTED_LANGUAGES.find(l => l.code === preferences.primary_language)?.flag}
                  </Text>
                  <Text className="text-gray-900">
                    {SUPPORTED_LANGUAGES.find(l => l.code === preferences.primary_language)?.name}
                  </Text>
                </View>
              </View>

              {preferences.secondary_languages.length > 0 && (
                <View>
                  <Text className="text-sm font-medium text-gray-500 mb-1">
                    Secondary Languages ({preferences.secondary_languages.length})
                  </Text>
                  <View className="flex-row flex-wrap">
                    {preferences.secondary_languages.map((code) => {
                      const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                      return lang ? (
                        <View key={code} className="flex-row items-center mr-4 mb-2">
                          <Text className="text-lg mr-2">{lang.flag}</Text>
                          <Text className="text-gray-900 text-sm">{lang.name}</Text>
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