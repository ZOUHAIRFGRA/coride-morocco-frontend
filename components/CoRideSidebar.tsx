import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Dimensions, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { COLORS } from "@/constants/theme";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AppStateContext";
import { useUser } from "@/hooks/useUserProfile";
import { userRoleApiService } from "@/services/userRoleApi";
import type { UserRoleInfo } from "@/types/user";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
// Use 80% of screen width, but cap at 320dp to follow platform guidelines
// This ensures appropriate sizing on phones while preventing full-screen on tablets
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

export type CoRideSidebarProps = {
  isVisible: boolean;
  onClose: () => void;
  onOptionPress?: (option: string) => void;
};

const CoRideSidebar: React.FC<CoRideSidebarProps> = ({
  isVisible,
  onClose,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [imageError, setImageError] = useState(false);
  
  // Reanimated values
  const translateX = useSharedValue(DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);
  
  // Role management state
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo | null>(null);
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Get complete user profile from useUser hook
  const { profile, getProfile } = useUser();
  
  // Use profile data or fallback to auth user
  const userData = profile || user;

  useEffect(() => {
    console.log('CoRideSidebar Reanimated - visibility:', isVisible);
    if (isVisible) {
      // Animate in
      translateX.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Animate out
      translateX.value = withTiming(DRAWER_WIDTH, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isVisible]);

  // Animated styles
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Load user role info on sidebar open
  useEffect(() => {
    if (isVisible) {
      loadUserRoleInfo();
    }
  }, [isVisible]);

  const loadUserRoleInfo = async () => {
    try {
      const response = await userRoleApiService.getUserRole();
      console.log('Loaded role info:', response);
      if (response.success && response.data) {
        setRoleInfo(response.data);
        console.log('setShowRoleSwitcher', response.data.available_roles.length >= 1);
        setShowRoleSwitcher(response.data.available_roles.length >= 1);
        console.log('Role Info:', roleInfo);
      }
    } catch (error) {
      console.error('Error loading role info:', error);
    }
  };

  const handleRoleSwitch = async (newRole: 'rider' | 'driver') => {
    if (isRoleSwitching || !roleInfo || newRole === roleInfo.current_role) {
      return;
    }

    setIsRoleSwitching(true);

    try {
      const response = await userRoleApiService.switchRole(newRole);
      
      if (response.success) {
        // Update local role info
        setRoleInfo(prev => prev ? {
          ...prev,
          current_role: newRole
        } : null);

        // Refresh user profile to get updated data
        await getProfile(true);

        Alert.alert(
          'Role Switched',
          `You are now a ${newRole}. ${newRole === 'driver' ? 'You can now offer rides to passengers.' : 'You can now search and book rides.'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Switch Failed',
          response.error?.message || 'Unable to switch role. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Role switch error:', error);
      Alert.alert(
        'Error',
        'Failed to switch role. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }

    setIsRoleSwitching(false);
  };

  // Use profile_photo_url from user profile with fallback
  const getProfileImageUrl = () => {
    // Check if user profile has a valid profile_photo_url
    if (profile?.profile_photo_url && profile.profile_photo_url.trim() !== "") {
      return profile.profile_photo_url;
    }

    // Use initials-based avatar service for consistency
    const fullName = userData?.first_name && userData?.last_name 
      ? `${userData.first_name} ${userData.last_name}`
      : userData?.first_name || userData?.email || "User";
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0F4C75&color=fff&size=128`;
  };

  // Get formatted user name
  const getFormattedName = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    } else if (userData?.first_name) {
      return userData.first_name;
    }
    return "User";
  };
  
  // Get user role badge
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
      <View className="flex-row items-center justify-center px-2 py-1 rounded-lg mt-2 self-center" style={{ backgroundColor: `${config.color}15` }}>
        <Ionicons name={config.icon as any} size={wp(3)} color={config.color} />
        <Text className="text-sm font-semiBold ml-1" style={{ color: config.color }}>
          {config.label}
        </Text>
      </View>
    );
  };

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  const handleNavigation = (path: string) => {
    try {
      router.push(path as any);
      onClose();
    } catch (error) {
      console.error('Navigation error:', error);
      onClose();
    }
  };

 

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(public)/onboarding");
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      onClose();
    }
  };
  console.log({showRoleSwitcher, roleInfo});

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, drawerStyle]}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.profileImageContainer}
                onPress={() => handleNavigation("/profile/profile")}
              >
                {!imageError ? (
                  <Image
                    source={{ uri: getProfileImageUrl() }}
                    style={styles.profileImage}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Image
                    source={require("@assets/images/mix/user.jpg")}
                    style={styles.profileImage}
                    contentFit="cover"
                  />
                )}
                <View style={styles.profileBadge}>
                  <Ionicons name="person" size={wp(3)} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleNavigation("/profile/profile")}>
                <Text style={styles.userName}>{getFormattedName()}</Text>
                {userData?.phone && (
                  <Text style={styles.userPhone}>{userData.phone}</Text>
                )}
                <Text style={styles.userEmail}>{userData?.email || "No email"}</Text>

                {/* Current Role Badge (when no switching available) */}
                {!showRoleSwitcher && getUserRoleBadge()}

                {/* Verification Status */}
                {userData?.is_verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={wp(3)} color="#10B981" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Role Switcher */}
              {showRoleSwitcher && roleInfo && (
                <View style={styles.roleSwitcherContainer}>
                  <Text style={styles.roleSwitcherTitle}>
                    Switch Mode
                  </Text>
                  
                  <View style={styles.roleSwitcherButtons}>
                    {/* Rider Mode */}
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        roleInfo.current_role === 'rider' && styles.roleButtonActive
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRoleSwitch('rider');
                      }}
                      disabled={isRoleSwitching || roleInfo.current_role === 'rider'}
                      activeOpacity={0.7}
                    >
                      {isRoleSwitching && roleInfo.current_role !== 'rider' ? (
                        <ActivityIndicator size="small" color="#3B82F6" />
                      ) : (
                        <>
                          <Ionicons 
                            name="person" 
                            size={14} 
                            color={roleInfo.current_role === 'rider' ? '#3B82F6' : '#6B7280'} 
                          />
                          <Text 
                            style={[
                              styles.roleButtonText,
                              roleInfo.current_role === 'rider' && styles.roleButtonTextActive
                            ]}
                          >
                            Rider
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Driver Mode */}
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        roleInfo.current_role === 'driver' && styles.roleButtonActiveDriver
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRoleSwitch('driver');
                      }}
                      disabled={isRoleSwitching || roleInfo.current_role === 'driver' || !roleInfo.can_drive}
                      activeOpacity={0.7}
                    >
                      {isRoleSwitching && roleInfo.current_role !== 'driver' ? (
                        <ActivityIndicator size="small" color="#10B981" />
                      ) : (
                        <>
                          <Ionicons 
                            name="car" 
                            size={14} 
                            color={
                              roleInfo.current_role === 'driver' 
                                ? '#10B981' 
                                : roleInfo.can_drive 
                                  ? '#6B7280' 
                                  : '#D1D5DB'
                            } 
                          />
                          <Text 
                            style={[
                              styles.roleButtonText,
                              roleInfo.current_role === 'driver' && styles.roleButtonTextActiveDriver,
                              !roleInfo.can_drive && styles.roleButtonTextDisabled
                            ]}
                          >
                            Driver
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Driver Requirements Info */}
                  {!roleInfo.can_drive && (
                    <TouchableOpacity 
                      style={styles.driverRequirementsButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        Alert.alert(
                          'Driver Requirements',
                          'To become a driver, you need:\n\n• Verified identity document\n• Valid driver\'s license\n• License verification approval\n\nTap to go to verification settings.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Verify Now', 
                              onPress: () => {
                                handleNavigation('/settings/verification');
                              }
                            }
                          ]
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.driverRequirementsContent}>
                        <Ionicons name="information-circle" size={12} color="#F59E0B" />
                        <Text style={styles.driverRequirementsText}>
                          Complete verification to drive
                        </Text>
                        <Ionicons name="chevron-forward" size={10} color="#F59E0B" />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Menu */}
            <View style={styles.menuContainer}>
              <Text style={styles.menuHeader}>MAIN MENU</Text>

              {/* Find Rides */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/rides") && styles.menuItemActive]}
                onPress={() => handleNavigation("/rides/find")}
              >
                <View style={[styles.menuIcon, isActive("/rides") && styles.menuIconActive]}>
                  <Ionicons
                    name="search"
                    size={wp(5)}
                    color={isActive("/rides") ? "#FFFFFF" : COLORS.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, isActive("/rides") && styles.menuTextActive]}>
                  Find Rides
                </Text>
              </TouchableOpacity>

              {/* Offer Ride */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/offer") && styles.menuItemActive]}
                onPress={() => handleNavigation("/rides/offer")}
              >
                <View style={[styles.menuIcon, isActive("/offer") && styles.menuIconActive]}>
                  <Ionicons
                    name="car"
                    size={wp(5)}
                    color={isActive("/offer") ? "#FFFFFF" : COLORS.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, isActive("/offer") && styles.menuTextActive]}>
                  Offer Ride
                </Text>
              </TouchableOpacity>

              {/* My Rides */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/my-rides") && styles.menuItemActive]}
                onPress={() => handleNavigation("/rides/my-rides")}
              >
                <View style={[styles.menuIcon, isActive("/my-rides") && styles.menuIconActive]}>
                  <Ionicons
                    name="list"
                    size={wp(5)}
                    color={isActive("/my-rides") ? "#FFFFFF" : COLORS.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, isActive("/my-rides") && styles.menuTextActive]}>
                  My Rides
                </Text>
              </TouchableOpacity>

              {/* Messages */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/messages") && styles.menuItemActive]}
                onPress={() => handleNavigation("/messages")}
              >
                <View style={[styles.menuIcon, isActive("/messages") && styles.menuIconActive]}>
                  <Ionicons
                    name="chatbubbles"
                    size={wp(5)}
                    color={isActive("/messages") ? "#FFFFFF" : COLORS.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, isActive("/messages") && styles.menuTextActive]}>
                  Messages
                </Text>
              </TouchableOpacity>

              {/* Bookings */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/bookings") && styles.menuItemActive]}
                onPress={() => handleNavigation("/bookings")}
              >
                <View style={[styles.menuIcon, isActive("/bookings") && styles.menuIconActive]}>
                  <Ionicons
                    name="calendar"
                    size={wp(5)}
                    color={isActive("/bookings") ? "#FFFFFF" : COLORS.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, isActive("/bookings") && styles.menuTextActive]}>
                  Bookings
                </Text>
              </TouchableOpacity>

              {/* Trajectory Tribes */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/tribes") && styles.menuItemActive]}
                onPress={() => handleNavigation("/tribes")}
              >
                <View style={[styles.menuIcon, isActive("/tribes") && styles.menuIconActive]}>
                  <Ionicons
                    name="people"
                    size={wp(5)}
                    color={isActive("/tribes") ? "#FFFFFF" : COLORS.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, isActive("/tribes") && styles.menuTextActive]}>
                  Trajectory Tribes
                </Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Profile */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/profile") && styles.menuItemActive]}
                onPress={() => handleNavigation("/profile/profile")}
              >
                <View style={[styles.menuIcon, isActive("/profile") && styles.menuIconActive]}>
                  <Ionicons
                    name="person"
                    size={wp(5)}
                    color={isActive("/profile") ? "#FFFFFF" : COLORS.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, isActive("/profile") && styles.menuTextActive]}>
                  Profile
                </Text>
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/settings") && styles.menuItemActive]}
                onPress={() => handleNavigation("/settings")}
              >
                <View style={[styles.menuIcon, isActive("/settings") && styles.menuIconActive]}>
                  <Ionicons
                    name="settings"
                    size={wp(5)}
                    color={isActive("/settings") ? "#FFFFFF" : COLORS.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, isActive("/settings") && styles.menuTextActive]}>
                  Settings
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={wp(5)} color="#FFFFFF" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: DRAWER_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  profileImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.primary.oceanBlue700,
    position: "relative",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary.oceanBlue700,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  userPhone: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary.oceanBlue700,
    textAlign: "center",
    marginTop: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "center",
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#059669",
    marginLeft: 4,
  },
  roleSwitcherContainer: {
    marginTop: 16,
    width: "100%",
  },
  roleSwitcherTitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  roleSwitcherButtons: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  roleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleButtonActiveDriver: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: 4,
  },
  roleButtonTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  roleButtonTextActiveDriver: {
    color: "#10B981",
    fontWeight: "600",
  },
  roleButtonTextDisabled: {
    color: "#D1D5DB",
  },
  driverRequirementsButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
  },
  driverRequirementsContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverRequirementsText: {
    fontSize: 11,
    color: "#D97706",
    marginLeft: 4,
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 12,
  },
  menuHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: "#EFF6FF",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuIconActive: {
    backgroundColor: COLORS.primary.oceanBlue700,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#414141",
  },
  menuTextActive: {
    fontWeight: "600",
    color: COLORS.primary.oceanBlue700,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#EF4444",
    borderRadius: 12,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CoRideSidebar;
