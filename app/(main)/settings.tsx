import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@/contexts/AppStateContext';

const Settings = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [rideReminders, setRideReminders] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);

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
        {/* Account Section */}
        <View className="mt-6">
          <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-2">
            Account
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="person"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => router.push('/profile/EditProfile')}
            />
            <SettingItem
              icon="shield-checkmark"
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              onPress={() => console.log('Privacy settings')}
            />
            <SettingItem
              icon="card"
              title="Payment Methods"
              subtitle="Manage cards and payment options"
              onPress={() => console.log('Payment methods')}
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

        {/* Preferences Section */}
        <View className="mt-6">
          <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-2">
            Preferences
          </Text>
          <View className="bg-white">
            <ToggleSettingItem
              icon="location"
              title="Location Services"
              subtitle="Allow location access for better ride matching"
              value={locationServices}
              onToggle={setLocationServices}
            />
            <SettingItem
              icon="globe"
              title="Language"
              subtitle="العربية"
              onPress={() => console.log('Language settings')}
            />
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Coming soon"
              onPress={() => console.log('Dark mode')}
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
              onPress={() => console.log('Help center')}
            />
            <SettingItem
              icon="mail"
              title="Contact Support"
              subtitle="Get in touch with our team"
              onPress={() => console.log('Contact support')}
            />
            <SettingItem
              icon="document-text"
              title="Terms & Privacy"
              subtitle="Read our terms and privacy policy"
              onPress={() => console.log('Terms and privacy')}
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
              subtitle="1.0.0"
              showArrow={false}
            />
            <SettingItem
              icon="star"
              title="Rate CoRide"
              subtitle="Help us improve the app"
              onPress={() => console.log('Rate app')}
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