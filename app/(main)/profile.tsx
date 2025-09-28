import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAuth } from '@/contexts/AppStateContext';
import { useUser } from '@/hooks/useUserProfile';
import type { UserStats, UserPreferences } from '@/types/user';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { 
    profile, 
    getProfile, 
    getStats, 
    getPreferences,
    isLoading, 
    error 
  } = useUser();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Use profile data or fallback to auth user
  const userData = profile || user;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getProfile(true),
        loadStats(),
        loadPreferences()
      ]);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [getProfile]);

  const loadStats = async () => {
    try {
      const response = await getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await getPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  useEffect(() => {
    loadStats();
    loadPreferences();
  }, []);

  const getProfileImageUrl = () => {
    if (profile?.profile_photo_url) {
      return profile.profile_photo_url;
    }

    const fullName = userData?.first_name && userData?.last_name 
      ? `${userData.first_name} ${userData.last_name}`
      : userData?.first_name || userData?.email || "User";
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0F4C75&color=fff&size=200`;
  };

  const getUserRoleBadge = () => {
    const role = userData?.role;
    if (!role) return null;

    const roleConfig = {
      driver: { icon: "car", color: "#10B981", label: "Driver" },
      rider: { icon: "person", color: "#3B82F6", label: "Rider" },
      admin: { icon: "shield-checkmark", color: "#F59E0B", label: "Admin" },
      moderator: { icon: "settings", color: "#8B5CF6", label: "Moderator" }
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    if (!config) return null;

    return (
      <View style={[styles.badge, { backgroundColor: `${config.color}15` }]}>
        <Ionicons name={config.icon as any} size={wp(4)} color={config.color} />
        <Text style={[styles.badgeText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile & Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: getProfileImageUrl() }}
              style={styles.profileImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <View style={styles.verificationBadge}>
              <Ionicons 
                name={userData?.is_verified ? "checkmark-circle" : "time"} 
                size={wp(5)} 
                color={userData?.is_verified ? "#10B981" : "#F59E0B"} 
              />
            </View>
          </View>

          <Text style={styles.userName}>
            {userData?.first_name && userData?.last_name
              ? `${userData.first_name} ${userData.last_name}`
              : userData?.first_name || 'User'}
          </Text>
          
          <Text style={styles.userEmail}>{userData?.email}</Text>
          
          {getUserRoleBadge()}

          {userData?.rating_average && userData.rating_count > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={wp(4)} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {userData.rating_average.toFixed(1)} ({userData.rating_count} reviews)
              </Text>
            </View>
          )}
        </View>

        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.profile_completion.toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>Profile Complete</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.saved_locations}
              </Text>
              <Text style={styles.statLabel}>Saved Locations</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {new Date(stats.member_since).getFullYear()}
              </Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="person" size={wp(6)} color="#0F4C75" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Edit Profile</Text>
              <Text style={styles.actionSubtitle}>Update your basic information</Text>
            </View>
            <Ionicons name="chevron-forward" size={wp(5)} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="settings" size={wp(6)} color="#0F4C75" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ride Preferences</Text>
              <Text style={styles.actionSubtitle}>Music, conversation, pets & more</Text>
            </View>
            <Ionicons name="chevron-forward" size={wp(5)} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="location" size={wp(6)} color="#0F4C75" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Saved Locations</Text>
              <Text style={styles.actionSubtitle}>Home, work & favorite places</Text>
            </View>
            <Ionicons name="chevron-forward" size={wp(5)} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="shield-checkmark" size={wp(6)} color="#0F4C75" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Verification</Text>
              <Text style={styles.actionSubtitle}>Upload ID & driver license</Text>
            </View>
            <Ionicons name="chevron-forward" size={wp(5)} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Verification Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Status</Text>
          
          <View style={styles.verificationGrid}>
            <View style={styles.verificationItem}>
              <Ionicons 
                name={userData?.email_verified ? "checkmark-circle" : "close-circle"} 
                size={wp(8)} 
                color={userData?.email_verified ? "#10B981" : "#EF4444"} 
              />
              <Text style={styles.verificationLabel}>Email</Text>
            </View>
            
            <View style={styles.verificationItem}>
              <Ionicons 
                name={userData?.phone_verified ? "checkmark-circle" : "close-circle"} 
                size={wp(8)} 
                color={userData?.phone_verified ? "#10B981" : "#EF4444"} 
              />
              <Text style={styles.verificationLabel}>Phone</Text>
            </View>
            
            <View style={styles.verificationItem}>
              <Ionicons 
                name={userData?.is_verified ? "checkmark-circle" : "close-circle"} 
                size={wp(8)} 
                color={userData?.is_verified ? "#10B981" : "#EF4444"} 
              />
              <Text style={styles.verificationLabel}>Identity</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={wp(6)} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: '#F3F4F6',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: wp(3),
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F4C75',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  actionItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: wp(12),
    height: wp(12),
    backgroundColor: '#F0F9FF',
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  verificationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  verificationItem: {
    alignItems: 'center',
  },
  verificationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});