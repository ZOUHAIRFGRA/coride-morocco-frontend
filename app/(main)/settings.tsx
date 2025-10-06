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
import { useAppTheme } from '@/hooks/useAppTheme';
import type { UserStats } from '@/types/user';
import type { ThemeMode } from '@/contexts/ThemeContext';
import PremiumModal from '@/components/modals/PremiumModal';

const Settings = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, getStats, isLoading } = useUser();
  const { isDarkMode, themeMode, setThemeMode, colors } = useAppTheme();
  
  // User statistics state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [rideReminders, setRideReminders] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
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

  const handleThemeSelection = () => {
    const getThemeDisplayName = (mode: ThemeMode) => {
      switch (mode) {
        case 'light': return 'Light';
        case 'dark': return 'Dark';
        case 'system': return 'System Default';
      }
    };

    Alert.alert(
      'Choose Theme',
      'Select your preferred theme for the app',
      [
        {
          text: 'Light',
          onPress: () => setThemeMode('light'),
          style: themeMode === 'light' ? 'default' : 'default'
        },
        {
          text: 'Dark',
          onPress: () => setThemeMode('dark'),
          style: themeMode === 'dark' ? 'default' : 'default'
        },
        {
          text: 'System Default',
          onPress: () => setThemeMode('system'),
          style: themeMode === 'system' ? 'default' : 'default'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const getThemeSubtitle = () => {
    switch (themeMode) {
      case 'light': return 'Always use light theme';
      case 'dark': return 'Always use dark theme';
      case 'system': return `Auto (currently ${isDarkMode ? 'dark' : 'light'})`;
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
      className="flex-row items-center py-4 px-4 border-b"
      style={{ borderColor: colors.border.primary }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View 
        className="w-10 h-10 rounded-full justify-center items-center mr-3"
        style={{ backgroundColor: colors.primary.oceanBlue50 }}
      >
        <Ionicons name={icon as any} size={wp(5)} color={colors.primary.oceanBlue700} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semiBold" style={{ color: colors.text.primary }}>{title}</Text>
        {subtitle && (
          <Text className="text-sm font-regular mt-1" style={{ color: colors.text.secondary }}>{subtitle}</Text>
        )}
      </View>
      {rightComponent && rightComponent}
      {showArrow && !rightComponent && (
        <Ionicons name="chevron-forward" size={wp(5)} color={colors.text.tertiary} />
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
          trackColor={{ 
            false: colors.border.secondary, 
            true: colors.primary.oceanBlue100 
          }}
          thumbColor={value ? colors.primary.oceanBlue700 : colors.text.tertiary}
        />
      }
    />
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b" style={{ borderColor: colors.border.primary }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.oceanBlue700} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: colors.text.primary }}>Settings</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        {/* User Statistics Dashboard */}
        {userStats && (
          <View className="mt-6 mx-4">
            <View className="p-4 rounded-xl" style={{backgroundColor: colors.primary.oceanBlue700}}>
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
          <Text className="text-sm font-semiBold uppercase px-4 mb-2" style={{ color: colors.text.secondary }}>
            Profile & Account
          </Text>
          <View style={{ backgroundColor: colors.surface.primary }}>
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
          <Text className="text-sm font-semiBold uppercase px-4 mb-2" style={{ color: colors.text.secondary }}>
            Discovery & Social
          </Text>
          <View style={{ backgroundColor: colors.surface.primary }}>
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
          <Text className="text-sm font-semiBold uppercase px-4 mb-2" style={{ color: colors.text.secondary }}>
            Notifications
          </Text>
          <View style={{ backgroundColor: colors.surface.primary }}>
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
          <Text className="text-sm font-semiBold uppercase px-4 mb-2" style={{ color: colors.text.secondary }}>
            App Preferences
          </Text>
          <View style={{ backgroundColor: colors.surface.primary }}>
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
              onPress={() => router.push('../settings/language')}
            />
            <SettingItem
              icon="moon"
              title="Theme"
              subtitle={getThemeSubtitle()}
              onPress={handleThemeSelection}
            />
          </View>
        </View>

        {/* Support Section */}
        <View className="mt-6">
          <Text className="text-sm font-semiBold uppercase px-4 mb-2" style={{ color: colors.text.secondary }}>
            Support
          </Text>
          <View style={{ backgroundColor: colors.surface.primary }}>
            <SettingItem
              icon="help-circle"
              title="Help Center"
              subtitle="Get help with common questions"
              onPress={() => router.push('../settings/help')}
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
              onPress={() => router.push('../settings/legal')}
            />
          </View>
        </View>

        {/* App Info Section */}
        <View className="mt-6 mb-8">
          <Text className="text-sm font-semiBold uppercase px-4 mb-2" style={{ color: colors.text.secondary }}>
            About
          </Text>
          <View style={{ backgroundColor: colors.surface.primary }}>
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
            <SettingItem
              icon="ribbon"
              title="Go Premium"
              subtitle="Unlock exclusive features"
              onPress={() => setIsPremiumModalVisible(true)}
            />
            <PremiumModal 
              visible={isPremiumModalVisible} 
              onClose={() => setIsPremiumModalVisible(false)} 
            />
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-4 mb-8">
          <TouchableOpacity
            className="py-4 rounded-xl flex-row items-center justify-center"
            style={{ backgroundColor: '#EF4444' }}
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