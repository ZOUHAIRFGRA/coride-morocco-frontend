import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { COLORS } from "@/constants/theme";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@hooks/useAuth";
import { useAppSection } from "@hooks/useAppSection";
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@hooks/useUser";

export type SidebarProps = {
  isVisible: boolean;
  onClose: () => void;
  onOptionPress?: (option: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  isVisible,
  onClose,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { getDefaultPathForSection } = useAppSection();
  const [imageError, setImageError] = useState(false);

  // Get complete user profile from useUser hook
  const { profile: userProfile } = useUser();

  // Use profileImage from user profile with fallback
  const getProfileImageUrl = () => {
    // Check if user profile has a valid profileImage
    if (userProfile?.profileImage && userProfile.profileImage.trim() !== "") {
      return userProfile.profileImage;
    }

    // Use pravatar.cc for dummy image based on email for consistency
    const emailHash = userProfile?.email
      ? encodeURIComponent(userProfile?.email)
      : "default";
    return `https://i.pravatar.cc/150?u=${emailHash}`;
  };

  // Get formatted user name
  const getFormattedName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    } else if (userProfile?.firstName) {
      return userProfile.firstName;
    } else if (userProfile?.handle) {
      return `@${userProfile.handle}`;
    }
    return "User";
  };

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  const handleNavigation = (path: string) => {
    router.push(path as any);
    onClose();
  };

  const navigateToSection = (
    section: "investment" | "budgeting" | "bookkeeping"
  ) => {
    const path = getDefaultPathForSection(section);
    router.push(path as any);
    onClose();
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(public)/onboarding" as any);
    onClose();
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
                {userProfile?.handle && (
                  <Text className="text-md font-medium text-primary-oceanBlue700 text-center mt-1">
                    @{userProfile.handle}
                  </Text>
                )}
                <Text className="text-sm font-regular text-black/60 text-center mt-1">
                  {userProfile?.email || "No email"}
                </Text>

                {userProfile?.isPremium && (
                  <View className="flex-row items-center justify-center bg-amber-500/15 px-2 py-1 rounded-lg mt-3 self-center">
                    <Ionicons name="star" size={wp(3)} color="#F59E0B" />
                    <Text className="text-md font-semiBold text-amber-500 ml-1">
                      Premium
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </DrawerHeader>
          <DrawerBody>
            <View className="px-4 mt-12 mb-2">
              <Text className="text-sm font-semiBold text-gray-500 uppercase">
                Choose an app
              </Text>
            </View>

            {/* Investment */}
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 my-2 ${isActive("/investment") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => navigateToSection("investment")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/investment") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="trending-up"
                  size={wp(5)}
                  color={
                    isActive("/investment")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/investment") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Investment
              </Text>
            </TouchableOpacity>

            {/* Budgeting */}
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 my-2 ${isActive("/budgeting") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => navigateToSection("budgeting")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/budgeting") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="wallet"
                  size={wp(5)}
                  color={
                    isActive("/budgeting")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/budgeting") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Budgeting
              </Text>
            </TouchableOpacity>

            {/* Bookkeeping */}
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 my-2 ${isActive("/bookkeeping") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => navigateToSection("bookkeeping")}
            >
              <View
                className={`w-10 h-10 rounded-full ${isActive("/bookkeeping") ? "bg-primary-oceanBlue700" : "bg-primary-oceanBlue50"} justify-center items-center mr-3`}
              >
                <Ionicons
                  name="book"
                  size={wp(5)}
                  color={
                    isActive("/bookkeeping")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/bookkeeping") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Bookkeeping
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
                    isActive("/profile")
                      ? "#FFFFFF"
                      : COLORS.primary.oceanBlue700
                  }
                />
              </View>
              <Text
                className={`text-md ${isActive("/profile") ? "font-semiBold text-primary-oceanBlue700" : "font-medium text-[#414141]"}`}
              >
                Profile
              </Text>
            </TouchableOpacity>

            {/* Settings - Single button for all settings */}
            <TouchableOpacity
              className={`flex-row  items-center  px-4 my-2 ${isActive("/settings") ? "bg-primary-oceanBlue50 rounded-xl" : ""}`}
              onPress={() => {
                const currentSection = pathname?.includes("/investment")
                  ? "/investment/settings/settings"
                  : pathname?.includes("/budgeting")
                    ? "/budgeting/settings/settings"
                    : pathname?.includes("/bookkeeping")
                      ? "/bookkeeping/settings/settings"
                      : "/budgeting/settings/settings";
                handleNavigation(currentSection);
              }}
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

export default Sidebar;
