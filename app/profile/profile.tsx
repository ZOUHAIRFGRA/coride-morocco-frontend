import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, runOnJS } from "react-native-reanimated";
import { useAuth } from "@/contexts/AppStateContext";
import { useUser } from "@/hooks/useUserProfile";
import { UserProfile } from "@/types/user";
import EditProfile from "./EditProfile";
import { COLORS } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

// Define the type for list items
interface ListItem {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  subtitle?: string;
  action?: () => void;
}

export default function Profile() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { colors, isDarkMode } = useAppTheme();

  // Use the CoRide useUser hook
  const { profile, isLoading: isUserProfileLoading, error: userProfileError, clearError, getProfile } = useUser();
  
  // Use profile data or fallback to auth user
  const userProfile = profile || user;
  const isUserProfileError = !!userProfileError;
  console.log("userProfile >>>>", userProfile);

  // Animation values
  const slideAnimation = useSharedValue(0); // 0 = profile view, 1 = edit view

  // State for editing
  const [isEditing, setIsEditing] = useState(false);

  // State for profile image
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  // Reference to the save function from child component
  const saveProfileRef = useRef<(() => Promise<void>) | null>(null);

  // Initialize profile image when profile loads
  useEffect(() => {
    if ((userProfile as UserProfile)?.profile_photo_url) {
      setProfileImageUrl((userProfile as UserProfile).profile_photo_url!);
    }
  }, [userProfile]);

  // Log the results for testing and clear error if we have valid profile data
  useEffect(() => {
    // console.log("User Profile Data:", userProfile);
    if (isUserProfileError) {
      console.error("User Profile Error:", userProfileError);
      // Clear error if we actually have profile data from auth
      if (userProfile && (profile || user)) {
        clearError();
      }
    }
  }, [userProfile, isUserProfileError, userProfileError, profile, user, clearError]);

  // Animate between view and edit modes
  const toggleEditMode = (edit: boolean) => {
    // Start the animation
    slideAnimation.value = withTiming(
      edit ? 1 : 0,
      {
        duration: 350,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
      () => {
        // This callback is executed after the animation completes
        runOnJS(setIsEditing)(edit);
      }
    );
  };

  // Profile view animated styles
  const profileViewStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      slideAnimation.value,
      [0, 1],
      [0, -300] // Slide out to the left
    );
    const opacity = interpolate(slideAnimation.value, [0, 0.5, 1], [1, 0.5, 0]);

    return {
      transform: [{ translateX }],
      opacity,
      position: "absolute",
      width: "100%",
      height: "100%",
    };
  });

  // Edit view animated styles
  const editViewStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      slideAnimation.value,
      [0, 1],
      [300, 0] // Slide in from the right
    );
    const opacity = interpolate(slideAnimation.value, [0, 0.5, 1], [0, 0.5, 1]);

    return {
      transform: [{ translateX }],
      opacity,
      position: "absolute",
      width: "100%",
      height: "100%",
    };
  });

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/(public)/onboarding");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handler for save button in header
  const handleSavePress = async () => {
    if (saveProfileRef.current) {
      await saveProfileRef.current();
    }
  };

  // Navigate to settings screen
  const navigateToSettings = () => {
    router.push("/settings");
  };

  // Reusable list item component  
  const ProfileListItem = ({ icon, text, subtitle, action }: ListItem) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary,
        backgroundColor: colors.background.secondary
      }}
      onPress={action}
      disabled={!action} // Disable if no action provided
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        backgroundColor: icon === "log-out-outline" 
          ? (isDarkMode ? '#7F1D1D' : '#FEF2F2') 
          : COLORS.primary.oceanBlue50
      }}>
        <Ionicons 
          name={icon} 
          size={wp(5)} 
          color={icon === "log-out-outline" ? "#DC1C13" : COLORS.primary.oceanBlue700} 
        />
      </View>
      <View className="flex-1">
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: icon === "log-out-outline" ? "#DC1C13" : colors.text.primary
        }}>{text}</Text>
        {subtitle && (
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary,
            marginTop: 4
          }}>{subtitle}</Text>
        )}
      </View>
      {icon !== "log-out-outline" && <Ionicons name="chevron-forward" size={wp(5)} color={colors.text.tertiary} />}
    </TouchableOpacity>
  );

  // Define list items for the profile view  
  const profileItems: ListItem[] = [
    {
      icon: "search",
      text: "Find Rides",
      subtitle: "Search for available rides",
      action: () => Alert.alert("Find Rides", "Coming soon! Search for available rides."),
    },
    {
      icon: "car",
      text: "Offer Ride", 
      subtitle: "Post a ride offer",
      action: () => Alert.alert("Offer Ride", "Coming soon! Post a ride offer."),
    },
    {
      icon: "list",
      text: "My Rides",
      subtitle: "View your ride history", 
      action: () => Alert.alert("My Rides", "Coming soon! View your ride history."),
    },
    {
      icon: "chatbubbles",
      text: "Messages",
      subtitle: "Chat with other users",
      action: () => Alert.alert("Messages", "Coming soon! Chat with other users."),
    },
    {
      icon: "calendar", 
      text: "Bookings",
      subtitle: "Manage your ride bookings",
      action: () => Alert.alert("Bookings", "Coming soon! Manage your ride bookings."),
    },
    {
      icon: "notifications-outline",
      text: "Notifications",
      subtitle: "Your notification preferences", 
      action: () => Alert.alert("Notifications", "Your notification preferences"),
    },
    {
      icon: "lock-closed-outline",
      text: "Security & Privacy",
      subtitle: "Your security settings",
      action: () => Alert.alert("Security", "Your security settings"),
    },
    {
      icon: "help-circle-outline",
      text: "Help & Support",
      subtitle: "Contact support",
      action: () => Alert.alert("Help", "Contact support"),
    },
    {
      icon: "log-out-outline",
      text: "Log out",
      action: handleSignOut,
    },
  ];

  // Get image URL with fallback
  const getProfileImageUrl = () => {
    if (profileImageUrl) return profileImageUrl;
    if ((userProfile as UserProfile)?.profile_photo_url) return (userProfile as UserProfile).profile_photo_url;
    
    // Use initials-based avatar service for consistency
    const fullName = userProfile?.first_name && userProfile?.last_name 
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile?.first_name || userProfile?.email || "User";
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0F4C75&color=fff&size=128`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary,
        backgroundColor: colors.background.secondary
      }}>
        <TouchableOpacity onPress={() => (isEditing ? toggleEditMode(false) : router.back())}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary
        }}>{isEditing ? "Edit Profile" : "My Profile"}</Text>
        <TouchableOpacity onPress={isEditing ? handleSavePress : navigateToSettings}>
          <Ionicons name={isEditing ? "checkmark" : "settings-outline"} size={24} color={isEditing ? "#00C853" : colors.primary.dark} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 relative">
        {isUserProfileLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
            <Text style={{
              marginTop: 16,
              color: colors.text.secondary
            }}>Loading profile...</Text>
          </View>
        ) : userProfile ? (
          <>
            {/* Profile View (Animated) */}
            <Animated.View style={profileViewStyle}>
              <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Profile Header */}
                <View className="items-center pt-6 pb-6">
                  <View className="relative">
                  <Image 
                      source={{ uri: getProfileImageUrl() }} 
                      style={{ width: 112, height: 112, borderRadius: 56, borderWidth: 2, borderColor: COLORS.primary.oceanBlue100 }}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                      onError={() => setImageError(true)}
                    />
                    {imageError && (
                      <Image
                        source={require("@assets/images/mix/user.jpg")}
                        style={{ width: 112, height: 112, borderRadius: 56 }}
                        contentFit="cover"
                      />
                    )}
                  </View>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: colors.text.primary,
                    marginTop: 16
                  }}>
                    {userProfile?.first_name && userProfile?.last_name
                      ? `${userProfile.first_name} ${userProfile.last_name}`
                      : userProfile?.first_name || 'User'}
                  </Text>
                  <Text style={{
                    color: colors.text.secondary,
                    marginTop: 4
                  }}>{userProfile?.email || "No email"}</Text>
                  {(userProfile as UserProfile)?.bio && (
                    <Text style={{
                      color: colors.text.secondary,
                      marginTop: 8,
                      textAlign: 'center',
                      paddingHorizontal: 16
                    }}>{(userProfile as UserProfile).bio}</Text>
                  )}
                  <TouchableOpacity 
                    style={{
                      marginTop: 16,
                      backgroundColor: colors.primary.dark,
                      paddingHorizontal: 32,
                      paddingVertical: 12,
                      borderRadius: 24
                    }} 
                    onPress={() => toggleEditMode(true)}
                  >
                    <Text style={{
                      color: '#FFFFFF',
                      fontWeight: '600',
                      fontSize: 16
                    }}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>

                {/* Profile List Items */}
                <View className="px-4 rounded-lg mx-4" style={{ backgroundColor: colors.background.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                  {profileItems.map((item, index) => (
                    <ProfileListItem 
                      key={index} 
                      icon={item.icon} 
                      text={item.text} 
                      subtitle={item.subtitle}
                      action={item.action} 
                    />
                  ))}
                </View>
              </ScrollView>
            </Animated.View>

            {/* Edit View (Moved to separate component) */}
            <EditProfile
              userProfile={userProfile}
              profileImageUrl={profileImageUrl}
              setProfileImageUrl={setProfileImageUrl}
              editViewStyle={editViewStyle}
              toggleEditMode={toggleEditMode}
              onSaveRef={saveProfileRef}
            />
          </>
        ) : (
          // Error or No Profile Data View
          <View className="items-center justify-center py-20 px-4">
            {isUserProfileError ? (
              <>
                <Ionicons name="alert-circle-outline" size={60} color="#DC1C13" />
                <Text style={{
                  color: '#DC1C13',
                  marginTop: 16,
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: '600'
                }}>Error Loading Profile</Text>
                <Text style={{
                  color: colors.text.secondary,
                  marginTop: 8,
                  textAlign: 'center',
                  fontSize: 16
                }}>
                  {userProfileError || "Failed to load profile data. Please check your connection and try again."}
                </Text>
                <TouchableOpacity
                  style={{
                    marginTop: 24,
                    backgroundColor: '#DC1C13',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 24
                  }}
                  onPress={async () => {
                    clearError();
                    await getProfile(true);
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Retry</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="person-circle-outline" size={60} color={colors.text.tertiary} />
                <Text style={{
                  color: colors.text.secondary,
                  marginTop: 16,
                  textAlign: 'center',
                  fontSize: 16
                }}>No profile data available.</Text>
                <TouchableOpacity
                  style={{
                    marginTop: 24,
                    backgroundColor: colors.primary.dark,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 24
                  }}
                  onPress={async () => {
                    await getProfile(true);
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Load Profile</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
