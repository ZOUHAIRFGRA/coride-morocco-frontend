import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { COLORS } from "@/constants/theme";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AppStateContext";
import { useUser } from "@/hooks/useUserProfile";
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
  const { profile } = useUser();
  const [imageError, setImageError] = useState(false);

  // Use profile data (which extends UserResponse) or fallback to auth user
  const userData = profile || user;

  // Get profile image URL
  const getProfileImageUrl = () => {
    // Check if user has a profile picture
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
            <View className="items-center w-full">
              <TouchableOpacity
                className="w-16 h-16 rounded-full bg-primary-oceanBlue100/10 justify-center items-center mb-4 relative border-2 border-primary-oceanBlue100"
                onPress={() => handleNavigation("/(main)/profile")}
              >
                {!imageError ? (
                  <Image
                    source={{ uri: getProfileImageUrl() }}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <View className="w-16 h-16 rounded-full bg-primary-oceanBlue100 justify-center items-center">
                    <Ionicons name="person" size={wp(8)} color={COLORS.primary.oceanBlue700} />
                  </View>
                )}
                <View className="absolute bottom-0 right-0 bg-primary-oceanBlue700 w-5 h-5 rounded-full justify-center items-center border-2 border-white">
                  <Ionicons name="checkmark" size={wp(3)} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigation("/(main)/profile")}
              >
                <Text className="text-lg font-semiBold text-[#333] my-2 text-center">
                  {getFormattedName()}
                </Text>
                <Text className="text-sm font-regular text-black/60 text-center mt-1">
                  {userData?.email || "No email"}
                </Text>

                {getUserRoleBadge()}

                {userData?.is_verified === true && (
                  <View className="flex-row items-center justify-center bg-green-500/15 px-2 py-1 rounded-lg mt-2 self-center">
                    <Ionicons name="checkmark-circle" size={wp(3)} color="#10B981" />
                    <Text className="text-sm font-semiBold text-green-600 ml-1">
                      Verified
                    </Text>
                  </View>
                )}

                {userData?.rating_average && userData?.rating_count && userData.rating_count > 0 && (
                  <View className="flex-row items-center justify-center mt-2">
                    <Ionicons name="star" size={wp(3)} color="#F59E0B" />
                    <Text className="text-sm font-medium text-gray-600 ml-1">
                      {userData.rating_average.toFixed(1)} ({userData.rating_count} reviews)
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </DrawerHeader>
          
          <DrawerBody>
            <View className="px-4 mt-8 mb-2">
              <Text className="text-sm font-semiBold text-gray-500 uppercase">
                CoRide Morocco
              </Text>
            </View>

            {/* My Rides */}
            <TouchableOpacity
              className={`flex-row items-center py-3 px-4 my-2 ${isActive("/rides") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/(main)/rides")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/rides") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="car"
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
                My Rides
              </Text>
            </TouchableOpacity>

            {/* Find a Ride */}
            <TouchableOpacity
              className={`flex-row items-center py-3 px-4 my-2 ${isActive("/search") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/(main)/search")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/search") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="search"
                  size={wp(5)}
                  color={
                    isActive("/search")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/search") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Find a Ride
              </Text>
            </TouchableOpacity>

            {/* Offer a Ride (only for drivers) */}
            {userData?.role === 'driver' && (
              <TouchableOpacity
                className={`flex-row items-center py-3 px-4 my-2 ${isActive("/offer") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
                onPress={() => handleNavigation("/(main)/offer")}
              >
                <View
                  className={`w-10 h-10 rounded-full ${isActive("/offer") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
                >
                  <Ionicons
                    name="add-circle"
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
                  Offer a Ride
                </Text>
              </TouchableOpacity>
            )}

            {/* Messages */}
            <TouchableOpacity
              className={`flex-row items-center py-3 px-4 my-2 ${isActive("/messages") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/(main)/messages")}
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

            <View className="h-px bg-black/10 my-4" />

            {/* Profile */}
            <TouchableOpacity
              className={`flex-row items-center py-3 px-4 my-2 ${isActive("/profile") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/(main)/profile")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/profile") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="person"
                  size={wp(5)}
                  color={
                    isActive("/profile")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/profile") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Profile & Settings
              </Text>
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity
              className={`flex-row items-center py-3 px-4 my-2 ${isActive("/help") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => handleNavigation("/(main)/help")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/help") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="help-circle"
                  size={wp(5)}
                  color={
                    isActive("/help")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/help") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Help & Support
              </Text>
            </TouchableOpacity>
          </DrawerBody>
          
          <DrawerFooter>
            <View className="w-full items-center">
              <TouchableOpacity
                className="flex-row items-center py-3 px-5 bg-red-500 rounded-xl w-full justify-center"
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