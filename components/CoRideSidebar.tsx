import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Switch, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { COLORS } from "@/constants/theme";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AppStateContext";
import { useUser } from "@/hooks/useUserProfile";
import { userRoleApiService } from "@/services/userRoleApi";
import type { UserRoleInfo } from "@/types/user";
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { SafeAreaView } from "react-native-safe-area-context";

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
  
  // Role management state
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo | null>(null);
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Get complete user profile from useUser hook
  const { profile, getProfile } = useUser();
  
  // Use profile data or fallback to auth user
  const userData = profile || user;

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
  console.log({showRoleSwitcher, roleInfo})

  return (
    <Drawer
      isOpen={isVisible}
      onClose={() => {
        onClose();
      }}
      size="md"
      anchor="right"
    >
      <DrawerBackdrop />
      <DrawerContent className="px-3">
        <SafeAreaView className="flex-1">
          <DrawerHeader>
            <View className="items-center w-full ">
              <TouchableOpacity
                className="w-16 h-16 rounded-full bg-primary-oceanBlue100/10 justify-center items-center mb-4 relative border-2 border-primary-oceanBlue100"
                onPress={() => handleNavigation("/profile/profile")}
              >
                {!imageError ? (
                  <Image
                    source={{ uri: getProfileImageUrl() }}
                    style={{ width: 64, height: 64, borderRadius: 32 }}                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                    onError={() => setImageError(true)} // 👈 force fallback
                  />
                ) : (
                  <Image
                    source={require("@assets/images/mix/user.jpg")} // 👈 local fallback
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                    contentFit="cover"
                  />
                )}
                <View className="absolute bottom-0 right-0 bg-primary-oceanBlue700 w-5 h-5 rounded-full justify-center items-center border-2 border-white">
                  <Ionicons name="person" size={wp(3)} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigation("/profile/profile")}
              >
                <Text className="text-lg font-semiBold text-[#333] my-2 text-center">
                  {getFormattedName()}
                </Text>
                {userData?.phone && (
                  <Text className="text-md font-medium text-primary-oceanBlue700 text-center mt-1">
                    {userData.phone}
                  </Text>
                )}
                <Text className="text-sm font-regular text-black/60 text-center mt-1">
                  {userData?.email || "No email"}
                </Text>

                {/* Current Role Badge (when no switching available) */}
                {!showRoleSwitcher && getUserRoleBadge()}

                {/* Verification Status */}
                {userData?.is_verified && (
                  <View className="flex-row items-center justify-center bg-emerald-500/15 px-2 py-1 rounded-lg mt-2 self-center">
                    <Ionicons name="checkmark-circle" size={wp(3)} color="#10B981" />
                    <Text className="text-sm font-semiBold text-emerald-600 ml-1">
                      Verified
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Role Switcher - Outside of profile TouchableOpacity */}
              {showRoleSwitcher && roleInfo && (
                <View className="mt-4 w-full">
                  <Text className="text-xs font-medium text-gray-500 text-center mb-3 uppercase">
                    Switch Mode
                  </Text>
                  
                  <View className="flex-row bg-gray-100 rounded-lg p-1">
                    {/* Rider Mode */}
                    <TouchableOpacity
                      className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-md ${
                        roleInfo.current_role === 'rider' ? 'bg-white shadow-sm' : ''
                      }`}
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
                            className={`text-xs font-medium ml-1 ${
                              roleInfo.current_role === 'rider' ? 'text-blue-600' : 'text-gray-500'
                            }`}
                          >
                            Rider
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Driver Mode */}
                    <TouchableOpacity
                      className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-md ${
                        roleInfo.current_role === 'driver' ? 'bg-white shadow-sm' : ''
                      }`}
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
                            className={`text-xs font-medium ml-1 ${
                              roleInfo.current_role === 'driver'
                                ? 'text-emerald-600'
                                : roleInfo.can_drive
                                  ? 'text-gray-500'
                                  : 'text-gray-300'
                            }`}
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
                      className="mt-2 p-2 bg-amber-50 rounded-lg"
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
                      <View className="flex-row items-center">
                        <Ionicons name="information-circle" size={12} color="#F59E0B" />
                        <Text className="text-xs text-amber-600 ml-1 flex-1">
                          Complete verification to drive
                        </Text>
                        <Ionicons name="chevron-forward" size={10} color="#F59E0B" />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>













          </DrawerHeader>


          
          <DrawerBody>
            <View className="px-4 mt-12 mb-2">
              <Text className="text-sm font-semiBold text-gray-500 uppercase">
                Main Menu
              </Text>
            </View>

            {/* Find Rides */}
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 my-2 ${isActive("/rides") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/rides/find")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/rides") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="search"
                  size={wp(5)}
                  color={
                    isActive("/rides")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/rides") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Find Rides
              </Text>
            </TouchableOpacity>

            {/* Offer Ride */}
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 my-2 ${isActive("/offer") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/rides/offer")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/offer") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="car"
                  size={wp(5)}
                  color={
                    isActive("/offer")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/offer") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Offer Ride
              </Text>
            </TouchableOpacity>

            {/* My Rides */}
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 my-2 ${isActive("/my-rides") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/rides/my-rides")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/my-rides") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="list"
                  size={wp(5)}
                  color={
                    isActive("/my-rides")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/my-rides") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                My Rides
              </Text>
            </TouchableOpacity>

            {/* Messages */}
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 my-2 ${isActive("/messages") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/messages")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/messages") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="chatbubbles"
                  size={wp(5)}
                  color={
                    isActive("/messages")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/messages") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Messages
              </Text>
            </TouchableOpacity>

            {/* Bookings */}
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 my-2 ${isActive("/bookings") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/bookings")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/bookings") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="calendar"
                  size={wp(5)}
                  color={
                    isActive("/bookings")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/bookings") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Bookings
              </Text>
            </TouchableOpacity>

            {/* Trajectory Tribes */}
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 my-2 ${isActive("/tribes") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/tribes")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/tribes") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="people"
                  size={wp(5)}
                  color={
                    isActive("/tribes")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/tribes") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Trajectory Tribes
              </Text>
            </TouchableOpacity>

            <View className="h-px bg-black/10 my-4" />

            {/* Profile */}
            <TouchableOpacity
              className={`flex-row items-center  px-4 my-2 ${isActive("/profile") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/profile/profile")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/profile") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="person"
                  size={wp(5)}
                  color={
                    isActive("/profile/profile")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/profile/profile") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Profile
              </Text>
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity
              className={`flex-row  items-center  px-4 my-2 ${isActive("/settings") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/settings")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/settings") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="settings"
                  size={wp(5)}
                  color={
                    isActive("/settings")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/settings") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Settings
              </Text>
            </TouchableOpacity>
          </DrawerBody>
          <DrawerFooter>
            <View className="w-full items-center">
              <TouchableOpacity
                className="flex-row items-center py-3 px-5 bg-red-500 rounded-xl"
                onPress={handleLogout}
              >
                <View className="mr-2">
                  <Ionicons name="log-out" size={wp(5)} color="#FFFFFF" />
                </View>
                <Text className="text-white font-semiBold text-md">
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </DrawerFooter>
        </SafeAreaView>
      </DrawerContent>
    </Drawer>
  );
};

export default CoRideSidebar;
