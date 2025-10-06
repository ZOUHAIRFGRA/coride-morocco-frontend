import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAuth } from '@/contexts/AppStateContext';
import { useUser } from '@/hooks/useUserProfile';
import CoRideSidebar from '@/components/CoRideSidebar';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function MainScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuth();
  const { profile } = useUser();
  const { colors, isDarkMode } = useAppTheme();

  // Use profile data or fallback to auth user
  const userData = profile || user;

  const getWelcomeMessage = () => {
    const firstName = userData?.first_name;
    const hour = new Date().getHours();
    
    let greeting = "Hello";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    return firstName ? `${greeting}, ${firstName}!` : `${greeting}!`;
  };

  const dynamicStyles = createStyles(colors);

  return (
    <>
      <SafeAreaView style={dynamicStyles.container}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.welcomeText}>{getWelcomeMessage()}</Text>
            <Text style={dynamicStyles.subtitle}>Ready to share a ride?</Text>
          </View>
          <TouchableOpacity 
            style={dynamicStyles.menuButton}
            onPress={() => setSidebarVisible(true)}
          >
            <Ionicons name="menu" size={wp(7)} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={dynamicStyles.content}>
          <View style={dynamicStyles.logoContainer}>
            <View style={dynamicStyles.logoCircle}>
              <Ionicons name="car" size={wp(15)} color="#FFFFFF" />
            </View>
            <Text style={dynamicStyles.title}>CoRide Morocco</Text>
          </View>
          
          <Text style={dynamicStyles.description}>
            Share rides, save money, and make new connections across Morocco.
            Whether you're offering a ride or looking for one, we've got you covered.
          </Text>

          {/* Quick Actions */}
          <View style={dynamicStyles.quickActions}>
            <TouchableOpacity style={dynamicStyles.actionButton}>
              <Ionicons name="search" size={wp(8)} color="#FFFFFF" />
              <Text style={dynamicStyles.actionText}>Find a Ride</Text>
            </TouchableOpacity>
            
            {userData?.role === 'driver' && (
              <TouchableOpacity style={[dynamicStyles.actionButton, dynamicStyles.secondaryButton]}>
                <Ionicons name="add-circle" size={wp(8)} color={colors.primary.dark} />
                <Text style={[dynamicStyles.actionText, dynamicStyles.secondaryText]}>Offer a Ride</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stats or Recent Activity */}
          <View style={dynamicStyles.statsContainer}>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>
                {userData?.rating_count || 0}
              </Text>
              <Text style={dynamicStyles.statLabel}>Rides</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>
                {userData?.rating_average?.toFixed(1) || '--'}
              </Text>
              <Text style={dynamicStyles.statLabel}>Rating</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>
                {userData?.is_verified ? '✓' : '✗'}
              </Text>
              <Text style={dynamicStyles.statLabel}>Verified</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Sidebar */}
      <CoRideSidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  quickActions: {
    width: '100%',
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.dark,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.primary.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.primary.dark,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  secondaryText: {
    color: colors.primary.dark,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary.dark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});