import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAuth } from '@/contexts/AppStateContext';
import { useUser } from '@/hooks/useUserProfile';
import CoRideSidebar from '@/components/CoRideSidebar';

export default function MainScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuth();
  const { profile } = useUser();

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

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>{getWelcomeMessage()}</Text>
            <Text style={styles.subtitle}>Ready to share a ride?</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setSidebarVisible(true)}
          >
            <Ionicons name="menu" size={wp(7)} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="car" size={wp(15)} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>CoRide Morocco</Text>
          </View>
          
          <Text style={styles.description}>
            Share rides, save money, and make new connections across Morocco.
            Whether you're offering a ride or looking for one, we've got you covered.
          </Text>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="search" size={wp(8)} color="#FFFFFF" />
              <Text style={styles.actionText}>Find a Ride</Text>
            </TouchableOpacity>
            
            {userData?.role === 'driver' && (
              <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                <Ionicons name="add-circle" size={wp(8)} color="#0F4C75" />
                <Text style={[styles.actionText, styles.secondaryText]}>Offer a Ride</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stats or Recent Activity */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userData?.rating_count || 0}
              </Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userData?.rating_average?.toFixed(1) || '--'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userData?.is_verified ? '✓' : '✗'}
              </Text>
              <Text style={styles.statLabel}>Verified</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#0F4C75',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0F4C75',
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
    color: '#2C3E50',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
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
    backgroundColor: '#0F4C75',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#0F4C75',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0F4C75',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  secondaryText: {
    color: '#0F4C75',
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
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
    color: '#0F4C75',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});