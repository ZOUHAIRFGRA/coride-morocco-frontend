import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@/contexts/AppStateContext';
import { useUser } from '@/hooks/useUserProfile';
import type { UserStats } from '@/types/user';

const Settings = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, getStats, isLoading } = useUser();
  
  // User statistics state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [rideReminders, setRideReminders] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  
  // Load user statistics on mount
  useEffect(() => {
    loadUserStats();
  }, []);
  
  const loadUserStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await getStats();
      if (response.success && response.data) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(public)/onboarding');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      className="flex-row items-center py-4 px-4 border-b border-gray-100"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="w-10 h-10 rounded-full bg-primary-oceanBlue50 justify-center items-center mr-3">
        <Ionicons name={icon as any} size={wp(5)} color={COLORS.primary.oceanBlue700} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semiBold text-gray-800">{title}</Text>
        {subtitle && (
          <Text className="text-sm font-regular text-gray-500 mt-1">{subtitle}</Text>
        )}
      </View>
      {rightComponent && rightComponent}
      {showArrow && !rightComponent && (
        <Ionicons name="chevron-forward" size={wp(5)} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  const ToggleSettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <SettingItem
      icon={icon}
      title={title}
      subtitle={subtitle}
      showArrow={false}
      rightComponent={
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: COLORS.primary.oceanBlue100 }}
          thumbColor={value ? COLORS.primary.oceanBlue700 : '#9CA3AF'}
        />
      }
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#006389" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Settings</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        {/* User Statistics Dashboard */}
        {userStats && (
          <View className="mt-6 mx-4">
            <View className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl" style={{backgroundColor: '#3B82F6'}}>
              <Text className="text-white text-lg font-bold mb-2">Profile Overview</Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-white text-2xl font-bold">{userStats.profile_completion.toFixed(0)}%</Text>
                  <Text className="text-blue-100 text-xs">Complete</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-2xl font-bold">{userStats.rating_average?.toFixed(1) || '0.0'}</Text>
                  <Text className="text-blue-100 text-xs">Rating</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-2xl font-bold">{userStats.saved_locations}</Text>
                  <Text className="text-blue-100 text-xs">Locations</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Profile & Account Section */}
        <View className="mt-6">
          <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-2">
            Profile & Account
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="person"
              title="Edit Profile"
              subtitle="Update personal information"
              onPress={() => router.push('/profile/profile')}
            />
            <SettingItem
              icon="musical-notes"
              title="Ride Preferences"
              subtitle="Music, conversation, pets & more"
              onPress={() => router.push('/settings/ride-preferences')}
            />
            <SettingItem
              icon="location"
              title="Saved Locations"
              subtitle="Home, work, and favorite places"
              onPress={() => router.push('/settings/locations')}
            />
            <SettingItem
              icon="shield-checkmark"
              title="Document Verification"
              subtitle="Verify identity & driver license"
              onPress={() => router.push('/settings/verification')}
            />
          </View>
        </View>

        {/* Discovery & Social Section */}
        <View className="mt-6">
          <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-2">
            Discovery & Social
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="search"
              title="Find Users"
              subtitle="Discover drivers and passengers"
              onPress={() => router.push('/settings/user-search')}
            />
            <SettingItem
              icon="stats-chart"
              title="My Statistics"
              subtitle="View detailed analytics"
              onPress={() => router.push('/settings/statistics')}
            />
            <SettingItem
              icon="people"
              title="Public Profile"
              subtitle="How others see you"
              onPress={() => router.push('/settings/public-profile')}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View className="mt-6">
          <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-2">
            Notifications
          </Text>
          <View className="bg-white">
            <ToggleSettingItem
              icon="notifications"
              title="Push Notifications"
              subtitle="Receive notifications about rides and messages"
              value={notifications}
              onToggle={setNotifications}
            />
            <ToggleSettingItem
              icon="chatbubbles"
              title="Chat Notifications"
              subtitle="Get notified about new messages"
              value={chatNotifications}
              onToggle={setChatNotifications}
            />
            <ToggleSettingItem
              icon="alarm"
              title="Ride Reminders"
              subtitle="Reminders about upcoming rides"
              value={rideReminders}
              onToggle={setRideReminders}
            />
          </View>
        </View>

        {/* App Preferences Section */}
        <View className="mt-6">
          <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-2">
            App Preferences
          </Text>
          <View className="bg-white">
            <ToggleSettingItem
              icon="location-outline"
              title="Location Services"
              subtitle="Allow location access for better ride matching"
              value={locationServices}
              onToggle={setLocationServices}
            />
            <SettingItem
              icon="globe"
              title="Language"
              subtitle={profile?.preferred_language === 'ar' ? 'العربية' : profile?.preferred_language === 'fr' ? 'Français' : 'English'}
              onPress={() => router.push('/settings/language')}
            />
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Coming soon"
              onPress={() => Alert.alert('Coming Soon', 'Dark mode will be available in a future update')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View className="mt-6">
          <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-2">
            Support
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="help-circle"
              title="Help Center"
              subtitle="Get help with common questions"
              onPress={() => router.push('./settings/help')}
            />
            <SettingItem
              icon="mail"
              title="Contact Support"
              subtitle="Get in touch with our team"
              onPress={() => Alert.alert('Contact Support', 'Email: support@coridemorocco.com\\nPhone: +212 5XX XXX XXX')}
            />
            <SettingItem
              icon="document-text"
              title="Terms & Privacy"
              subtitle="Read our terms and privacy policy"
              onPress={() => router.push('./settings/legal')}
            />
          </View>
        </View>

        {/* App Info Section */}
        <View className="mt-6 mb-8">
          <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-2">
            About
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="information-circle"
              title="App Version"
              subtitle="CoRide Morocco 1.0.0"
              showArrow={false}
            />
            <SettingItem
              icon="star"
              title="Rate CoRide"
              subtitle="Help us improve the app"
              onPress={() => Alert.alert('Rate App', 'Thank you for using CoRide Morocco!')}
            />
            <SettingItem
              icon="refresh"
              title="Refresh Stats"
              subtitle="Update your statistics"
              onPress={loadUserStats}
              rightComponent={isLoadingStats ? <ActivityIndicator size="small" color={COLORS.primary.oceanBlue700} /> : null}
            />
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-4 mb-8">
          <TouchableOpacity
            className="bg-red-500 py-4 rounded-xl flex-row items-center justify-center"
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={wp(5)} color="#FFFFFF" />
            <Text className="text-white font-semiBold text-lg ml-2">
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;